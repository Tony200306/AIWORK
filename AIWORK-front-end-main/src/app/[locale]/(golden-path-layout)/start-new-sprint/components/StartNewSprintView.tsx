"use client";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tag } from "@/components/shared/ReactComponent/components/Tag";
import { RouteConfig } from "@/constants/RouteConfig";
import { useGetTaskLists } from "@/hooks/shared/useGetTaskLists";
import { useCreateSprint } from "@/hooks/shared/useCreateSprint";
import { useDebounce } from "@/hooks/useDebounce";
import { cn } from "@/lib/utils";
import {
  Priority,
  Task,
  TaskStatus,
  TaskType,
  priorityToLabelMapping,
  statusToLabelMapping,
  statusToColorMapping,
  sprintStatusToLabelMapping,
} from "@/models/Task";
import { SprintWindowType } from "@/models/Sprint";
import { GetTasksParams } from "@/services/task/getTasks";
import { updateBulkTasks } from "@/services/task/updateBulkTasks";
import { deleteBulkTasks } from "@/services/task/deleteBulkTasks";
import { updateTask } from "@/services/task/updateTask";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  pointerWithin,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  Calendar,
  Circle,
  Filter,
  Search,
  Sparkles,
  Star,
  Triangle,
  X,
} from "lucide-react";
import { DoubleTriagle } from "@/components/icon/DoubleTriagle";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import React, { useEffect, useMemo, useState, useRef, useCallback, startTransition } from "react";
import { toast } from "sonner";
import dayjs from "dayjs";

// Reuse backlog components
import BackLogItem from "../../backlog/components/backlog-list/BackLogItem";
import { TaskList } from "../../backlog/components/backlog-list/TaskList";

import BacklogFilter, { FilterState } from "../../backlog/components/filter/BacklogFilter";
import ToolBar from "../../backlog/components/ToolBar";

// Reuse fte-kanban components for kanban view
import { PlannedBar } from "../../fte-kanban/components/PlannedBar";
import { ConfirmModal } from "../../fte-kanban/components/ConfirmModal";
import { KanBanItem } from "../../fte-kanban/components/KanBanItem";
import { SortableKanbanItem } from "../../fte-kanban/components/SortableKanbanItem";
import { DroppableColumn } from "../../fte-kanban/components/DroppableColumn";

import { formatTimeFromHours as formatDuration, formatTimeFromMinutes } from "@/utils/formatTimeDisplay";
import { useReshuffleBacklog } from "@/hooks/shared/useReshuffleBacklog";
import { ReshuffleBacklogTaskInput } from "@/services/braindump/reshuffleBacklog";
import { mapPriorityFromInt } from "@/services/braindump/reshufflePriorities";
import {
  groupTasksByPriority,
  PriorityGroup,
} from "@/utils/groupTasksByPriority";

type BacklogTask = Task & { steps: NonNullable<Task["steps"]> };
type GroupedTasks = Record<string, BacklogTask[]>;

type SortField = "estTime" | "priority" | "status";
type SortDirection = "asc" | "desc" | null;
type GroupSortState = Record<string, { field: SortField | null; direction: SortDirection }>;

const sortFieldToApiSortBy: Record<SortField, GetTasksParams["sortBy"] | undefined> = {
  estTime: "expectedTimeHours",
  priority: "priority",
  status: "status",
};

function normalizeTask(task: Task): BacklogTask {
  return { ...task, steps: task.steps || [] };
}

// Groups for the lane view
const LANE_TASK_TYPES = [TaskType.NEWSPRINT, TaskType.BACKLOG, TaskType.STAGING] as const;

const taskTypeGroups = [
  {
    taskType: TaskType.NEWSPRINT,
    label: "New Sprint",
    headerClass: "bg-[#007A7A]",
  },
  {
    taskType: TaskType.BACKLOG,
    label: "Backlog",
    headerClass: "bg-accent",
  },
  {
    taskType: TaskType.STAGING,
    label: "Staging",
    headerClass: "bg-[#C97B00]",
  },
];

const priorityIconMap: Record<Priority, { icon: React.ElementType; color: string }> = {
  [Priority.Highest]: { icon: Star, color: "text-red-500" },
  [Priority.High]: { icon: Triangle, color: "text-orange-500" },
  [Priority.Medium]: { icon: Circle, color: "text-orange-500" },
  [Priority.Low]: { icon: Triangle, color: "text-blue-500 rotate-180" },
  [Priority.Lowest]: { icon: DoubleTriagle, color: "text-gray-500" },
};

const laneColorMap: Record<string, string> = {
  [TaskType.BACKLOG]: "#6b7280",
  [TaskType.STAGING]: "#C97B00",
  [TaskType.NEWSPRINT]: "#2E7D32",
};

type PendingAction =
  | { type: "delete" }
  | { type: "lane"; value: TaskType }
  | { type: "priority"; value: Priority }
  | { type: "status"; value: TaskStatus };

interface LaneDragPayload {
  type: "task" | "group";
  id: string;
  sourceGroup: TaskType;
}

function localArrayMove<T>(arr: T[], from: number, to: number): T[] {
  const result = [...arr];
  const [item] = result.splice(from, 1);
  result.splice(to, 0, item);
  return result;
}

// Kanban view column config
const kanbanColumnConfig = {
  LOW: {
    title: "Low",
    bgColor: "bg-white/20",
    borderColor: "border-gray-800",
  },
  MEDIUM: {
    title: "Medium",
    bgColor: "bg-[#E38A00]/20",
    borderColor: "border-yellow-900/50",
  },
  HIGH: {
    title: "High",
    bgColor: "bg-[#02BE7F]/20",
    borderColor: "border-teal-900/50",
  },
  HIGHEST: {
    title: "Priority",
    bgColor: "bg-[#EA2416]/20",
    borderColor: "border-red-900/50",
  },
};

export default function StartNewSprintView() {
  const router = useRouter();

  // --- View mode ---
  const [viewMode, setViewMode] = useState<"lane" | "kanban">("lane");

  // --- Sprint window ---
  const [selectedWindowType, setSelectedWindowType] = useState<SprintWindowType>(SprintWindowType.WEEK);
  const [showCalendarComingSoon, setShowCalendarComingSoon] = useState(false);
  const [openConfirmModal, setOpenConfirmModal] = useState(false);

  // --- Search & Filter ---
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebounce(searchQuery, 400);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [activeFilters, setActiveFilters] = useState<FilterState>({
    priority: [],
    category: [],
    progress: [],
    commitment: [],
    sprint: [],
    searchQuery: "",
  });

  // --- Lane view state ---
  const [selectedTasks, setSelectedTasks] = useState<Record<string, Set<string>>>({
    [TaskType.NEWSPRINT]: new Set(),
    [TaskType.BACKLOG]: new Set(),
    [TaskType.STAGING]: new Set(),
  });
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({
    [TaskType.NEWSPRINT]: true,
    [TaskType.BACKLOG]: true,
    [TaskType.STAGING]: true,
  });
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(null);
  const [groupOrder, setGroupOrder] = useState<TaskType[]>([
    TaskType.BACKLOG,
    TaskType.STAGING,
  ]);
  const orderedGroups = groupOrder?.map(
    (taskType) => taskTypeGroups.find((g) => g.taskType === taskType)!
  );
  const [groupSorts, setGroupSorts] = useState<GroupSortState>({
    [TaskType.NEWSPRINT]: { field: "priority", direction: "asc" },
    [TaskType.BACKLOG]: { field: "priority", direction: "asc" },
    [TaskType.STAGING]: { field: "priority", direction: "asc" },
  });

  const toggleSort = (taskType: TaskType, field: SortField) => {
    setGroupSorts((prev) => {
      const current = prev[taskType];
      if (current.field === field) {
        if (current.direction === "desc") return { ...prev, [taskType]: { field, direction: "asc" } };
        if (current.direction === "asc") return { ...prev, [taskType]: { field: null, direction: null } };
      }
      return { ...prev, [taskType]: { field, direction: "desc" } };
    });
  };

  // --- Data fetching ---
  const buildQueryParams = (taskType: TaskType): GetTasksParams => {
    const sort = groupSorts[taskType];
    const apiSortBy = sort?.field ? sortFieldToApiSortBy[sort.field] : undefined;
    const applyFilters = taskType !== TaskType.NEWSPRINT;
    return {
      taskType,
      limit: 1000,
      search: applyFilters ? (debouncedSearch || undefined) : undefined,
      priority: applyFilters && activeFilters.priority.length ? activeFilters.priority as Priority[] : undefined,
      status: applyFilters && activeFilters.progress.length ? activeFilters.progress as TaskStatus[] : undefined,
      sortBy: apiSortBy,
      sortOrder: apiSortBy && sort?.direction ? sort.direction : undefined,
    };
  };

  const newSprintParams = useMemo(() => buildQueryParams(TaskType.NEWSPRINT), [groupSorts]);
  const backlogParams = useMemo(() => buildQueryParams(TaskType.BACKLOG), [groupSorts, debouncedSearch, activeFilters.priority, activeFilters.progress]);
  const stagingParams = useMemo(() => buildQueryParams(TaskType.STAGING), [groupSorts, debouncedSearch, activeFilters.priority, activeFilters.progress]);

  const newSprintQuery = useGetTaskLists(newSprintParams);
  const backlogQuery = useGetTaskLists(backlogParams);
  const stagingQuery = useGetTaskLists(stagingParams);

  // Track fetching state
  const [isFetchingGroup, setIsFetchingGroup] = useState<Record<string, boolean>>({
    [TaskType.NEWSPRINT]: false,
    [TaskType.BACKLOG]: false,
    [TaskType.STAGING]: false,
  });

  const [groupedTasks, setGroupedTasks] = useState<GroupedTasks>({
    [TaskType.NEWSPRINT]: [],
    [TaskType.BACKLOG]: [],
    [TaskType.STAGING]: [],
  });

  // Sync queries to local state
  const syncQuery = (taskType: TaskType, query: typeof newSprintQuery) => {
    const isFetching = query.isLoading || query.isFetching;
    setIsFetchingGroup((prev) => {
      if (prev[taskType] !== isFetching) {
        if (isFetching && !prev[taskType]) {
          setGroupedTasks((p) => ({ ...p, [taskType]: [] }));
        }
        return { ...prev, [taskType]: isFetching };
      }
      return prev;
    });
    if (query.data?.data && !isFetching) {
      setGroupedTasks((prev) => ({ ...prev, [taskType]: query.data.data?.map(normalizeTask) }));
    }
  };

  useEffect(() => syncQuery(TaskType.NEWSPRINT, newSprintQuery), [newSprintQuery.data, newSprintQuery.isLoading, newSprintQuery.isFetching]);
  useEffect(() => syncQuery(TaskType.BACKLOG, backlogQuery), [backlogQuery.data, backlogQuery.isLoading, backlogQuery.isFetching]);
  useEffect(() => syncQuery(TaskType.STAGING, stagingQuery), [stagingQuery.data, stagingQuery.isLoading, stagingQuery.isFetching]);

  // --- Kanban view state (for NEWSPRINT tasks grouped by priority) ---
  const [kanbanGroupTasks, setKanbanGroupTasks] = useState<PriorityGroup>({
    LOW: [],
    MEDIUM: [],
    HIGH: [],
    HIGHEST: [],
  });

  // Sync NEWSPRINT tasks to kanban priority groups
  useEffect(() => {
    const newSprintTasks = groupedTasks[TaskType.NEWSPRINT] || [];
    if (newSprintTasks.length > 0) {
      const grouped = groupTasksByPriority(newSprintTasks);
      setKanbanGroupTasks({
        LOW: grouped.LOW || [],
        MEDIUM: grouped.MEDIUM || [],
        HIGH: grouped.HIGH || [],
        HIGHEST: grouped.HIGHEST || [],
      });
    } else {
      setKanbanGroupTasks({ LOW: [], MEDIUM: [], HIGH: [], HIGHEST: [] });
    }
  }, [groupedTasks[TaskType.NEWSPRINT]]);

  // --- Native drag state (lane view) ---
  const [laneDragData, setLaneDragData] = useState<LaneDragPayload | null>(null);
  const [laneDropTarget, setLaneDropTarget] = useState<{
    groupType: TaskType;
    taskId?: string;
    position?: "before" | "after";
  } | null>(null);
  // Refs to avoid stale closures in memoized children
  const laneDragDataRef = useRef<LaneDragPayload | null>(null);
  const laneDropTargetRef = useRef<typeof laneDropTarget>(null);
  laneDragDataRef.current = laneDragData;
  laneDropTargetRef.current = laneDropTarget;
  const mainContainerRef = useRef<HTMLDivElement>(null);

  // --- DnD state (kanban view) ---
  const [kanbanActiveId, setKanbanActiveId] = useState<string | null>(null);
  const [kanbanActiveTask, setKanbanActiveTask] = useState<Task | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const queryClient = useQueryClient();
  const { mutate: createSprint, isPending: isCreatingSprint } = useCreateSprint();

  const taskTypeMutation = useMutation({
    mutationFn: updateTask,
    onError: (err: Error) => {
      toast.error(err.message || "Failed to move task");
      queryClient.invalidateQueries({ queryKey: ["task-list"] });
    },
  });

  const bulkTasksMutation = useMutation({
    mutationFn: updateBulkTasks,
    onError: (err: Error) => {
      toast.error(err.message || "Failed to update tasks");
      queryClient.invalidateQueries({ queryKey: ["task-list"] });
    },
  });

  const deleteBulkMutation = useMutation({
    mutationFn: deleteBulkTasks,
    onError: (err: Error) => {
      toast.error(err.message || "Failed to delete tasks");
      queryClient.invalidateQueries({ queryKey: ["task-list"] });
    },
  });

  const PRIORITY_TO_INT: Record<string, number> = {
    HIGHEST: 1, HIGH: 2, MEDIUM: 3, LOW: 4,
  };

  const { mutate: reshuffleBacklogMutate, isPending: isShuffling } = useReshuffleBacklog();

  const handleReshuffle = () => {
    const selected: BacklogTask[] = [];
    for (const taskType of LANE_TASK_TYPES) {
      const ids = selectedTasks[taskType];
      if (ids?.size) {
        selected.push(...(groupedTasks[taskType] || [])?.filter((t) => ids.has(t.id)));
      }
    }
    if (selected.length === 0) return;

    const tasks: ReshuffleBacklogTaskInput[] = selected?.map((task, index) => ({
      id: task.id,
      text: task.title,
      est_time: task.expectedTimeHours || 0,
      priority: PRIORITY_TO_INT[task.priority] ?? null,
      priority_source: task.priority === "HIGHEST" ? "user" as const : "ai" as const,
      is_locked: task.priority === "HIGHEST",
      last_user_moved_at: null,
      rank: task.rank ?? index,
    }));

    reshuffleBacklogMutate(
      { tasks },
      {
        onSuccess: (data) => {
          const changesMap = new Map(
            data.tasks?.map((t) => [t.id, { priority: t.priority, rank: t.rank }])
          );
          setGroupedTasks((prev) => {
            const updated = { ...prev };
            for (const taskType of LANE_TASK_TYPES) {
              updated[taskType] = (prev[taskType] || [])?.map((task) => {
                const change = changesMap.get(task.id);
                if (change) {
                  return { ...task, priority: mapPriorityFromInt(change.priority) as Priority, rank: change.rank };
                }
                return task;
              });
            }
            return updated;
          });
          const taskUpdates = data.tasks?.map((t) => ({
            taskId: t.id,
            priority: mapPriorityFromInt(t.priority) as Priority,
            rank: t.rank,
          }));
          bulkTasksMutation.mutate({ tasks: taskUpdates });
        },
      }
    );
  };

  // --- Lane Native Drag Handlers ---
  const findContainer = useCallback((id: string): TaskType | undefined => {
    if (id in groupedTasks) return id as TaskType;
    return Object.keys(groupedTasks).find((key) =>
      groupedTasks[key]?.some((task) => task.id === id),
    ) as TaskType | undefined;
  }, [groupedTasks]);

  const handleLaneTaskDragStart = useCallback((e: React.DragEvent, taskId: string, sourceGroup: TaskType) => {
    const payload: LaneDragPayload = { type: "task", id: taskId, sourceGroup };
    e.dataTransfer.setData("application/json", JSON.stringify(payload));
    e.dataTransfer.effectAllowed = "move";
    setLaneDragData(payload);
  }, []);

  const handleLaneTaskDragOver = useCallback((e: React.DragEvent, taskId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    const rect = e.currentTarget.getBoundingClientRect();
    const midY = rect.top + rect.height / 2;
    const position: "before" | "after" = e.clientY < midY ? "before" : "after";
    const container = findContainer(taskId);
    if (!container) return;
    setLaneDropTarget((prev) => {
      if (prev?.taskId === taskId && prev?.position === position && prev?.groupType === container) return prev;
      return { groupType: container, taskId, position };
    });
  }, [findContainer]);

  const handleLaneGroupDragOver = useCallback((e: React.DragEvent, groupType: TaskType) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (!laneDragData) return;
    if (laneDragData.type === "task") {
      setExpandedGroups((prev) => {
        if (prev[groupType]) return prev;
        return { ...prev, [groupType]: true };
      });
    }
    setLaneDropTarget((prev) => {
      if (prev?.taskId) return prev;
      if (prev?.groupType === groupType && !prev?.taskId) return prev;
      return { groupType };
    });
  }, [laneDragData]);

  const handleLaneGroupDragLeave = useCallback((e: React.DragEvent) => {
    const relatedTarget = e.relatedTarget as HTMLElement | null;
    if (relatedTarget && e.currentTarget.contains(relatedTarget)) return;
    setLaneDropTarget(null);
  }, []);

  const handleLaneDrop = useCallback((e: React.DragEvent, targetGroup: TaskType) => {
    e.preventDefault();
    e.stopPropagation();

    const currentDrag = laneDragDataRef.current;
    if (!currentDrag) return;

    if (currentDrag.type === "group") {
      const activeType = currentDrag.id as TaskType;
      if (activeType !== targetGroup) {
        setGroupOrder((prev) => localArrayMove(prev, prev.indexOf(activeType), prev.indexOf(targetGroup)));
      }
      setLaneDropTarget(null); setLaneDragData(null); return;
    }

    const sourceGroup = currentDrag.sourceGroup;
    const taskId = currentDrag.id;
    const currentDropTarget = laneDropTargetRef.current;

    if (sourceGroup !== targetGroup) {
      setGroupedTasks((prev) => {
        const sourceItems = prev[sourceGroup];
        const activeIndex = sourceItems.findIndex((t) => t.id === taskId);
        if (activeIndex < 0) return prev;
        const movedTask = { ...sourceItems[activeIndex], taskType: targetGroup };
        const targetItems = prev[targetGroup];
        let newIndex = targetItems.length;
        if (currentDropTarget?.taskId) {
          const overIndex = targetItems.findIndex((t) => t.id === currentDropTarget.taskId);
          if (overIndex >= 0) newIndex = currentDropTarget.position === "after" ? overIndex + 1 : overIndex;
        }
        return {
          ...prev,
          [sourceGroup]: sourceItems?.filter((item) => item.id !== taskId),
          [targetGroup]: [...targetItems.slice(0, newIndex), movedTask, ...targetItems.slice(newIndex)],
        };
      });
      taskTypeMutation.mutate({ taskId, taskType: targetGroup });
    } else {
      if (currentDropTarget?.taskId && currentDropTarget.taskId !== taskId) {
        setGroupedTasks((prev) => {
          const items = prev[sourceGroup];
          const activeIndex = items.findIndex((t) => t.id === taskId);
          const overIndex = items.findIndex((t) => t.id === currentDropTarget.taskId);
          if (activeIndex < 0 || overIndex < 0) return prev;
          return { ...prev, [sourceGroup]: localArrayMove(items, activeIndex, overIndex) };
        });
      }
    }
    setLaneDropTarget(null); setLaneDragData(null);
  }, [taskTypeMutation]);

  const handleLaneDragEnd = useCallback(() => {
    setLaneDragData(null); setLaneDropTarget(null);
  }, []);

  const handleLaneGroupHeaderDragStart = useCallback((e: React.DragEvent, groupType: TaskType) => {
    const payload: LaneDragPayload = { type: "group", id: groupType, sourceGroup: groupType };
    e.dataTransfer.setData("application/json", JSON.stringify(payload));
    e.dataTransfer.effectAllowed = "move";
    setLaneDragData(payload);
  }, []);

  const handleLaneGroupHeaderDragOver = useCallback((e: React.DragEvent, groupType: TaskType) => {
    e.preventDefault();
    if (!laneDragData || laneDragData.type !== "group") return;
    e.dataTransfer.dropEffect = "move";
  }, [laneDragData]);

  const handleLaneGroupHeaderDrop = useCallback((e: React.DragEvent, targetGroupType: TaskType) => {
    e.preventDefault(); e.stopPropagation();
    let payload: LaneDragPayload;
    try { payload = JSON.parse(e.dataTransfer.getData("application/json")); } catch { setLaneDropTarget(null); setLaneDragData(null); return; }
    if (payload.type === "group" && payload.id !== targetGroupType) {
      setGroupOrder((prev) => localArrayMove(prev, prev.indexOf(payload.id as TaskType), prev.indexOf(targetGroupType)));
    }
    setLaneDropTarget(null); setLaneDragData(null);
  }, []);

  // --- Kanban DnD handlers ---
  const findKanbanContainer = (id: string) => {
    if (id in kanbanGroupTasks) return id;
    return Object.keys(kanbanGroupTasks).find((key) =>
      kanbanGroupTasks[key].some((task) => task.id === id)
    );
  };

  const handleKanbanDragStart = (event: DragStartEvent) => {
    const id = event.active.id as string;
    setKanbanActiveId(id);
    const container = findKanbanContainer(id);
    if (container) {
      const task = kanbanGroupTasks[container].find((t) => t.id === id);
      setKanbanActiveTask(task || null);
    }
  };

  const handleKanbanDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    const activeContainer = findKanbanContainer(active.id as string);
    const overContainer = findKanbanContainer(over?.id as string);

    if (!activeContainer || !overContainer) {
      setKanbanActiveId(null);
      setKanbanActiveTask(null);
      return;
    }

    if (activeContainer !== overContainer && over) {
      // Move between priority columns
      setKanbanGroupTasks((prev) => {
        const activeItems = prev[activeContainer];
        const overItems = prev[overContainer];
        const activeIndex = activeItems.findIndex((task) => task.id === active.id);
        const overIndex = overItems.findIndex((task) => task.id === over.id);
        let newIndex = overIndex >= 0 ? overIndex : overItems.length;
        return {
          ...prev,
          [activeContainer]: prev[activeContainer]?.filter((item) => item.id !== active.id),
          [overContainer]: [
            ...prev[overContainer].slice(0, newIndex),
            { ...prev[activeContainer][activeIndex], priority: overContainer as Priority },
            ...prev[overContainer].slice(newIndex),
          ],
        };
      });

      // Also update the lane view groupedTasks
      setGroupedTasks((prev) => ({
        ...prev,
        [TaskType.NEWSPRINT]: (prev[TaskType.NEWSPRINT] || [])?.map((t) =>
          t.id === active.id ? { ...t, priority: overContainer as Priority } : t
        ),
      }));

      // Persist
      bulkTasksMutation.mutate({ tasks: [{ taskId: active.id as string, priority: overContainer as Priority }] });
    } else {
      // Reorder in same column
      const activeIndex = kanbanGroupTasks[activeContainer].findIndex((t) => t.id === active.id);
      const overIndex = kanbanGroupTasks[overContainer].findIndex((t) => t.id === over?.id);
      if (activeIndex !== overIndex) {
        setKanbanGroupTasks((items) => ({
          ...items,
          [activeContainer]: arrayMove(items[activeContainer], activeIndex, overIndex),
        }));
      }
    }
    setKanbanActiveId(null);
    setKanbanActiveTask(null);
  };

  const handleKanbanPriorityChange = (taskId: string, newPriority: Priority) => {
    setKanbanGroupTasks((prev) => {
      let foundTask: Task | null = null;
      const updated: PriorityGroup = { LOW: [], MEDIUM: [], HIGH: [], HIGHEST: [] };
      Object.keys(prev).forEach((key) => {
        updated[key as Priority] = prev[key as Priority]?.filter((task) => {
          if (task.id === taskId) { foundTask = { ...task, priority: newPriority }; return false; }
          return true;
        });
      });
      if (foundTask) updated[newPriority].push({ ...foundTask, priority: newPriority });
      return updated;
    });
  };

  // --- Selection helpers ---
  const toggleGroup = useCallback((taskType: TaskType) => {
    startTransition(() => {
      setExpandedGroups((prev) => ({ ...prev, [taskType]: !prev[taskType] }));
    });
  }, []);

  const handleSelectAll = (taskType: TaskType) => {
    const tasksInGroup = groupedTasks[taskType] || [];
    const currentSelected = selectedTasks[taskType];
    const allSelected = tasksInGroup.length > 0 && tasksInGroup.every((t) => currentSelected.has(t.id));
    setSelectedTasks((prev) => ({
      ...prev,
      [taskType]: allSelected ? new Set() : new Set(tasksInGroup?.map((t) => t.id)),
    }));
  };

  const selectedCount = Object.values(selectedTasks).reduce((sum, set) => sum + set.size, 0);

  const clearSelections = () => {
    setSelectedTasks({
      [TaskType.NEWSPRINT]: new Set(),
      [TaskType.BACKLOG]: new Set(),
      [TaskType.STAGING]: new Set(),
    });
  };

  // --- Sprint data ---
  const getSprintData = () => {
    const now = dayjs();
    let startDate: string;
    let endDate: string;
    let capacityMinutes: number;
    let selection = "";
    switch (selectedWindowType) {
      case SprintWindowType.TODAY:
        startDate = now.format("YYYY-MM-DD");
        endDate = now.format("YYYY-MM-DD");
        capacityMinutes = 480;
        selection = "Today";
        break;
      case SprintWindowType.THREEDAYS:
        startDate = now.format("YYYY-MM-DD");
        endDate = now.add(3, "day").format("YYYY-MM-DD");
        capacityMinutes = 1440;
        selection = "3 Days";
        break;
      case SprintWindowType.WEEK:
      default:
        startDate = now.format("YYYY-MM-DD");
        endDate = now.add(7, "day").format("YYYY-MM-DD");
        capacityMinutes = 2400;
        selection = "Weekly";
        break;
    }
    return { startDate, endDate, capacityMinutes, selection };
  };

  // Planned time from NEWSPRINT tasks
  const newSprintTasks = groupedTasks[TaskType.NEWSPRINT] || [];
  const totalPlannedMinutes = newSprintTasks.reduce(
    (total, task) => total + (task.totalEstimatedMinutes || 0), 0
  );

  const handleStartSprint = () => {
    const taskIds = newSprintTasks?.map((task) => task.id);
    if (taskIds.length === 0) {
      toast.error("Cannot create sprint without tasks in New Sprint");
      return;
    }
    const { startDate, endDate, capacityMinutes } = getSprintData();
    const sprintTitle = `${selectedWindowType === SprintWindowType.WEEK ? "Week" : selectedWindowType === SprintWindowType.TODAY ? "Today" : "3 Days"} Sprint - ${dayjs().format("MMM DD")}`;
    createSprint(
      { title: sprintTitle, windowType: selectedWindowType, startDate, endDate, capacityMinutes, taskIds },
      { onSuccess: (res) => router.push(RouteConfig.MasterKanBan.getPath(res.data.id)) }
    );
  };

  // --- Confirm actions ---
  const getConfirmTitle = (): string => {
    if (!pendingAction) return "";
    switch (pendingAction.type) {
      case "delete": return `Delete ${selectedCount} task${selectedCount > 1 ? "s" : ""}?`;
      case "lane": return `Change lane of ${selectedCount} selected task${selectedCount > 1 ? "s" : ""} to:`;
      case "priority": return `Change priority of ${selectedCount} selected task${selectedCount > 1 ? "s" : ""} to:`;
      case "status": return `Change status of ${selectedCount} selected task${selectedCount > 1 ? "s" : ""} to:`;
    }
  };

  const getConfirmDescription = (): React.ReactNode => {
    if (!pendingAction) return null;
    switch (pendingAction.type) {
      case "delete": return "This action cannot be undone.";
      case "lane": {
        const label = sprintStatusToLabelMapping()[pendingAction.value];
        const color = laneColorMap[pendingAction.value];
        return <span className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium text-white" style={{ backgroundColor: color }}>{label}</span>;
      }
      case "priority": {
        const { icon: Icon, color } = priorityIconMap[pendingAction.value];
        const label = priorityToLabelMapping()[pendingAction.value];
        return <span className="inline-flex items-center gap-2 text-sm font-medium text-white"><Icon className={`w-5 h-5 ${color}`} />{label}</span>;
      }
      case "status": {
        const label = statusToLabelMapping()[pendingAction.value];
        const color = statusToColorMapping()[pendingAction.value];
        return <span className="inline-flex items-center gap-2 text-sm font-medium text-white"><span className="w-3 h-3 rounded-full border-2" style={{ borderColor: color }} />{label}</span>;
      }
    }
  };

  const handleConfirmAction = () => {
    if (!pendingAction) return;
    const allIds = Object.entries(selectedTasks).flatMap(([, set]) => [...set]);
    if (!allIds.length) { setPendingAction(null); return; }

    switch (pendingAction.type) {
      case "delete": {
        setGroupedTasks((prev) => {
          const next = { ...prev };
          for (const type of LANE_TASK_TYPES) next[type] = prev[type]?.filter((t) => !allIds.includes(t.id));
          return next;
        });
        deleteBulkMutation.mutate({ taskIds: allIds });
        break;
      }
      case "lane": {
        const lane = pendingAction.value;
        setGroupedTasks((prev) => {
          const next = { ...prev };
          const movedTasks: BacklogTask[] = [];
          for (const type of LANE_TASK_TYPES) {
            const remaining: BacklogTask[] = [];
            for (const t of prev[type]) {
              if (allIds.includes(t.id)) movedTasks.push({ ...t, taskType: lane });
              else remaining.push(t);
            }
            next[type] = remaining;
          }
          next[lane] = [...(next[lane] || []), ...movedTasks];
          return next;
        });
        bulkTasksMutation.mutate({ tasks: allIds?.map((id) => ({ taskId: id, taskType: lane })) });
        break;
      }
      case "priority": {
        const priority = pendingAction.value;
        setGroupedTasks((prev) => {
          const next = { ...prev };
          for (const type of LANE_TASK_TYPES) next[type] = prev[type]?.map((t) => allIds.includes(t.id) ? { ...t, priority } : t);
          return next;
        });
        bulkTasksMutation.mutate({ tasks: allIds?.map((id) => ({ taskId: id, priority })) });
        break;
      }
      case "status": {
        const status = pendingAction.value;
        setGroupedTasks((prev) => {
          const next = { ...prev };
          for (const type of LANE_TASK_TYPES) next[type] = prev[type]?.map((t) => allIds.includes(t.id) ? { ...t, status } : t);
          return next;
        });
        bulkTasksMutation.mutate({ tasks: allIds?.map((id) => ({ taskId: id, status })) });
        break;
      }
    }
    clearSelections();
    setPendingAction(null);
  };

  const isDraggingLaneTask = laneDragData?.type === "task";

  const renderLane = (taskType: TaskType) => {
    const group = taskTypeGroups.find((g) => g.taskType === taskType)!;
    const isFetching = isFetchingGroup[taskType];
    const allTasksInGroup = isFetching ? [] : (groupedTasks[taskType] || []);
    const currentSort = groupSorts[taskType];
    const displayTasks = allTasksInGroup;
    const selected = selectedTasks[taskType];
    const allSelected = displayTasks.length > 0 && displayTasks.every((t) => selected.has(t.id));
    const isExpanded = expandedGroups[taskType];
    const isLoading = isFetching;

    const isGroupDropTarget = laneDropTarget?.groupType === taskType && !laneDropTarget?.taskId && isDraggingLaneTask;

    return (
      <div key={taskType} className="overflow-hidden mb-4">
        <div
          onClick={() => toggleGroup(taskType)}
          className={cn(
            "flex items-center justify-between px-5 py-3 w-full cursor-pointer transition-colors",
            isExpanded ? "rounded-t-xl rounded-b-none" : "rounded-xl",
            group.headerClass,
          )}
        >
          <div className="flex items-center gap-2.5">
            <span className="flex items-center justify-center px-2.5 py-1 rounded-2xl border border-white/40 text-xs font-semibold text-white">
              {displayTasks.length}
            </span>
            <span className="font-semibold text-sm text-white">{group.label}</span>
          </div>
          <div className="flex items-center gap-3">
            <div
              onClick={(e) => e.stopPropagation()}
              className="flex items-center gap-1.5 text-sm text-black bg-white border border-white rounded-full px-3 py-1 hover:bg-white/90 transition-colors"
            >
              <span className="text-base leading-none">+</span>
              Add
            </div>
            <div
              onClick={(e) => { e.stopPropagation(); handleSelectAll(taskType); }}
              className="flex items-center gap-2 text-sm text-foreground border border-border rounded-lg px-3 py-1 hover:bg-white/10 transition-colors"
            >
              <Checkbox
                checked={allSelected}
                className="border-foreground data-[state=checked]:bg-white data-[state=checked]:text-black h-4 w-4"
              />
              {allSelected ? "Deselect All" : "Select All"}
            </div>
          </div>
        </div>
        <div
          onDragOver={(e) => handleLaneGroupDragOver(e, taskType)}
          onDragLeave={handleLaneGroupDragLeave}
          onDrop={(e) => handleLaneDrop(e, taskType)}
          className={cn(
            isExpanded
              ? cn(
                  "border border-t-0 border-border rounded-b-xl p-4 flex flex-col gap-2 min-h-[250px]",
                  isGroupDropTarget && "bg-white/5 border-2 border-dashed border-teal-500/50",
                )
              : ""
          )}
        >
          <div className={isExpanded ? "" : "hidden"}>
              <div className="flex items-center gap-2 pb-2">
                <span className="text-xs text-muted-foreground mr-1">Sort by</span>
                <select
                  value={currentSort?.field === "estTime" ? currentSort.direction || "" : ""}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (!val) {
                      setGroupSorts((prev) => ({
                        ...prev,
                        [taskType]: { field: prev[taskType]?.field === "estTime" ? null : prev[taskType]?.field, direction: prev[taskType]?.field === "estTime" ? null : prev[taskType]?.direction },
                      }));
                    } else {
                      setGroupSorts((prev) => ({
                        ...prev,
                        [taskType]: { field: "estTime", direction: val as SortDirection },
                      }));
                    }
                  }}
                  className={cn(
                    "text-xs px-3 py-1.5 rounded-full border bg-transparent outline-none cursor-pointer appearance-none",
                    currentSort?.field === "estTime"
                      ? "bg-white/10 border-white/30 text-white"
                      : "border-border text-muted-foreground hover:text-white hover:border-white/20",
                  )}
                >
                  <option value="" className="bg-[#2a2a2a] text-white">Est Time</option>
                  <option value="desc" className="bg-[#2a2a2a] text-white">Est Time (Longest)</option>
                  <option value="asc" className="bg-[#2a2a2a] text-white">Est Time (Shortest)</option>
                </select>
                {([
                  { field: "priority" as SortField, label: "Priority" },
                  { field: "status" as SortField, label: "Progress" },
                ])?.map((sortOption) => {
                  const isActive = currentSort?.field === sortOption.field;
                  return (
                    <button
                      key={sortOption.field}
                      onClick={() => toggleSort(taskType, sortOption.field)}
                      className={cn(
                        "flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border transition-colors",
                        isActive
                          ? "bg-white/10 border-white/30 text-white"
                          : "border-border text-muted-foreground hover:text-white hover:border-white/20",
                      )}
                    >
                      {sortOption.label}
                      {isActive && currentSort?.direction === "desc" && <ArrowUp className="w-3 h-3" />}
                      {isActive && currentSort?.direction === "asc" && <ArrowDown className="w-3 h-3" />}
                      {!isActive && <ArrowUpDown className="w-3 h-3" />}
                    </button>
                  );
                })}
              </div>
              {isLoading ? (
                <>
                  {[1, 2, 3]?.map((i) => (
                    <div key={i} className="bg-card-foreground/10 rounded-lg p-4 animate-pulse">
                      <div className="h-4 bg-card-foreground/20 rounded w-3/4 mb-2" />
                      <div className="h-3 bg-card-foreground/20 rounded w-1/2" />
                    </div>
                  ))}
                </>
              ) : displayTasks.length > 0 ? (
                <TaskList
                  tasks={displayTasks}
                  groupType={taskType}
                  selectedTasks={selected}
                  onToggleSelect={(id) => {
                    setSelectedTasks((prev) => {
                      const next = new Set(prev[taskType]);
                      if (next.has(id)) next.delete(id); else next.add(id);
                      return { ...prev, [taskType]: next };
                    });
                  }}
                  onPriorityChange={(id, priority) => {
                    setGroupedTasks((prev) => ({
                      ...prev,
                      [taskType]: prev[taskType]?.map((t) => t.id === id ? { ...t, priority } : t),
                    }));
                    bulkTasksMutation.mutate({ tasks: [{ taskId: id, priority }] });
                  }}
                  onStatusChange={(id, newStatus) => {
                    setGroupedTasks((prev) => ({
                      ...prev,
                      [taskType]: prev[taskType]?.map((t) => t.id === id ? { ...t, status: newStatus } : t),
                    }));
                    bulkTasksMutation.mutate({ tasks: [{ taskId: id, status: newStatus }] });
                  }}
                  onTaskDragStart={handleLaneTaskDragStart}
                  onTaskDragOver={handleLaneTaskDragOver}
                  onTaskDrop={handleLaneDrop}
                  onTaskDragEnd={handleLaneDragEnd}
                  dropTargetTaskId={laneDropTarget?.groupType === taskType ? (laneDropTarget?.taskId ?? null) : null}
                  dropPosition={laneDropTarget?.groupType === taskType ? (laneDropTarget?.position ?? null) : null}
                />
              ) : (
                <div className="text-center text-muted-foreground py-8 text-sm">No tasks in this group</div>
              )}
          </div>
        </div>
      </div>
    );
  };

  const renderSearchFilter = () => (
    <div className="flex items-center justify-between gap-4 py-2">
      <div className="relative flex-1 flex items-center">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          classWrapper="flex-1"
          type="text"
          placeholder="Search tasks"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-[#2a2a2a] border-border rounded-md pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>
      <div className="flex items-center gap-3">
        <Button
          onClick={() => setIsFilterOpen(true)}
          className={cn(
            "rounded-lg flex items-center gap-2",
            activeFilters.priority.length > 0 || activeFilters.progress.length > 0
              ? "bg-accent text-accent-foreground"
              : "bg-secondary-card/70 text-foreground hover:bg-secondary-card",
          )}
        >
          <Filter className="w-4 h-4" />
          Filters
        </Button>
      </div>
    </div>
  );

  return (
    <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
      <div className="h-screen bg-background text-white  pt-10 pb-4 flex flex-col">
        {/* Header */}
        <div className="mx-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-xl font-semibold">Start New Sprint</h1>
              <p className="text-sm text-muted-foreground">Full planning inventory</p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                onClick={() => router.push(RouteConfig.BackLog.path)}
                className="px-4 py-2 bg-accent hover:bg-ring transition-colors text-sm text-accent-foreground rounded-2xl"
              >
                <X className="w-4 h-4 mr-1" />
                Close
              </Button>
            </div>
          </div>

          {/* Planning Window Tabs */}
          <div className="flex justify-center mb-4">
            <Tabs
              defaultValue="weekly"
              className="select-none text-foreground"
              onValueChange={(value) => {
                if (value === "today") setSelectedWindowType(SprintWindowType.TODAY);
                else if (value === "3days") setSelectedWindowType(SprintWindowType.THREEDAYS);
                else setSelectedWindowType(SprintWindowType.WEEK);
              }}
            >
              <TabsList className="bg-[#1a1a1a] border border-gray-800">
                <TabsTrigger className="data-[state=active]:bg-green-400/33! p-3" value="today">Today</TabsTrigger>
                <TabsTrigger className="data-[state=active]:bg-green-400/33! p-3" value="3days">3 Days</TabsTrigger>
                <TabsTrigger className="data-[state=active]:bg-green-400/33! p-3 relative" value="weekly">
                  <Tag className="bg-green-400/33! absolute -top-8 text-[10px]! rounded-2xl!">Recommended</Tag>
                  Weekly
                </TabsTrigger>
                <button
                  onClick={() => setShowCalendarComingSoon(true)}
                  className="bg-secondary-card ml-2 flex gap-2 items-center rounded-lg border px-4 py-0.4 border-border"
                >
                  <Calendar className="w-4 h-4" />
                  <span>{showCalendarComingSoon ? "Coming Soon" : "Connect Calendar"}</span>
                </button>
              </TabsList>
              <div className="text-muted-foreground text-sm text-right">
                Planning window - Weekly is recommended.
              </div>
            </Tabs>
          </div>

          {/* Planned Bar */}
          <PlannedBar
            totalCapacity={getSprintData().capacityMinutes}
            totalPlanned={totalPlannedMinutes}
            durationLabel={getSprintData().selection}
          />

          {/* View Toggle */}
          <div className="flex justify-center gap-2 mb-4 text-sm text-muted-foreground">
            <button
              onClick={() => setViewMode("lane")}
              className={cn("px-3 py-1 rounded transition-colors", viewMode === "lane" ? "text-white font-semibold" : "hover:text-white")}
            >
              Lane View
            </button>
            <span>/</span>
            <button
              onClick={() => setViewMode("kanban")}
              className={cn("px-3 py-1 rounded transition-colors", viewMode === "kanban" ? "text-white font-semibold" : "hover:text-white")}
            >
              Kanban View
            </button>
          </div>
        </div>

        {/* Main scrollable area */}
        <div ref={mainContainerRef} className="flex-1 min-h-0 overflow-auto scrollbar-hide [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <div className="px-6 py-4 space-y-1">
            {viewMode === "lane" ? (
              <>
                {/* New Sprint lane (fixed at top, not group-draggable) */}
                {renderLane(TaskType.NEWSPRINT)}
                {renderSearchFilter()}
                {/* Backlog & Staging lanes (group-draggable) */}
                {orderedGroups?.map((group) => {
                  const isFetching = isFetchingGroup[group.taskType];
                  const allTasksInGroup = isFetching ? [] : (groupedTasks[group.taskType] || []);
                  const currentSort = groupSorts[group.taskType];
                  const displayTasks = allTasksInGroup;
                  const selected = selectedTasks[group.taskType];
                  const allSelected = displayTasks.length > 0 && displayTasks.every((t) => selected.has(t.id));
                  const isExpanded = expandedGroups[group.taskType];
                  const isLoading = isFetching;
                  const isGroupDropTarget = laneDropTarget?.groupType === group.taskType && !laneDropTarget?.taskId && isDraggingLaneTask;

                  return (
                    <div
                      key={group.taskType}
                      style={{ opacity: laneDragData?.type === "group" && laneDragData.id === group.taskType ? 0.5 : 1 }}
                      className="transition-opacity"
                    >
                      <div className="overflow-hidden mb-4">
                        <div
                          draggable
                          onDragStart={(e) => handleLaneGroupHeaderDragStart(e, group.taskType)}
                          onDragOver={(e) => handleLaneGroupHeaderDragOver(e, group.taskType)}
                          onDrop={(e) => handleLaneGroupHeaderDrop(e, group.taskType)}
                          onDragEnd={handleLaneDragEnd}
                          onClick={() => toggleGroup(group.taskType)}
                          className={cn(
                            "flex items-center justify-between px-5 py-3 w-full cursor-grab active:cursor-grabbing transition-colors",
                            isExpanded ? "rounded-t-xl rounded-b-none" : "rounded-xl",
                            group.headerClass,
                          )}
                        >
                          <div className="flex items-center gap-2.5">
                            <span className="flex items-center justify-center px-2.5 py-1 rounded-2xl border border-white/40 text-xs font-semibold text-white">
                              {displayTasks.length}
                            </span>
                            <span className="font-semibold text-sm text-white">{group.label}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <div
                              onClick={(e) => e.stopPropagation()}
                              className="flex items-center gap-1.5 text-sm text-black bg-white border border-white rounded-full px-3 py-1 hover:bg-white/90 transition-colors"
                            >
                              <span className="text-base leading-none">+</span>
                              Add
                            </div>
                            <div
                              onClick={(e) => { e.stopPropagation(); handleSelectAll(group.taskType); }}
                              className="flex items-center gap-2 text-sm text-foreground border border-border rounded-lg px-3 py-1 hover:bg-white/10 transition-colors"
                            >
                              <Checkbox
                                checked={allSelected}
                                className="border-foreground data-[state=checked]:bg-white data-[state=checked]:text-black h-4 w-4"
                              />
                              {allSelected ? "Deselect All" : "Select All"}
                            </div>
                          </div>
                        </div>
                        <div
                          onDragOver={(e) => handleLaneGroupDragOver(e, group.taskType)}
                          onDragLeave={handleLaneGroupDragLeave}
                          onDrop={(e) => handleLaneDrop(e, group.taskType)}
                          className={cn(
                            isExpanded
                              ? cn(
                                  "border border-t-0 border-border rounded-b-xl p-4 flex flex-col gap-2 min-h-[250px]",
                                  isGroupDropTarget && "bg-white/5 border-2 border-dashed border-teal-500/50",
                                )
                              : ""
                          )}
                        >
                          <div className={isExpanded ? "" : "hidden"}>
                              <div className="flex items-center gap-2 pb-2">
                                <span className="text-xs text-muted-foreground mr-1">Sort by</span>
                                <select
                                  value={currentSort?.field === "estTime" ? currentSort.direction || "" : ""}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    if (!val) {
                                      setGroupSorts((prev) => ({
                                        ...prev,
                                        [group.taskType]: { field: prev[group.taskType]?.field === "estTime" ? null : prev[group.taskType]?.field, direction: prev[group.taskType]?.field === "estTime" ? null : prev[group.taskType]?.direction },
                                      }));
                                    } else {
                                      setGroupSorts((prev) => ({
                                        ...prev,
                                        [group.taskType]: { field: "estTime", direction: val as SortDirection },
                                      }));
                                    }
                                  }}
                                  className={cn(
                                    "text-xs px-3 py-1.5 rounded-full border bg-transparent outline-none cursor-pointer appearance-none",
                                    currentSort?.field === "estTime"
                                      ? "bg-white/10 border-white/30 text-white"
                                      : "border-border text-muted-foreground hover:text-white hover:border-white/20",
                                  )}
                                >
                                  <option value="" className="bg-[#2a2a2a] text-white">Est Time</option>
                                  <option value="desc" className="bg-[#2a2a2a] text-white">Est Time (Longest)</option>
                                  <option value="asc" className="bg-[#2a2a2a] text-white">Est Time (Shortest)</option>
                                </select>
                                {([
                                  { field: "priority" as SortField, label: "Priority" },
                                  { field: "status" as SortField, label: "Progress" },
                                ])?.map((sortOption) => {
                                  const isActive = currentSort?.field === sortOption.field;
                                  return (
                                    <button
                                      key={sortOption.field}
                                      onClick={() => toggleSort(group.taskType, sortOption.field)}
                                      className={cn(
                                        "flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border transition-colors",
                                        isActive
                                          ? "bg-white/10 border-white/30 text-white"
                                          : "border-border text-muted-foreground hover:text-white hover:border-white/20",
                                      )}
                                    >
                                      {sortOption.label}
                                      {isActive && currentSort?.direction === "desc" && <ArrowUp className="w-3 h-3" />}
                                      {isActive && currentSort?.direction === "asc" && <ArrowDown className="w-3 h-3" />}
                                      {!isActive && <ArrowUpDown className="w-3 h-3" />}
                                    </button>
                                  );
                                })}
                              </div>
                              {isLoading ? (
                                <>
                                  {[1, 2, 3]?.map((i) => (
                                    <div key={i} className="bg-card-foreground/10 rounded-lg p-4 animate-pulse">
                                      <div className="h-4 bg-card-foreground/20 rounded w-3/4 mb-2" />
                                      <div className="h-3 bg-card-foreground/20 rounded w-1/2" />
                                    </div>
                                  ))}
                                </>
                              ) : displayTasks.length > 0 ? (
                                <TaskList
                                  tasks={displayTasks}
                                  groupType={group.taskType}
                                  selectedTasks={selected}
                                  onToggleSelect={(id) => {
                                    setSelectedTasks((prev) => {
                                      const next = new Set(prev[group.taskType]);
                                      if (next.has(id)) next.delete(id); else next.add(id);
                                      return { ...prev, [group.taskType]: next };
                                    });
                                  }}
                                  onPriorityChange={(id, priority) => {
                                    setGroupedTasks((prev) => ({
                                      ...prev,
                                      [group.taskType]: prev[group.taskType]?.map((t) => t.id === id ? { ...t, priority } : t),
                                    }));
                                    bulkTasksMutation.mutate({ tasks: [{ taskId: id, priority }] });
                                  }}
                                  onStatusChange={(id, newStatus) => {
                                    setGroupedTasks((prev) => ({
                                      ...prev,
                                      [group.taskType]: prev[group.taskType]?.map((t) => t.id === id ? { ...t, status: newStatus } : t),
                                    }));
                                    bulkTasksMutation.mutate({ tasks: [{ taskId: id, status: newStatus }] });
                                  }}
                                  onTaskDragStart={handleLaneTaskDragStart}
                                  onTaskDragOver={handleLaneTaskDragOver}
                                  onTaskDrop={handleLaneDrop}
                                  onTaskDragEnd={handleLaneDragEnd}
                                  dropTargetTaskId={laneDropTarget?.groupType === group.taskType ? (laneDropTarget?.taskId ?? null) : null}
                                  dropPosition={laneDropTarget?.groupType === group.taskType ? (laneDropTarget?.position ?? null) : null}
                                />
                              ) : (
                                <div className="text-center text-muted-foreground py-8 text-sm">No tasks in this group</div>
                              )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </>
            ) : (
              <>
                {/* Kanban View for New Sprint */}
                <div className="flex flex-col overflow-x-auto scrollbar-hide [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] mb-4">
                  <DndContext 
                    sensors={sensors}
                    collisionDetection={pointerWithin}
                    onDragStart={handleKanbanDragStart}
                    onDragOver={() => {}}
                    onDragEnd={handleKanbanDragEnd}
                  >
                    <div className="min-w-[1400px] xl:min-w-auto max-h-[500px] bg-card p-4 px-2 rounded-lg flex justify-evenly gap-4">
                      {(Object.keys(kanbanColumnConfig) as Priority[])?.map((priority) => {
                        const config = kanbanColumnConfig[priority];
                        const tasks = kanbanGroupTasks[priority] || [];
                        return (
                          <SortableContext
                            key={priority}
                            id={priority}
                            items={tasks?.map((task) => task.id)}
                            strategy={verticalListSortingStrategy}
                          >
                            <div className={`w-[350px] border-border border flex flex-col ${config.bgColor} ${config.borderColor} rounded-2xl p-4`}>
                              <div className="flex items-center justify-between mb-4 shrink-0 min-h-[34px]">
                                <h2 className="text-white font-semibold">{config.title}</h2>
                              </div>
                              <DroppableColumn id={priority} className="flex-1 space-y-3 overflow-auto min-h-0 scrollbar-hide [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                                {isFetchingGroup[TaskType.NEWSPRINT] ? (
                                  <>
                                    {[1, 2, 3]?.map((i) => (
                                      <div key={i} className="bg-card-foreground/10 rounded-lg p-4 animate-pulse">
                                        <div className="h-4 bg-card-foreground/20 rounded w-3/4 mb-2" />
                                        <div className="h-3 bg-card-foreground/20 rounded w-1/2" />
                                      </div>
                                    ))}
                                  </>
                                ) : (
                                  tasks?.map((task) => (
                                    <SortableKanbanItem key={task.id} id={task.id}>
                                      <KanBanItem
                                        isDefering={false}
                                        isSelected={false}
                                        isLoading={false}
                                        item={task}
                                        title={task.title}
                                        setSelectedTasks={() => {}}
                                        timeEstimate={formatTimeFromMinutes(task.totalEstimatedMinutes)}
                                        isStarred={task.priority === Priority.Highest}
                                        onEdit={() => {}}
                                        onToggleStar={() => {}}
                                        onPriorityChange={handleKanbanPriorityChange}
                                        onClick={() => {}}
                                      />
                                    </SortableKanbanItem>
                                  ))
                                )}
                              </DroppableColumn>
                            </div>
                          </SortableContext>
                        );
                      })}
                    </div>
                    <DragOverlay dropAnimation={{ duration: 200, easing: "cubic-bezier(0.18, 0.67, 0.6, 1.22)" }}>
                      {kanbanActiveId && kanbanActiveTask ? (
                        <div className="rotate-3 opacity-90 scale-105">
                          <KanBanItem
                            isDefering={false}
                            isSelected={false}
                            isLoading={false}
                            item={kanbanActiveTask}
                            title={kanbanActiveTask.title}
                            setSelectedTasks={() => {}}
                            timeEstimate={formatTimeFromMinutes(kanbanActiveTask.totalEstimatedMinutes)}
                            isStarred={kanbanActiveTask.priority === Priority.Highest}
                            onEdit={() => {}}
                            onToggleStar={() => {}}
                            onPriorityChange={handleKanbanPriorityChange}
                            onClick={() => {}}
                          />
                        </div>
                      ) : null}
                    </DragOverlay>
                  </DndContext>
                </div>
                {renderSearchFilter()}
                {/* Backlog & Staging lanes with group reorder (native drag) */}
                {orderedGroups?.map((group) => {
                  const isFetching = isFetchingGroup[group.taskType];
                  const allTasksInGroup = isFetching ? [] : (groupedTasks[group.taskType] || []);
                  const currentSort = groupSorts[group.taskType];
                  const displayTasks = allTasksInGroup;
                  const selected = selectedTasks[group.taskType];
                  const allSelected = displayTasks.length > 0 && displayTasks.every((t) => selected.has(t.id));
                  const isExpanded = expandedGroups[group.taskType];
                  const isLoading = isFetching;
                  const isGroupDropTarget = laneDropTarget?.groupType === group.taskType && !laneDropTarget?.taskId && isDraggingLaneTask;

                  return (
                    <div
                      key={group.taskType}
                      style={{ opacity: laneDragData?.type === "group" && laneDragData.id === group.taskType ? 0.5 : 1 }}
                      className="transition-opacity"
                    >
                      <div className="overflow-hidden mb-4">
                        <div
                          draggable
                          onDragStart={(e) => handleLaneGroupHeaderDragStart(e, group.taskType)}
                          onDragOver={(e) => handleLaneGroupHeaderDragOver(e, group.taskType)}
                          onDrop={(e) => handleLaneGroupHeaderDrop(e, group.taskType)}
                          onDragEnd={handleLaneDragEnd}
                          onClick={() => toggleGroup(group.taskType)}
                          className={cn(
                            "flex items-center justify-between px-5 py-3 w-full cursor-grab active:cursor-grabbing transition-colors",
                            isExpanded ? "rounded-t-xl rounded-b-none" : "rounded-xl",
                            group.headerClass,
                          )}
                        >
                          <div className="flex items-center gap-2.5">
                            <span className="flex items-center justify-center px-2.5 py-1 rounded-2xl border border-white/40 text-xs font-semibold text-white">
                              {displayTasks.length}
                            </span>
                            <span className="font-semibold text-sm text-white">{group.label}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <div
                              onClick={(e) => e.stopPropagation()}
                              className="flex items-center gap-1.5 text-sm text-black bg-white border border-white rounded-full px-3 py-1 hover:bg-white/90 transition-colors"
                            >
                              <span className="text-base leading-none">+</span>
                              Add
                            </div>
                            <div
                              onClick={(e) => { e.stopPropagation(); handleSelectAll(group.taskType); }}
                              className="flex items-center gap-2 text-sm text-foreground border border-border rounded-lg px-3 py-1 hover:bg-white/10 transition-colors"
                            >
                              <Checkbox
                                checked={allSelected}
                                className="border-foreground data-[state=checked]:bg-white data-[state=checked]:text-black h-4 w-4"
                              />
                              {allSelected ? "Deselect All" : "Select All"}
                            </div>
                          </div>
                        </div>
                        <div
                          onDragOver={(e) => handleLaneGroupDragOver(e, group.taskType)}
                          onDragLeave={handleLaneGroupDragLeave}
                          onDrop={(e) => handleLaneDrop(e, group.taskType)}
                          className={cn(
                            isExpanded
                              ? cn(
                                  "border border-t-0 border-border rounded-b-xl p-4 flex flex-col gap-2 min-h-[250px]",
                                  isGroupDropTarget && "bg-white/5 border-2 border-dashed border-teal-500/50",
                                )
                              : ""
                          )}
                        >
                          <div className={isExpanded ? "" : "hidden"}>
                              <div className="flex items-center gap-2 pb-2">
                                <span className="text-xs text-muted-foreground mr-1">Sort by</span>
                                <select
                                  value={currentSort?.field === "estTime" ? currentSort.direction || "" : ""}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    if (!val) {
                                      setGroupSorts((prev) => ({
                                        ...prev,
                                        [group.taskType]: { field: prev[group.taskType]?.field === "estTime" ? null : prev[group.taskType]?.field, direction: prev[group.taskType]?.field === "estTime" ? null : prev[group.taskType]?.direction },
                                      }));
                                    } else {
                                      setGroupSorts((prev) => ({
                                        ...prev,
                                        [group.taskType]: { field: "estTime", direction: val as SortDirection },
                                      }));
                                    }
                                  }}
                                  className={cn(
                                    "text-xs px-3 py-1.5 rounded-full border bg-transparent outline-none cursor-pointer appearance-none",
                                    currentSort?.field === "estTime"
                                      ? "bg-white/10 border-white/30 text-white"
                                      : "border-border text-muted-foreground hover:text-white hover:border-white/20",
                                  )}
                                >
                                  <option value="" className="bg-[#2a2a2a] text-white">Est Time</option>
                                  <option value="desc" className="bg-[#2a2a2a] text-white">Est Time (Longest)</option>
                                  <option value="asc" className="bg-[#2a2a2a] text-white">Est Time (Shortest)</option>
                                </select>
                                {([
                                  { field: "priority" as SortField, label: "Priority" },
                                  { field: "status" as SortField, label: "Progress" },
                                ])?.map((sortOption) => {
                                  const isActive = currentSort?.field === sortOption.field;
                                  return (
                                    <button
                                      key={sortOption.field}
                                      onClick={() => toggleSort(group.taskType, sortOption.field)}
                                      className={cn(
                                        "flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border transition-colors",
                                        isActive
                                          ? "bg-white/10 border-white/30 text-white"
                                          : "border-border text-muted-foreground hover:text-white hover:border-white/20",
                                      )}
                                    >
                                      {sortOption.label}
                                      {isActive && currentSort?.direction === "desc" && <ArrowUp className="w-3 h-3" />}
                                      {isActive && currentSort?.direction === "asc" && <ArrowDown className="w-3 h-3" />}
                                      {!isActive && <ArrowUpDown className="w-3 h-3" />}
                                    </button>
                                  );
                                })}
                              </div>
                              {isLoading ? (
                                <>
                                  {[1, 2, 3]?.map((i) => (
                                    <div key={i} className="bg-card-foreground/10 rounded-lg p-4 animate-pulse">
                                      <div className="h-4 bg-card-foreground/20 rounded w-3/4 mb-2" />
                                      <div className="h-3 bg-card-foreground/20 rounded w-1/2" />
                                    </div>
                                  ))}
                                </>
                              ) : displayTasks.length > 0 ? (
                                <TaskList
                                  tasks={displayTasks}
                                  groupType={group.taskType}
                                  selectedTasks={selected}
                                  onToggleSelect={(id) => {
                                    setSelectedTasks((prev) => {
                                      const next = new Set(prev[group.taskType]);
                                      if (next.has(id)) next.delete(id); else next.add(id);
                                      return { ...prev, [group.taskType]: next };
                                    });
                                  }}
                                  onPriorityChange={(id, priority) => {
                                    setGroupedTasks((prev) => ({
                                      ...prev,
                                      [group.taskType]: prev[group.taskType]?.map((t) => t.id === id ? { ...t, priority } : t),
                                    }));
                                    bulkTasksMutation.mutate({ tasks: [{ taskId: id, priority }] });
                                  }}
                                  onStatusChange={(id, newStatus) => {
                                    setGroupedTasks((prev) => ({
                                      ...prev,
                                      [group.taskType]: prev[group.taskType]?.map((t) => t.id === id ? { ...t, status: newStatus } : t),
                                    }));
                                    bulkTasksMutation.mutate({ tasks: [{ taskId: id, status: newStatus }] });
                                  }}
                                  onTaskDragStart={handleLaneTaskDragStart}
                                  onTaskDragOver={handleLaneTaskDragOver}
                                  onTaskDrop={handleLaneDrop}
                                  onTaskDragEnd={handleLaneDragEnd}
                                  dropTargetTaskId={laneDropTarget?.groupType === group.taskType ? (laneDropTarget?.taskId ?? null) : null}
                                  dropPosition={laneDropTarget?.groupType === group.taskType ? (laneDropTarget?.position ?? null) : null}
                                />
                              ) : (
                                <div className="text-center text-muted-foreground py-8 text-sm">No tasks in this group</div>
                              )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </>
            )}
          </div>
        </div>

        {/* Commit to Sprint button */}
        <div className="flex justify-end px-6 py-4">
          <Button
            onClick={() => setOpenConfirmModal(true)}
            disabled={newSprintTasks.length === 0}
            className="disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Commit to Sprint
            <Sparkles className="ml-2 w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Filter panel */}
      <BacklogFilter
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        onApply={(filters) => setActiveFilters(filters)}
        initialFilters={activeFilters}
      />

      {/* Bottom Toolbar */}
      <div className="fixed bottom-[50px] left-1/2 -translate-x-1/2 z-80">
        <ToolBar
            hasSelection={Object.values(selectedTasks).some((set) => set.size > 0)}
            isAllSelected={
              Object.values(selectedTasks).some((set) => set.size > 0) &&
              Object.entries(groupedTasks).every(
                ([type, tasks]) => tasks.every((t) => selectedTasks[type as TaskType]?.has(t.id)),
              )
            }
            onChangeLane={(lane) => setPendingAction({ type: "lane", value: lane })}
            onChangePriority={(priority) => setPendingAction({ type: "priority", value: priority })}
            onChangeStatus={(status) => setPendingAction({ type: "status", value: status })}
            onShuffle={handleReshuffle}
            isShuffling={isShuffling}
            onDelete={() => setPendingAction({ type: "delete" })}
            onSelectAll={() => {
              const hasAnySelection = Object.values(selectedTasks).some((set) => set.size > 0);
              const allSelected = hasAnySelection && Object.entries(groupedTasks).every(
                ([type, tasks]) => tasks.every((t) => selectedTasks[type as TaskType]?.has(t.id)),
              );
              if (allSelected) {
                clearSelections();
              } else {
                setSelectedTasks({
                  [TaskType.NEWSPRINT]: new Set(groupedTasks[TaskType.NEWSPRINT]?.map((t) => t.id)),
                  [TaskType.BACKLOG]: new Set(groupedTasks[TaskType.BACKLOG]?.map((t) => t.id)),
                  [TaskType.STAGING]: new Set(groupedTasks[TaskType.STAGING]?.map((t) => t.id)),
                });
              }
            }}
          />
      </div>

      {/* Confirm dialogs */}
      <ConfirmDialog
        open={!!pendingAction}
        title={getConfirmTitle()}
        description={getConfirmDescription()}
        confirmText="OK"
        cancelText="Cancel"
        onConfirm={handleConfirmAction}
        onCancel={() => setPendingAction(null)}
      />

      <ConfirmModal
        tasksCount={newSprintTasks.length}
        plannedTime={formatTimeFromMinutes(totalPlannedMinutes)}
        totalPlannedMinutes={totalPlannedMinutes}
        totalCapacityMinutes={getSprintData().capacityMinutes}
        sprintDuration={getSprintData().selection}
        open={openConfirmModal}
        onOpenChange={setOpenConfirmModal}
        onStartSprint={handleStartSprint}
        isLoading={isCreatingSprint}
      />
    </div>
  );
}
