import { useState, useEffect, useRef, useCallback } from 'react';
import type React from 'react';
import { Task } from '~/models/Task';

interface SSEStatusEvent {
  step: 'validating' | 'fetching_braindump' | 'streaming' | 'completed';
}

interface TaskInfoChunk {
  type: 'task_info';
  id: string;
  task_index: number;
  data: {
    title: string;
    description: string;
  };
}

interface TagChunk {
  type: 'tag';
  task_index: number;
  data: {
    name: string;
    contribution_weight: number;
  };
}

interface StepChunk {
  type: 'step';
  id: string;
  parent_task_id: string;
  data: {
    title: string;
    description: string;
    deadline?: string;
  };
}

export interface ScopeFull {
  objective: string;
  why_now: string[];
  definition_of_done: string[];
  constraints: string[];
  out_of_scope: string[];
  risk_if_ignored: string[];
}

export interface ScopeView {
  objective: string;
  why_now: string;
  definition_of_done: string[];
  out_of_scope: string[];
}

interface TaskScopeChunk {
  type: 'task_scope';
  task_index: number;
  scope_full: ScopeFull;
  scope_view: ScopeView;
  decision: {
    should_split_into_tasks: boolean;
    reason: string;
  };
}

interface CategoryEnrichmentEvent {
  type: 'category_enrichment';
  id: string;
  data: {
    category_id: string;
    sys_est_minutes: number;
  };
}

interface DifficultyEnrichmentEvent {
  type: 'difficulty_enrichment';
  id: string;
  data: {
    difficulty: number;
  };
}

interface ErrorEvent {
  braindump_id: string;
  user_id: string;
  status: string;
  error: string;
}

export interface StreamingTask {
  id: string;
  title: string;
  description: string;
  steps?: StreamingStep[];
  tags?: StreamingTag[];
  isStreaming?: boolean;
  status?: Task['status'];
  priority?: Task['priority'];
  expectedTimeHours?: number | null;
  scopeFull?: ScopeFull;
  scopeView?: ScopeView;
  decision?: {
    shouldSplitIntoTasks: boolean;
    reason: string;
  };
}

export interface StreamingTag {
  name: string;
  contribution_weight?: number;
}

export interface StreamingStep {
  id: string;
  taskId: string;
  title: string;
  description?: string | null;
  sysEstMinutes?: number | null;
  difficulty?: number | null;
  orderIndex?: number | null;
  isDone?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// Helper function to handle SSE events
// Uses tasksMapRef (a synchronous ref) to track the latest tasks state,
// avoiding React's async batching which causes stale data in production builds.
function handleSSEEvent(
  event: string,
  data: any,
  setTasks: React.Dispatch<React.SetStateAction<Map<string, StreamingTask>>>,
  setStatus: React.Dispatch<React.SetStateAction<SSEStatusEvent['step'] | null>>,
  setError: React.Dispatch<React.SetStateAction<string | null>>,
  setIsStreaming: React.Dispatch<React.SetStateAction<boolean>>,
  currentTaskIdRef: { current: string | null },
  taskIndexToIdMapRef: React.MutableRefObject<Map<number, string>>,
  tasksMapRef: React.MutableRefObject<Map<string, StreamingTask>>,
  onCompleted?: (tasks: StreamingTask[]) => void,
) {
  switch (event) {
    case 'status': {
      const statusData: SSEStatusEvent = data;
      console.log('[Stream] Status:', statusData.step);
      setStatus(statusData.step);
      if (statusData.step === 'completed') {
        console.log('[Stream] Completed! Total tasks:', tasksMapRef.current.size);
        // Log scope status for each task
        for (const [, task] of tasksMapRef.current) {
          console.log('[Stream] Task:', task.title, '| hasScope:', !!task.scopeFull, '| scopeKeys:', task.scopeFull ? Object.keys(task.scopeFull) : 'none');
        }
        setIsStreaming(false);
        // Read from the synchronous ref which always has the latest data
        if (onCompleted && tasksMapRef.current.size > 0) {
          const tasksArray = Array.from(tasksMapRef.current.values());
          console.log('[Stream] Calling onCompleted with', tasksArray.length, 'tasks, scoped:', tasksArray?.filter(t => !!t.scopeFull).length);
          onCompleted(tasksArray);
        } else {
          console.warn('[Stream] onCompleted missing or no tasks!', { hasCallback: !!onCompleted, size: tasksMapRef.current.size });
        }
      }
      break;
    }

    case 'llm_chunk': {
      const chunkData: { chunk: string } = data;
      const chunk = JSON.parse(chunkData.chunk);

      if (chunk.type === 'task_info') {
        const taskChunk = chunk as TaskInfoChunk;
        console.log('[Stream] New task:', taskChunk.data.title, 'at index:', taskChunk.task_index);
        taskIndexToIdMapRef.current.set(taskChunk.task_index, taskChunk.id);
        currentTaskIdRef.current = taskChunk.id;

        const newTask: StreamingTask = {
          id: taskChunk.id,
          title: taskChunk.data.title,
          description: taskChunk.data.description,
          steps: [],
          tags: [],
          isStreaming: true,
        };
        // Update ref synchronously
        tasksMapRef.current = new Map(tasksMapRef.current);
        tasksMapRef.current.set(taskChunk.id, newTask);
      } else if (chunk.type === 'tag') {
        const tagChunk = chunk as TagChunk;
        const taskId = taskIndexToIdMapRef.current.get(tagChunk.task_index);
        console.log('[Stream] New tag:', tagChunk.data.name, 'for task_index:', tagChunk.task_index, 'taskId:', taskId);

        if (taskId) {
          const task = tasksMapRef.current.get(taskId);
          if (task) {
            const updatedTask = {
              ...task,
              tags: [
                ...(task.tags || []),
                {
                  name: tagChunk.data.name,
                  contribution_weight: tagChunk.data.contribution_weight,
                },
              ],
            };
            tasksMapRef.current = new Map(tasksMapRef.current);
            tasksMapRef.current.set(taskId, updatedTask);
            console.log('[Stream] Task now has', updatedTask.tags.length, 'tags');
          }
        }
      } else if (chunk.type === 'step') {
        const stepChunk = chunk as StepChunk;
        const task = tasksMapRef.current.get(stepChunk.parent_task_id);

        if (task) {
          const currentSteps = task.steps || [];
          const newStep: StreamingStep = {
            id: stepChunk.id,
            taskId: stepChunk.parent_task_id,
            title: stepChunk.data.title,
            description: stepChunk.data.description,
            orderIndex: currentSteps.length,
          };
          const updatedTask = {
            ...task,
            steps: [...currentSteps, newStep],
          };
          tasksMapRef.current = new Map(tasksMapRef.current);
          tasksMapRef.current.set(stepChunk.parent_task_id, updatedTask);
        }
      } else if (chunk.type === 'task_scope') {
        const scopeChunk = chunk as TaskScopeChunk;
        const taskId = taskIndexToIdMapRef.current.get(scopeChunk.task_index);
        console.log('[Stream] New task_scope for task_index:', scopeChunk.task_index, 'taskId:', taskId);

        if (taskId) {
          const task = tasksMapRef.current.get(taskId);
          if (task) {
            const updatedTask = {
              ...task,
              scopeFull: scopeChunk.scope_full,
              scopeView: scopeChunk.scope_view,
              decision: {
                shouldSplitIntoTasks: scopeChunk.decision.should_split_into_tasks,
                reason: scopeChunk.decision.reason,
              },
            };
            tasksMapRef.current = new Map(tasksMapRef.current);
            tasksMapRef.current.set(taskId, updatedTask);
            console.log('[Stream] Task scope updated for:', taskId);
          }
        }
      }

      // Sync ref to React state for UI updates
      const latestMap = tasksMapRef.current;
      setTasks(latestMap);
      break;
    }

    case 'category_enrichment': {
      const categoryData: CategoryEnrichmentEvent = data;
      let updated = false;

      for (const [taskId, task] of tasksMapRef.current) {
        const stepIndex = task.steps?.findIndex(s => s.id === categoryData.id);
        if (stepIndex !== undefined && stepIndex >= 0 && task.steps) {
          const updatedSteps = [...task.steps];
          updatedSteps[stepIndex] = {
            ...updatedSteps[stepIndex],
            sysEstMinutes: categoryData.data.sys_est_minutes,
          };

          const totalSysEstMinutes = updatedSteps.reduce((sum, step) => sum + (step.sysEstMinutes || 0), 0);
          const expectedTimeHours = totalSysEstMinutes > 0 ? totalSysEstMinutes / 60 : null;

          tasksMapRef.current = new Map(tasksMapRef.current);
          tasksMapRef.current.set(taskId, {
            ...task,
            steps: updatedSteps,
            expectedTimeHours,
          });
          updated = true;
          break;
        }
      }

      if (updated) {
        setTasks(tasksMapRef.current);
      }
      break;
    }

    case 'difficulty_enrichment': {
      const difficultyData: DifficultyEnrichmentEvent = data;
      let updated = false;

      for (const [taskId, task] of tasksMapRef.current) {
        const stepIndex = task.steps?.findIndex(s => s.id === difficultyData.id);
        if (stepIndex !== undefined && stepIndex >= 0 && task.steps) {
          const updatedSteps = [...task.steps];
          updatedSteps[stepIndex] = {
            ...updatedSteps[stepIndex],
            difficulty: difficultyData.data.difficulty,
          };

          tasksMapRef.current = new Map(tasksMapRef.current);
          tasksMapRef.current.set(taskId, {
            ...task,
            steps: updatedSteps,
          });
          updated = true;
          break;
        }
      }

      if (updated) {
        setTasks(tasksMapRef.current);
      }
      break;
    }

    case 'error': {
      const errorData: ErrorEvent = data;
      setError(errorData.error);
      setIsStreaming(false);
      break;
    }
  }
}

interface UseAISplitterStreamParams {
  braindumpId: string;
  userId?: string;
  enabled?: boolean;
  onCompleted?: (tasks: StreamingTask[]) => void;
}

interface UseAISplitterStreamReturn {
  tasks: StreamingTask[];
  status: SSEStatusEvent['step'] | null;
  error: string | null;
  isStreaming: boolean;
  startStream: () => void;
}

export const useAISplitterStream = ({
  braindumpId,
  userId,
  enabled = false,
  onCompleted,
}: UseAISplitterStreamParams): UseAISplitterStreamReturn => {
  const [tasks, setTasks] = useState<Map<string, StreamingTask>>(new Map());
  const [status, setStatus] = useState<SSEStatusEvent['step'] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const eventSourceRef = useRef<EventSource | null>(null);
  const hasStartedRef = useRef(false);
  const currentTaskIdRef = useRef<string | null>(null);
  const taskIndexToIdMapRef = useRef<Map<number, string>>(new Map());
  // Synchronous ref that mirrors the tasks state - avoids React batching race conditions
  const tasksMapRef = useRef<Map<string, StreamingTask>>(new Map());
  // Ref for onCompleted to avoid stale closure in the fetch callback
  const onCompletedRef = useRef(onCompleted);
  onCompletedRef.current = onCompleted;

  const startStream = useCallback(() => {
    if (hasStartedRef.current || !braindumpId) {
      console.log('[Stream] Already started or missing params:', {
        hasStarted: hasStartedRef.current,
        braindumpId,
        userId
      });
      return;
    }

    console.log('[Stream] Starting stream for braindump:', braindumpId);
    hasStartedRef.current = true;
    setIsStreaming(true);
    setError(null);
    // Clear maps for a fresh stream
    taskIndexToIdMapRef.current.clear();
    tasksMapRef.current = new Map();

    const aiServiceUrl = process.env.NEXT_PUBLIC_AI_SERVICE_URL || 'http://217.216.111.217:8041';
    const apiKey = process.env.NEXT_PUBLIC_AI_SERVICE_API_KEY || '';

    const controller = new AbortController();

    fetch(`${aiServiceUrl}/splitter/stream`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': apiKey,
      },
      body: JSON.stringify({
        braindump_id: braindumpId,
        user_id: userId,
      }),
      signal: controller.signal,
    })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const reader = response.body?.getReader();
        const decoder = new TextDecoder();

        if (!reader) {
          throw new Error('No response body');
        }

        let buffer = '';
        // IMPORTANT: currentEvent must persist across reader.read() calls.
        // Long data lines (like task_scope) can be split across chunks,
        // with the event: line in one chunk and data: line in the next.
        let currentEvent = '';

        while (true) {
          const { done, value } = await reader.read();

          if (done) {
            setIsStreaming(false);
            break;
          }

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            if (line.startsWith('event: ')) {
              currentEvent = line.slice(7).trim();
            } else if (line.startsWith('data: ')) {
              const data = JSON.parse(line.slice(6));

              handleSSEEvent(
                currentEvent,
                data,
                setTasks,
                setStatus,
                setError,
                setIsStreaming,
                currentTaskIdRef,
                taskIndexToIdMapRef,
                tasksMapRef,
                onCompletedRef.current,
              );
            }
          }
        }
      })
      .catch((error) => {
        if (error.name !== 'AbortError') {
          setError(error.message || 'Connection error occurred');
          setIsStreaming(false);
        }
      });

    // Store cleanup function
    eventSourceRef.current = {
      close: () => controller.abort(),
    } as any;
  }, [braindumpId, userId]);

  useEffect(() => {
    if (enabled && !hasStartedRef.current) {
      startStream();
    }

    // Only cleanup when component unmounts, not when enabled changes
    return () => {
      // Don't abort if stream is still running
      // Let it complete naturally
    };
  }, [enabled, startStream]);

  return {
    tasks: Array.from(tasks.values()),
    status,
    error,
    isStreaming,
    startStream,
  };
};
