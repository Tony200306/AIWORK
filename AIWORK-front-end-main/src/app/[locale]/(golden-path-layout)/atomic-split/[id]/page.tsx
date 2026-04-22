"use client";

import { Button } from "@/components/ui/button";
import { RouteConfig } from "@/constants/RouteConfig";
import { useGetTasksListByBraindump } from "@/hooks/shared/useGetTasksListByBraindump";
import { useAISplitterStream, StreamingTask } from "@/hooks/shared/useAISplitterStream";
import { useBulkCreateTasks } from "@/hooks/shared/useBulkCreateTasks";
import { ChevronLeft, ChevronRight, Clock10Icon, PenLine, Sparkles, Undo2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import ListStep, { formatDuration } from "../components/Step/ListStep";
import TasksList from "../components/Task/TasksList";
import { useParams } from "next/navigation";
import { useAuthStore } from "~/stores/authStore";
import { Task, TaskType } from "~/models/Task";
import { toast } from "sonner";

export default function AutomaticSplitPage() {
  const params = useParams();
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [tagsAccordionOpen, setTagsAccordionOpen] = useState(false);
  const [mobileView, setMobileView] = useState<"steps" | "scope">("steps");
  const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null);
  const [headerHeight, setHeaderHeight] = useState<number>(0);

  // Log header height khi thay đổi
  useEffect(() => {
    console.log('[page] headerHeight updated:', headerHeight);
  }, [headerHeight]);
  const { data: authData } = useAuthStore();
  const userId = authData.userInfo?.id || "";

  // Track if we should stream (will be computed after first render)
  const [shouldStream, setShouldStream] = useState(false);

  const { data: tasksData, isLoading } = useGetTasksListByBraindump(
    {
      brainDumpId: params.id as string,
    },
    {
      // Disable polling when we're streaming
      disablePolling: shouldStream,
    }
  );

  // Only check hasNoTasks after data is loaded
  const hasNoTasks = !isLoading && (!tasksData?.data?.tasks || tasksData.data.tasks.length === 0);

  // Enable stream only when:
  // 1. Not loading initial data
  // 2. Data has been fetched (tasksData exists)
  // 3. No tasks exist
  const shouldEnableStream = !isLoading && tasksData !== undefined && hasNoTasks;

  // Update shouldStream state when conditions change
  if (shouldEnableStream !== shouldStream) {
    setShouldStream(shouldEnableStream);
  }

  // Bulk create tasks mutation
  const bulkCreateMutation = useBulkCreateTasks({
    braindumpId: params.id as string,
  });

  // Handle stream completion - convert streaming tasks to bulk create format
  const handleStreamCompleted = useCallback(
    (streamingTasks: StreamingTask[]) => {
      console.log('[Page] handleStreamCompleted called with', streamingTasks.length, 'tasks');
      streamingTasks.forEach(t => console.log('[Page] Task:', t.title, '| hasScope:', !!t.scopeFull));
      const bulkCreateData = {
        tasks: streamingTasks?.map((task) => {
          const steps = (task.steps || [])?.map((step, index) => ({
            title: step.title,
            description: step.description,
            orderIndex: step.orderIndex ?? index,
            sysEstMinutes: step.sysEstMinutes,
            difficulty: step.difficulty,
          }));

          // Calculate expectedTimeHours from total sysEstMinutes
          const totalSysEstMinutes = steps.reduce((sum, step) => sum + (step.sysEstMinutes || 0), 0);
          const expectedTimeHours = totalSysEstMinutes > 0 ? totalSysEstMinutes / 60 : null;

          return {
            title: task.title,
            description: task.description,
            expectedTimeHours,
            steps,
            tags: task.tags?.map((tag) => ({
              name: tag.name,
              contributionWeight: tag.contribution_weight,
            })),
            scope: task.scopeFull || null,
                        taskType: TaskType.STAGING || undefined,
            
          };
        }),
      };

      bulkCreateMutation.mutate(bulkCreateData, {
        onSuccess: () => {
          // Disable streaming after successful creation to prevent UI flicker
          setShouldStream(false);
        },
        onError: (error) => {
          toast.error("Failed to create tasks", {
            description: error.message,
          });
        },
      });
    },
    [bulkCreateMutation]
  );

  // Start streaming ONLY after fetch is done and no tasks exist
  const {
    tasks: streamingTasks,
    status: streamStatus,
    error: streamError,
    isStreaming,
  } = useAISplitterStream({
    braindumpId: params.id as string,
    userId,
    enabled: shouldEnableStream,
    onCompleted: handleStreamCompleted,
  });

  // Merge streaming tasks with existing tasks
  const allTasks = useMemo<Task[]>(() => {
    const apiTasks = tasksData?.data?.tasks || [];

    console.log('[AllTasks] apiTasks.length:', apiTasks.length, 'streamingTasks.length:', streamingTasks.length, 'isStreaming:', isStreaming, 'isSaving:', bulkCreateMutation.isPending);

    // Show API tasks if available
    if (apiTasks.length > 0) {
      console.log('[AllTasks] Using API tasks');
      apiTasks.forEach(t => console.log('[AllTasks] API task:', t.title, '| hasScope:', !!t.scope, '| scope:', t.scope));
      return apiTasks;
    }

    // Show streaming tasks if we have them (even after streaming stopped, until API data arrives)
    if (streamingTasks.length > 0) {
      console.log('[AllTasks] Using streaming tasks');
      // Convert streaming tasks to Task format
      return streamingTasks?.map((streamTask) => {
        console.log(streamTask,"streamTask");
        const steps = streamTask.steps?.map(step => ({
          id: step.id,
          taskId: step.taskId,
          title: step.title,
          description: step.description || null,
          orderIndex: step.orderIndex || null,
          difficulty: step.difficulty || null,
          sysEstMinutes: step.sysEstMinutes,
          userEstMinutes: null,
          isDone: false,
          planVersionId: null,
          extraProp: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        })) || [];

        // Calculate expectedTimeHours from total sysEstMinutes
        const totalSysEstMinutes = steps.reduce((sum, step) => sum + (step.sysEstMinutes || 0), 0);
        const expectedTimeHours = totalSysEstMinutes > 0 ? totalSysEstMinutes / 60 : null;

        return {
          id: streamTask.id,
          title: streamTask.title,
          description: streamTask.description,
          status: streamTask.status || 'TODO' as any,
          priority: streamTask.priority || 'MEDIUM' as any,
          steps,
          // Convert streaming tags to Tag format with placeholder values
          tags: streamTask.tags?.map((tag, index) => ({
            id: `temp-${streamTask.id}-${index}`,
            name: tag.name,
            type: 'streaming',
            priorityWeight: tag.contribution_weight || 0,
            userId: userId,
            parentId: null,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          })) || [],
          expectedTimeHours,
          extraProp: null,
          totalEstimatedMinutes: totalSysEstMinutes,
          dueAt: null,
          archivedAt: null,
          clientId: null,
          userId: userId,
          tagId: null,
          activePlanVersionId: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          scope: streamTask.scopeFull || undefined,
        } as Task;
      });
    }

    console.log('[AllTasks] No tasks available');
    return [];
  }, [streamingTasks, tasksData?.data?.tasks, userId, isStreaming, bulkCreateMutation.isPending]);

  // Track if we've done initial auto-selection
  const hasAutoSelectedRef = useRef(false);
  const selectedTaskIndexRef = useRef<number>(-1);

  // Auto-select first task when tasks become available (from BE or streaming)
  // Also reset selection if current selectedTaskId no longer exists (e.g., after bulk create with new IDs)
  useEffect(() => {
    // Initial auto-selection
    if (!hasAutoSelectedRef.current && allTasks.length > 0) {
      setSelectedTaskId(allTasks[0].id);
      selectedTaskIndexRef.current = 0;
      hasAutoSelectedRef.current = true;
      return;
    }

    // If we have a selectedTaskId but it's not found in allTasks, reset to first task
    // This handles the case where bulk create completes with new IDs
    if (selectedTaskId && allTasks.length > 0) {
      const taskExists = allTasks.some((task) => task.id === selectedTaskId);
      if (!taskExists) {
        // Try to preserve the index position if possible
        const newIndex = Math.min(selectedTaskIndexRef.current, allTasks.length - 1);
        setSelectedTaskId(allTasks[newIndex].id);
        selectedTaskIndexRef.current = newIndex;
      }
    }
  }, [allTasks, selectedTaskId]);

  // Update the selected index when selectedTaskId changes
  useEffect(() => {
    if (selectedTaskId && allTasks.length > 0) {
      const index = allTasks.findIndex((task) => task.id === selectedTaskId);
      if (index !== -1) {
        selectedTaskIndexRef.current = index;
      }
    }
  }, [selectedTaskId, allTasks]);

  const handleTaskClick = (id: string) => {
    // Accordion handles toggle - just set the value (empty string means closed)
    setSelectedTaskId(id || null);
  };

  const handleEditTags = (taskId: string) => {
    setSelectedTaskId(taskId);
    setTagsAccordionOpen(true);
  };

  // Get current task index for navigation
  const currentTaskIndex = allTasks.findIndex((task) => task.id === selectedTaskId);
  const totalTasks = allTasks.length;

  // Navigation handlers for scope view
  const handlePrevTask = () => {
    if (currentTaskIndex > 0) {
      setSelectedTaskId(allTasks[currentTaskIndex - 1].id);
    }
  };

  const handleNextTask = () => {
    if (currentTaskIndex < allTasks.length - 1) {
      setSelectedTaskId(allTasks[currentTaskIndex + 1].id);
    }
  };

  // Get expanded task index for navigation
  const expandedTaskIndex = expandedTaskId
    ? allTasks.findIndex((t) => t.id === expandedTaskId)
    : -1;

  // Handle expanded view navigation
  const handleExpandedPrevTask = () => {
    if (expandedTaskIndex > 0) {
      const prevTask = allTasks[expandedTaskIndex - 1];
      setExpandedTaskId(prevTask.id);
      setSelectedTaskId(prevTask.id);
    }
  };

  const handleExpandedNextTask = () => {
    if (expandedTaskIndex < allTasks.length - 1) {
      const nextTask = allTasks[expandedTaskIndex + 1];
      setExpandedTaskId(nextTask.id);
      setSelectedTaskId(nextTask.id);
    }
  };

  const isExpandedPrevDisabled = expandedTaskIndex <= 0;
  const isExpandedNextDisabled = expandedTaskIndex >= allTasks.length - 1;

  const route = useRouter();

  const selectedTask = allTasks.find(
    (task) => task.id === selectedTaskId
  );


  const showStreamingIndicator = isStreaming && streamingTasks.length > 0;
  const isSavingTasks = bulkCreateMutation.isPending;
  console.log(allTasks,"allTasks");
  return (
    <div className="justify-center w-full max-w-full md:max-w-[95%] lg:max-w-[79%] xl:max-w-[1300px] 2xl:w-[1500px] mx-auto px-4 md:px-6 lg:px-8 py-6 md:py-8 flex flex-col h-[100vh]">
      {/* Title section - hidden on mobile when in scope view or when task is expanded */}
      <div className={`flex flex-col items-center justify-center py-3 ${mobileView === "scope" || expandedTaskId ? "hidden md:flex" : ""}`}>
        <div className="font-semibold text-[34px] md:text-5xl leading-none">Atomic Split</div>
        <div className="text-center text-sm md:text-base">
          Here's what Vantum pulled out of it - Click a deliverable to see the steps.
        </div>
      </div>

      {/* Task Detail header - shown on mobile when task is expanded in steps view */}
      {expandedTaskId && mobileView === "steps" && (
        <div className="flex flex-col items-center justify-center py-3 md:hidden">
          <h1 className="text-[34px] font-semibold text-white leading-none">Task Detail</h1>
          <div className="flex items-center gap-4">
            <button
              onClick={handleExpandedPrevTask}
              disabled={isExpandedPrevDisabled}
              className={`p-1 transition-opacity ${
                isExpandedPrevDisabled ? "opacity-30 cursor-not-allowed" : "opacity-100 cursor-pointer"
              }`}
            >
              <ChevronLeft size={24} className="text-white" />
            </button>
            <span className="text-lg font-medium text-white">
              Task {expandedTaskIndex + 1}
            </span>
            <button
              onClick={handleExpandedNextTask}
              disabled={isExpandedNextDisabled}
              className={`p-1 transition-opacity ${
                isExpandedNextDisabled ? "opacity-30 cursor-not-allowed" : "opacity-100 cursor-pointer"
              }`}
            >
              <ChevronRight size={24} className="text-white" />
            </button>
          </div>
        </div>
      )}


            <div className="flex flex-col min-h-0 flex-1 mt-6">
          <div className="hidden md:flex justify-between items-center">
            <div
              onClick={() => route.push(RouteConfig.BrainDumpPage.path)}
              className="p-2 w-fit cursor-pointer flex gap-2 items-center "
            >
              <Undo2 size={16} /> Back
            </div>
            {showStreamingIndicator && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground animate-pulse">
                <Sparkles className="w-4 h-4" />
                AI is generating tasks...
              </div>
            )}
            {isSavingTasks && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground animate-pulse">
                <Sparkles className="w-4 h-4" />
                Saving tasks...
              </div>
            )}
          </div>
          <div className="auto-rows-fr mt-0 md:mt-5 grid grid-cols-1 md:grid-cols-2 gap-8 flex-1 min-h-0 ">
            <div className="flex flex-1 min-h-0 flex-col items-end">
                <TasksList
              isLoading={isLoading || (isStreaming ? allTasks.length === 0 : false)}
              tasks={allTasks}
              onTaskClick={handleTaskClick}
              onEditTags={handleEditTags}
              selectedTaskId={selectedTaskId}
              isStreaming={isStreaming}
              mobileView={mobileView}
              onPrevTask={handlePrevTask}
              onNextTask={handleNextTask}
              currentTaskIndex={currentTaskIndex}
              totalTasks={totalTasks}
              expandedTaskId={expandedTaskId}
              onExpandedTaskIdChange={setExpandedTaskId}
              onSwitchToStepsAndExpand={(taskId) => {
                setMobileView("steps");
                setExpandedTaskId(taskId);
              }}
              headerHeight={headerHeight}
            />
            </div>
          
            <div className="hidden md:flex flex-col flex-1 min-h-0 justify-between  w-full max-w-[690px] border-2 rounded-b-2xl rounded-t-2xl  border-border border-t-0">
              <ListStep
                task={selectedTask}
                steps={selectedTask?.steps?.sort(
                  (a, b) => (a.orderIndex || 0) - (b.orderIndex || 0)
                )}
                tagsAccordionOpen={tagsAccordionOpen}
                onTagsAccordionChange={setTagsAccordionOpen}
                isStreaming={isStreaming}
                onHeaderHeightChange={setHeaderHeight}
              />
            </div>
          </div>

        

          <div className="h-36 md:h-auto mt-4 flex flex-col md:flex-row items-center justify-center md:justify-between gap-1 md:gap-4">
            
              {/* Mobile View Switcher */}
          <div className="md:hidden flex flex-col gap-2 mt-4 mb-10 w-full">
            <div className="flex justify-around gap-8">
              <button
                onClick={() => setMobileView("steps")}
                className={`text-base font-medium transition-colors ${
                  mobileView === "steps" ? "text-white" : "text-muted-foreground"
                }`}
              >
                Steps View
              </button>
              <button
                onClick={() => setMobileView("scope")}
                className={`text-base font-medium transition-colors ${
                  mobileView === "scope" ? "text-white" : "text-muted-foreground"
                }`}
              >
                Scope View
              </button>
            </div>
            <div className="h-1.5  rounded-full overflow-hidden flex gap-1">
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  mobileView === "steps" ? "bg-chart-3" : "bg-gray-700"
                }`}
                style={{ width: "50%" }}
              />
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  mobileView === "scope" ? "bg-chart-3" : "bg-gray-700"
                }`}
                style={{ width: "50%" }}
              />
            </div>
          </div>
            <div className="hidden md:flex p-3 bg-none md:bg-secondary rounded-3xl gap-2 text-sm md:text-base">
              <Clock10Icon size={20}/>
              Total est. time : <span>{ formatDuration(tasksData?.data?.tasks?.reduce((total, task) => total + (task.steps?.reduce((stepTotal, step) => stepTotal + (step.sysEstMinutes || step.userEstMinutes || 0), 0) || 0), 0) || 0)}</span>
            </div>
            {/* Mobile scope view - Edit Scope button */}
            {/* {mobileView === "scope" && selectedTask && (
              <Button
                onClick={() => handleEditTags(selectedTask.id)}
                variant="outline"
                size="lg"
                className="md:hidden bg-white! text-black border-0"
                disabled={isStreaming || isSavingTasks}
              >
                <PenLine className="w-4 h-4" />
                Edit Scope
              </Button>
            )} */}
            {/* Desktop and mobile steps view - Prioritize button */}
            <Button
              onClick={() => route.push(RouteConfig.FTEKanbanPage.getPath(params.id as string))}
              variant="default"
              size="lg"
              disabled={isStreaming || isSavingTasks}
              className={mobileView === "scope" ? " md:flex" : ""}
            >
              Prioritize what fits
              <Sparkles className="w-5 h-5" />
            </Button>{" "}
          </div>
        </div>
     
    </div>
  );
}
