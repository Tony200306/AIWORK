"use client";

import { DoubleTriagle } from "@/components/icon/DoubleTriagle";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { RouteConfig } from "@/constants/RouteConfig";
import { useGetTaskLists } from "@/hooks/shared/useGetTaskLists";
import { useReshuffleBacklog } from "@/hooks/shared/useReshuffleBacklog";
import { useDebounce } from "@/hooks/useDebounce";
import { cn } from "@/lib/utils";
import {
  Priority,
  Task,
  TaskStatus,
  TaskType,
  priorityToLabelMapping,
  sprintStatusToLabelMapping,
  statusToColorMapping,
  statusToLabelMapping,
} from "@/models/Task";
import { ReshuffleBacklogTaskInput } from "@/services/braindump/reshuffleBacklog";
import { mapPriorityFromInt } from "@/services/braindump/reshufflePriorities";
import { deleteBulkTasks } from "@/services/task/deleteBulkTasks";
import { GetTasksParams } from "@/services/task/getTasks";
import { updateBulkTasks } from "@/services/task/updateBulkTasks";
import { updateTask } from "@/services/task/updateTask";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  Circle,
  Filter,
  Search,
  Star,
  Triangle,
} from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import BacklogFilter, { FilterState } from "../filter/BacklogFilter";
import ToolBar from "../ToolBar";
import { TaskList } from "./TaskList";

type BacklogTask = Task & { steps: NonNullable<Task["steps"]> };

type GroupedTasks = Record<string, BacklogTask[]>;

type SortField = "estTime" | "priority" | "status" | "score" | "locked";
type SortDirection = "asc" | "desc" | null;
type GroupSortState = Record<string, { field: SortField | null; direction: SortDirection }>;

// Map sort field to API sortBy param (score and locked are client-side only)
const sortFieldToApiSortBy: Partial<Record<SortField, GetTasksParams["sortBy"]>> = {
  estTime: "expectedTimeHours",
  priority: "priority",
  status: "status",
};

// Normalize API tasks to ensure steps are always an array
function normalizeTask(task: Task): BacklogTask {
  return { ...task, steps: task.steps || [] };
}

function arrayMove<T>(arr: T[], from: number, to: number): T[] {
  const result = [...arr];
  const [item] = result.splice(from, 1);
  result.splice(to, 0, item);
  return result;
}

const taskTypeGroups = [
  {
    taskType: TaskType.BACKLOG,
    label: "Backlog",
    headerClass: "bg-accent",
  },
  {
    taskType: TaskType.ACTIVE,
    label: "Active Sprint",
    headerClass: "bg-[#007A7A]",
  },
  {
    taskType: TaskType.STAGING,
    label: "Planning",
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
  [TaskType.ACTIVE]: "#007A7A",
  [TaskType.STAGING]: "#C97B00",
};

type PendingAction =
  | { type: "delete" }
  | { type: "lane"; value: TaskType }
  | { type: "priority"; value: Priority }
  | { type: "status"; value: TaskStatus };

// Drag data stored in dataTransfer
interface DragPayload {
  type: "task" | "group";
  id: string;
  sourceGroup: TaskType;
}

export default function BackLogList() {
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
  const [selectedTasks, setSelectedTasks] = useState<Record<string, Set<string>>>({
    [TaskType.BACKLOG]: new Set(),
    [TaskType.ACTIVE]: new Set(),
    [TaskType.STAGING]: new Set(),
  });
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({
    [TaskType.BACKLOG]: true,
    [TaskType.ACTIVE]: false,
    [TaskType.STAGING]: false,
  });

  const [pendingAction, setPendingAction] = useState<PendingAction | null>(null);

  const [groupOrder, setGroupOrder] = useState<TaskType[]>([
    TaskType.BACKLOG,
    TaskType.ACTIVE,
    TaskType.STAGING,
  ]);

  const orderedGroups = groupOrder?.map(
    (taskType) => taskTypeGroups.find((g) => g.taskType === taskType)!
  );

  const [groupSorts, setGroupSorts] = useState<GroupSortState>({
    [TaskType.BACKLOG]: { field: "score", direction: "desc" },
    [TaskType.ACTIVE]: { field: "score", direction: "desc" },
    [TaskType.STAGING]: { field: "score", direction: "desc" },
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

  // Build API params for each group
  const buildQueryParams = (taskType: TaskType): GetTasksParams => {
    const sort = groupSorts[taskType];
    const apiSortBy = sort.field ? sortFieldToApiSortBy[sort.field] : undefined;
    return {
      taskType,
      limit: 1000,
      search: debouncedSearch || undefined,
      priority: activeFilters.priority.length ? activeFilters.priority as Priority[] : undefined,
      status: activeFilters.progress.length ? activeFilters.progress as TaskStatus[] : undefined,
      sortBy: apiSortBy,
      sortOrder: apiSortBy && sort.direction ? sort.direction : undefined,
    };
  };

  // 3 API calls - one per group
  const backlogParams = useMemo(() => buildQueryParams(TaskType.BACKLOG), [groupSorts, debouncedSearch, activeFilters.priority, activeFilters.progress]);
  const activeParams = useMemo(() => buildQueryParams(TaskType.ACTIVE), [groupSorts, debouncedSearch, activeFilters.priority, activeFilters.progress]);
  const stagingParams = useMemo(() => buildQueryParams(TaskType.STAGING), [groupSorts, debouncedSearch, activeFilters.priority, activeFilters.progress]);

  const backlogQuery = useGetTaskLists(backlogParams);
  const activeQuery = useGetTaskLists(activeParams);
  const stagingQuery = useGetTaskLists(stagingParams);

  const queryMap: Record<string, typeof backlogQuery> = {
    [TaskType.BACKLOG]: backlogQuery,
    [TaskType.ACTIVE]: activeQuery,
    [TaskType.STAGING]: stagingQuery,
  };

  // Track which groups are currently fetching (for skeleton during sort/filter)
  // Initialize as true so skeleton shows immediately on page load
  const [isFetchingGroup, setIsFetchingGroup] = useState<Record<string, boolean>>({
    [TaskType.BACKLOG]: true,
    [TaskType.ACTIVE]: true,
    [TaskType.STAGING]: true,
  });

  // Sync API data into local state
  const [groupedTasks, setGroupedTasks] = useState<GroupedTasks>({
    [TaskType.BACKLOG]: [],
    [TaskType.ACTIVE]: [],
    [TaskType.STAGING]: [],
  });

  useEffect(() => {
    const isFetching = backlogQuery.isLoading || backlogQuery.isFetching;
    setIsFetchingGroup((prev) => {
      if (prev[TaskType.BACKLOG] !== isFetching) {
        if (isFetching && !prev[TaskType.BACKLOG]) {
          setGroupedTasks((p) => ({ ...p, [TaskType.BACKLOG]: [] }));
        }
        return { ...prev, [TaskType.BACKLOG]: isFetching };
      }
      return prev;
    });

    if (backlogQuery.data?.data && !isFetching) {
      setGroupedTasks((prev) => ({ ...prev, [TaskType.BACKLOG]: backlogQuery.data.data?.map(normalizeTask) }));
    }
  }, [backlogQuery.data, backlogQuery.isLoading, backlogQuery.isFetching]);

  useEffect(() => {
    const isFetching = activeQuery.isLoading || activeQuery.isFetching;
    setIsFetchingGroup((prev) => {
      if (prev[TaskType.ACTIVE] !== isFetching) {
        if (isFetching && !prev[TaskType.ACTIVE]) {
          setGroupedTasks((p) => ({ ...p, [TaskType.ACTIVE]: [] }));
        }
        return { ...prev, [TaskType.ACTIVE]: isFetching };
      }
      return prev;
    });

    if (activeQuery.data?.data && !isFetching) {
      setGroupedTasks((prev) => ({ ...prev, [TaskType.ACTIVE]: activeQuery.data.data?.map(normalizeTask) }));
    }
  }, [activeQuery.data, activeQuery.isLoading, activeQuery.isFetching]);

  useEffect(() => {
    const isFetching = stagingQuery.isLoading || stagingQuery.isFetching;
    setIsFetchingGroup((prev) => {
      if (prev[TaskType.STAGING] !== isFetching) {
        if (isFetching && !prev[TaskType.STAGING]) {
          setGroupedTasks((p) => ({ ...p, [TaskType.STAGING]: [] }));
        }
        return { ...prev, [TaskType.STAGING]: isFetching };
      }
      return prev;
    });

    if (stagingQuery.data?.data && !isFetching) {
      setGroupedTasks((prev) => ({ ...prev, [TaskType.STAGING]: stagingQuery.data.data?.map(normalizeTask) }));
    }
  }, [stagingQuery.data, stagingQuery.isLoading, stagingQuery.isFetching]);

  // ──────────────── Native Drag & Drop State ────────────────
  const [dragData, setDragData] = useState<DragPayload | null>(null);
  const [dropTarget, setDropTarget] = useState<{
    groupType: TaskType;
    taskId?: string;
    position?: "before" | "after";
  } | null>(null);
  // Refs to avoid stale closures in memoized children
  const dragDataRef = useRef<DragPayload | null>(null);
  const dropTargetRef = useRef<typeof dropTarget>(null);
  dragDataRef.current = dragData;
  dropTargetRef.current = dropTarget;
  const mainContainerRef = useRef<HTMLDivElement>(null);

  const queryClient = useQueryClient();

  // Single mutations shared by all items
  const taskTypeMutation = useMutation({
    mutationFn: updateTask,
    onError: (err: Error) => {
      toast.error(err.message || "Failed to move task");
      // Refetch on error to sync back to server state
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
    for (const taskType of Object.values(TaskType)) {
      const ids = selectedTasks[taskType];
      if (ids?.size) {
        selected.push(...groupedTasks[taskType]?.filter((t) => ids.has(t.id)));
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
            const updated: GroupedTasks = { ...prev };
            for (const taskType of Object.values(TaskType)) {
              updated[taskType] = prev[taskType]?.map((task) => {
                const change = changesMap.get(task.id);
                if (change) {
                  return {
                    ...task,
                    priority: mapPriorityFromInt(change.priority) as Priority,
                    rank: change.rank,
                  };
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

  // Find which group a task id belongs to
  const findContainer = useCallback((id: string): TaskType | undefined => {
    if (id in groupedTasks) return id as TaskType;
    return Object.keys(groupedTasks).find((key) =>
      groupedTasks[key as TaskType].some((task) => task.id === id),
    ) as TaskType | undefined;
  }, [groupedTasks]);

  // ──────────────── Native Drag Handlers ────────────────

  // Task drag start
  const handleTaskDragStart = useCallback((e: React.DragEvent, taskId: string, sourceGroup: TaskType) => {
    const payload: DragPayload = { type: "task", id: taskId, sourceGroup };
    e.dataTransfer.setData("application/json", JSON.stringify(payload));
    e.dataTransfer.effectAllowed = "move";

    // Set custom drag image to avoid clipping near viewport edges
    const target = e.currentTarget as HTMLElement;
    const rect = target.getBoundingClientRect();
    const dragImage = target.cloneNode(true) as HTMLElement;

    // Style the drag image
    dragImage.style.position = "absolute";
    dragImage.style.top = "-9999px";
    dragImage.style.left = "-9999px";
    dragImage.style.width = `${rect.width}px`;
    dragImage.style.height = `${rect.height}px`;
    dragImage.style.opacity = "0.8";
    dragImage.style.transform = "scale(0.95)";
    dragImage.style.transformOrigin = "top left";
    dragImage.style.pointerEvents = "none";
    dragImage.style.zIndex = "9999";
    dragImage.style.backgroundColor = "#2a2a2a";
    dragImage.style.border = "2px solid #007A7A";
    dragImage.style.borderRadius = "8px";

    document.body.appendChild(dragImage);

    // Force a reflow to ensure the drag image is rendered
    dragImage.getBoundingClientRect();

    // Set the drag image with offset to position it correctly under cursor
    e.dataTransfer.setDragImage(dragImage, rect.width / 2, rect.height / 2);

    // Remove the drag image after a short delay
    setTimeout(() => {
      document.body.removeChild(dragImage);
    }, 0);

    setDragData(payload);
  }, []);

  // Task drag over (on individual task items) - determines before/after position
  const handleTaskDragOver = useCallback((e: React.DragEvent, taskId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";

    const rect = e.currentTarget.getBoundingClientRect();
    const midY = rect.top + rect.height / 2;
    const position: "before" | "after" = e.clientY < midY ? "before" : "after";

    const container = findContainer(taskId);
    if (!container) return;

    setDropTarget((prev) => {
      if (prev?.taskId === taskId && prev?.position === position && prev?.groupType === container) return prev;
      return { groupType: container, taskId, position };
    });
  }, [findContainer]);

  // Group container drag over (for dropping into empty groups or at end of list)
  const handleGroupDragOver = useCallback((e: React.DragEvent, groupType: TaskType) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";

    const currentDragData = dragDataRef.current;
    if (!currentDragData) return;

    // Auto-expand collapsed group when dragging task over it
    if (currentDragData.type === "task") {
      setExpandedGroups((prev) => {
        if (prev[groupType]) return prev;
        return { ...prev, [groupType]: true };
      });
    }

    // Only set group-level drop target if not already on a specific task
    setDropTarget((prev) => {
      if (prev?.taskId) return prev; // keep task-level target
      if (prev?.groupType === groupType && !prev?.taskId) return prev;
      return { groupType };
    });
  }, []);

  // Drag leave from group container
  const handleGroupDragLeave = useCallback((e: React.DragEvent) => {
    // Only clear if actually leaving the container (not entering a child)
    const relatedTarget = e.relatedTarget as HTMLElement | null;
    if (relatedTarget && e.currentTarget.contains(relatedTarget)) return;
    setDropTarget(null);
  }, []);

  // Drop handler — reads from refs to avoid stale closures in memoized children
  const handleDrop = useCallback((e: React.DragEvent, targetGroup: TaskType) => {
    e.preventDefault();
    e.stopPropagation();

    const currentDrag = dragDataRef.current;
    if (!currentDrag) return;

    if (currentDrag.type === "group") {
      const activeType = currentDrag.id as TaskType;
      if (activeType !== targetGroup) {
        setGroupOrder((prev) => {
          const oldIndex = prev.indexOf(activeType);
          const newIndex = prev.indexOf(targetGroup);
          return arrayMove(prev, oldIndex, newIndex);
        });
      }
      setDropTarget(null);
      setDragData(null);
      return;
    }

    // Task drop
    const sourceGroup = currentDrag.sourceGroup;
    const taskId = currentDrag.id;
    const currentDropTarget = dropTargetRef.current;

    if (sourceGroup !== targetGroup) {
      // Move between groups — update local state + call API
      setGroupedTasks((prev) => {
        const sourceItems = prev[sourceGroup];
        const activeIndex = sourceItems.findIndex((t) => t.id === taskId);
        if (activeIndex < 0) return prev;

        const movedTask = { ...sourceItems[activeIndex], taskType: targetGroup };
        const targetItems = prev[targetGroup];

        let newIndex = targetItems.length;
        if (currentDropTarget?.taskId) {
          const overIndex = targetItems.findIndex((t) => t.id === currentDropTarget.taskId);
          if (overIndex >= 0) {
            newIndex = currentDropTarget.position === "after" ? overIndex + 1 : overIndex;
          }
        }

        return {
          ...prev,
          [sourceGroup]: sourceItems?.filter((item) => item.id !== taskId),
          [targetGroup]: [
            ...targetItems.slice(0, newIndex),
            movedTask,
            ...targetItems.slice(newIndex),
          ],
        };
      });

      taskTypeMutation.mutate({ taskId, taskType: targetGroup });
    } else {
      // Reorder within same group
      if (currentDropTarget?.taskId && currentDropTarget.taskId !== taskId) {
        setGroupedTasks((prev) => {
          const items = prev[sourceGroup];
          const activeIndex = items.findIndex((t) => t.id === taskId);
          const overIndex = items.findIndex((t) => t.id === currentDropTarget.taskId);
          if (activeIndex < 0 || overIndex < 0) return prev;
          return {
            ...prev,
            [sourceGroup]: arrayMove(items, activeIndex, overIndex),
          };
        });
      }
    }

    setDropTarget(null);
    setDragData(null);
  }, [taskTypeMutation]);

  // Drag end (cleanup when drag is cancelled or ended)
  const handleDragEnd = useCallback(() => {
    setDragData(null);
    setDropTarget(null);
    setTimeout(() => { isDraggingRef.current = false; }, 0);
  }, []);

  // ──────────────── Group Header Drag (reorder groups) ────────────────

  const handleGroupHeaderDragStart = useCallback((e: React.DragEvent, groupType: TaskType) => {
    const payload: DragPayload = { type: "group", id: groupType, sourceGroup: groupType };
    e.dataTransfer.setData("application/json", JSON.stringify(payload));
    e.dataTransfer.effectAllowed = "move";
    isDraggingRef.current = true;
    setDragData(payload);
  }, []);

  const handleGroupHeaderDragOver = useCallback((e: React.DragEvent, groupType: TaskType) => {
    e.preventDefault();
    const currentDragData = dragDataRef.current;
    if (!currentDragData) return;
    e.dataTransfer.dropEffect = "move";

    // Auto-expand collapsed group when dragging task over header
    if (currentDragData.type === "task") {
      setExpandedGroups((prev) => {
        if (prev[groupType]) return prev;
        return { ...prev, [groupType]: true };
      });
    }

    setDropTarget((prev) => {
      if (prev?.taskId) return prev;
      if (prev?.groupType === groupType && !prev?.taskId) return prev;
      return { groupType };
    });
  }, []);

  const handleGroupHeaderDrop = useCallback((e: React.DragEvent, targetGroupType: TaskType) => {
    e.preventDefault();

    const currentDrag = dragDataRef.current;
    if (!currentDrag) {
      setDropTarget(null);
      setDragData(null);
      return;
    }

    if (currentDrag.type === "group") {
      // Group reorder
      e.stopPropagation();
      if (currentDrag.id !== targetGroupType) {
        setGroupOrder((prev) => {
          const oldIndex = prev.indexOf(currentDrag.id as TaskType);
          const newIndex = prev.indexOf(targetGroupType);
          return arrayMove(prev, oldIndex, newIndex);
        });
      }
      setDropTarget(null);
      setDragData(null);
    } else {
      // Task drop on header — delegate to main drop handler
      handleDrop(e, targetGroupType);
    }
  }, [handleDrop]);

  // ──────────────── Existing Logic (unchanged) ────────────────

  const toggleGroup = (taskType: TaskType) => {
    setExpandedGroups((prev) => ({ ...prev, [taskType]: !prev[taskType] }));
  };

  const handleSelectAll = (taskType: TaskType) => {
    const tasksInGroup = groupedTasks[taskType] || [];
    const currentSelected = selectedTasks[taskType];
    const allSelected = tasksInGroup.length > 0 && tasksInGroup.every((t) => currentSelected.has(t.id));

    setSelectedTasks((prev) => ({
      ...prev,
      [taskType]: allSelected ? new Set() : new Set(tasksInGroup?.map((t) => t.id)),
    }));
  };

  const router = useRouter();

  const selectedCount = Object.values(selectedTasks).reduce((sum, set) => sum + set.size, 0);

  const clearSelections = () => {
    setSelectedTasks({
      [TaskType.BACKLOG]: new Set(),
      [TaskType.ACTIVE]: new Set(),
      [TaskType.STAGING]: new Set(),
    });
  };

  const getConfirmTitle = (): string => {
    if (!pendingAction) return "";
    switch (pendingAction.type) {
      case "delete":
        return `Delete ${selectedCount} task${selectedCount > 1 ? "s" : ""}?`;
      case "lane":
        return `Change lane of ${selectedCount} selected task${selectedCount > 1 ? "s" : ""} to:`;
      case "priority":
        return `Change priority of ${selectedCount} selected task${selectedCount > 1 ? "s" : ""} to:`;
      case "status":
        return `Change status of ${selectedCount} selected task${selectedCount > 1 ? "s" : ""} to:`;
    }
  };

  const getConfirmDescription = (): React.ReactNode => {
    if (!pendingAction) return null;
    switch (pendingAction.type) {
      case "delete":
        return "This action cannot be undone.";
      case "lane": {
        const label = sprintStatusToLabelMapping()[pendingAction.value];
        const color = laneColorMap[pendingAction.value];
        return (
          <span
            className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium text-white"
            style={{ backgroundColor: color }}
          >
            {label}
          </span>
        );
      }
      case "priority": {
        const { icon: Icon, color } = priorityIconMap[pendingAction.value];
        const label = priorityToLabelMapping()[pendingAction.value];
        return (
          <span className="inline-flex items-center gap-2 text-sm font-medium text-white">
            <Icon className={`w-5 h-5 ${color}`} />
            {label}
          </span>
        );
      }
      case "status": {
        const label = statusToLabelMapping()[pendingAction.value];
        const color = statusToColorMapping()[pendingAction.value];
        return (
          <span className="inline-flex items-center gap-2 text-sm font-medium text-white">
            <span
              className="w-3 h-3 rounded-full border-2"
              style={{ borderColor: color }}
            />
            {label}
          </span>
        );
      }
    }
  };

  const handleConfirmAction = () => {
    if (!pendingAction) return;
    const allIds = Object.entries(selectedTasks).flatMap(([, set]) => [...set]);
    if (!allIds.length) {
      setPendingAction(null);
      return;
    }

    switch (pendingAction.type) {
      case "delete": {
        setGroupedTasks((prev) => {
          const next = { ...prev };
          for (const type of Object.values(TaskType)) {
            next[type] = prev[type]?.filter((t) => !allIds.includes(t.id));
          }
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
          for (const type of Object.values(TaskType)) {
            const remaining: BacklogTask[] = [];
            for (const t of prev[type]) {
              if (allIds.includes(t.id)) {
                movedTasks.push({ ...t, taskType: lane });
              } else {
                remaining.push(t);
              }
            }
            next[type] = remaining;
          }
          next[lane] = [...next[lane], ...movedTasks];
          return next;
        });
        bulkTasksMutation.mutate({
          tasks: allIds?.map((id) => ({ taskId: id, taskType: lane })),
        });
        break;
      }
      case "priority": {
        const priority = pendingAction.value;
        setGroupedTasks((prev) => {
          const next = { ...prev };
          for (const type of Object.values(TaskType)) {
            next[type] = prev[type]?.map((t) =>
              allIds.includes(t.id) ? { ...t, priority } : t,
            );
          }
          return next;
        });
        bulkTasksMutation.mutate({
          tasks: allIds?.map((id) => ({ taskId: id, priority })),
        });
        break;
      }
      case "status": {
        const status = pendingAction.value;
        setGroupedTasks((prev) => {
          const next = { ...prev };
          for (const type of Object.values(TaskType)) {
            next[type] = prev[type]?.map((t) =>
              allIds.includes(t.id) ? { ...t, status } : t,
            );
          }
          return next;
        });
        bulkTasksMutation.mutate({
          tasks: allIds?.map((id) => ({ taskId: id, status })),
        });
        break;
      }
    }

    clearSelections();
    setPendingAction(null);
  };

  const isDraggingTask = dragData?.type === "task";
  const isDraggingGroup = dragData?.type === "group";
  const isDraggingRef = useRef(false);

  return (
    <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
      <div className="h-screen bg-background text-white pt-10 pb-4 flex flex-col">
        {/* Header */}
        <div className="mx-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-xl font-semibold">Backlog</h1>
              <p className="text-sm text-muted-foreground">
                Full planning inventory
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                onClick={() => router.push(RouteConfig.MasterKanBan.path)}
                className="px-4 py-2 bg-accent hover:bg-ring transition-colors text-sm text-accent-foreground rounded-2xl"
              >
                Close
              </Button>
            </div>
          </div>
          <div className="flex items-center justify-between gap-4">
            {/* Search Bar */}
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

            {/* Filters */}
            <div className="flex items-center gap-3">
              <Button
                onClick={() => setIsFilterOpen(true)}
                className={cn(
                  "rounded-lg flex items-center gap-2",
                  activeFilters.priority.length > 0 ||
                    activeFilters.category.length > 0 ||
                    activeFilters.progress.length > 0 ||
                    activeFilters.commitment.length > 0 ||
                    activeFilters.sprint.length > 0 ||
                    activeFilters.searchQuery
                    ? "bg-accent text-accent-foreground"
                    : "bg-secondary-card/70 text-foreground hover:bg-secondary-card",
                )}
              >
                <Filter className="w-4 h-4" />
                Filters
                {(activeFilters.priority.length > 0 ||
                  activeFilters.category.length > 0 ||
                  activeFilters.progress.length > 0 ||
                  activeFilters.commitment.length > 0 ||
                  activeFilters.sprint.length > 0 ||
                  activeFilters.searchQuery) && (
                  <span className="ml-1 px-2 py-0.5 text-xs rounded-full bg-accent-foreground text-accent">
                    {activeFilters.priority.length +
                      activeFilters.category.length +
                      activeFilters.progress.length +
                      activeFilters.commitment.length +
                      activeFilters.sprint.length +
                      (activeFilters.searchQuery ? 1 : 0)}
                  </span>
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* 3-List View */}
        <div ref={mainContainerRef} className="flex-1 min-h-0 overflow-auto scrollbar-hide [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] isolate">
          <div className="px-6 py-4 space-y-1">
            {orderedGroups?.map((group) => {
              const isFetching = isFetchingGroup[group.taskType];
              const allTasksInGroup = isFetching ? [] : (groupedTasks[group.taskType] || []);
              const currentSort = groupSorts[group.taskType];
              const displayTasks = (() => {
                if (currentSort.field === "score" && currentSort.direction) {
                  return [...allTasksInGroup].sort((a, b) => {
                    const aScore = a.compositeScore ?? 0;
                    const bScore = b.compositeScore ?? 0;
                    return currentSort.direction === "desc" ? bScore - aScore : aScore - bScore;
                  });
                }
                if (currentSort.field === "locked" && currentSort.direction) {
                  return [...allTasksInGroup].sort((a, b) => {
                    const aPinned = a.pinned ? 1 : 0;
                    const bPinned = b.pinned ? 1 : 0;
                    return currentSort.direction === "desc" ? bPinned - aPinned : aPinned - bPinned;
                  });
                }
                return allTasksInGroup;
              })();
              const selected = selectedTasks[group.taskType];
              const allSelected = displayTasks.length > 0 && displayTasks.every((t) => selected.has(t.id));
              const isExpanded = expandedGroups[group.taskType];
              const isLoading = isFetching;
              const isGroupDropTarget = dropTarget?.groupType === group.taskType && !dropTarget?.taskId && isDraggingTask;
              const isGroupReorderTarget = dropTarget?.groupType === group.taskType && isDraggingGroup && dragData?.id !== group.taskType;

              return (
                <div
                  key={group.taskType}
                  style={{ opacity: dragData?.type === "group" && dragData.id === group.taskType ? 0.5 : 1 }}
                  className="transition-opacity"
                >
                  <div className="overflow-hidden mb-4">
                    {/* Group Header - draggable for group reorder */}
                    <div
                      draggable
                      onDragStart={(e) => handleGroupHeaderDragStart(e, group.taskType)}
                      onDragOver={(e) => handleGroupHeaderDragOver(e, group.taskType)}
                      onDrop={(e) => handleGroupHeaderDrop(e, group.taskType)}
                      onDragEnd={handleDragEnd}
                      onClick={() => {
                        if (isDraggingRef.current) return;
                        toggleGroup(group.taskType);
                      }}
                      className={cn(
                        "flex items-center justify-between px-5 py-3 w-full cursor-grab active:cursor-grabbing transition-colors",
                        isExpanded ? "rounded-t-xl rounded-b-none" : "rounded-xl",
                        group.headerClass,
                        isGroupDropTarget && "ring-2 ring-teal-500 ring-inset",
                        isGroupReorderTarget && "ring-2 ring-teal-500 ring-inset"
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
                          onClick={(e) => {
                            e.stopPropagation();
                          }}
                          className={cn(
                            "flex items-center gap-1.5 text-sm text-black bg-white border border-white rounded-full px-3 py-1 hover:bg-white/90 transition-colors",
                            isDraggingTask && "pointer-events-none"
                          )}
                        >
                          <span className="text-base leading-none">+</span>
                          Add
                        </div>
                        <div
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSelectAll(group.taskType);
                          }}
                          className={cn(
                            "flex items-center gap-2 text-sm text-foreground border border-border rounded-lg px-3 py-1 hover:bg-white/10 transition-colors",
                            isDraggingTask && "pointer-events-none"
                          )}
                        >
                          <Checkbox
                            checked={allSelected}
                            className="border-foreground data-[state=checked]:bg-white data-[state=checked]:text-black h-4 w-4"
                          />
                          {allSelected ? "Deselect All" : "Select All"}
                        </div>
                      </div>
                    </div>

                    {/* Group Tasks - Drop zone */}
                    <div
                      onDragOver={(e) => handleGroupDragOver(e, group.taskType)}
                      onDragLeave={handleGroupDragLeave}
                      onDrop={(e) => handleDrop(e, group.taskType)}
                      className={cn(
                        isExpanded
                          ? cn(
                              "border border-t-0 border-border rounded-b-xl p-4 flex flex-col gap-2 min-h-[250px]",
                              isGroupDropTarget && "bg-white/5 border-2 border-dashed border-teal-500/50",
                            )
                          : ""
                      )}
                    >
                      {/* Always-mounted content, hidden via CSS when collapsed */}
                      <div className={isExpanded ? "" : "hidden"}>
                        {/* Sort Bar */}
                        <div className="flex items-center gap-2 pb-2">
                          <span className="text-xs text-muted-foreground mr-1">Sort by</span>
                          <select
                            value={currentSort.field === "estTime" ? currentSort.direction || "" : ""}
                            onChange={(e) => {
                              const val = e.target.value;
                              if (!val) {
                                setGroupSorts((prev) => ({
                                  ...prev,
                                  [group.taskType]: { field: prev[group.taskType].field === "estTime" ? null : prev[group.taskType].field, direction: prev[group.taskType].field === "estTime" ? null : prev[group.taskType].direction },
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
                              currentSort.field === "estTime"
                                ? "bg-white/10 border-white/30 text-white"
                                : "border-border text-muted-foreground hover:text-white hover:border-white/20",
                            )}
                          >
                            <option value="" className="bg-[#2a2a2a] text-white">Est Time</option>
                            <option value="desc" className="bg-[#2a2a2a] text-white">Est Time (Longest)</option>
                            <option value="asc" className="bg-[#2a2a2a] text-white">Est Time (Shortest)</option>
                          </select>
                          {([
                            { field: "score" as SortField, label: "Score" },
                            { field: "priority" as SortField, label: "Priority" },
                            { field: "status" as SortField, label: "Progress" },
                            { field: "locked" as SortField, label: "Lock" },
                          ])?.map((sortOption) => {
                            const isActive = currentSort.field === sortOption.field;
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
                                {isActive && currentSort.direction === "desc" && <ArrowUp className="w-3 h-3" />}
                                {isActive && currentSort.direction === "asc" && <ArrowDown className="w-3 h-3" />}
                                {!isActive && <ArrowUpDown className="w-3 h-3" />}
                              </button>
                            );
                          })}
                        </div>
                        {isLoading ? (
                          <>
                            {[1, 2, 3]?.map((i) => (
                              <div key={i} className="bg-card-foreground/10 rounded-lg p-4 animate-pulse my-1">
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
                                if (next.has(id)) {
                                  next.delete(id);
                                } else {
                                  next.add(id);
                                }
                                return { ...prev, [group.taskType]: next };
                              });
                            }}
                            onPriorityChange={(id, priority) => {
                              setGroupedTasks((prev) => ({
                                ...prev,
                                [group.taskType]: prev[group.taskType]?.map((t) =>
                                  t.id === id ? { ...t, priority } : t,
                                ),
                              }));
                              bulkTasksMutation.mutate({ tasks: [{ taskId: id, priority }] });
                            }}
                            onStatusChange={(id, newStatus) => {
                              setGroupedTasks((prev) => ({
                                ...prev,
                                [group.taskType]: prev[group.taskType]?.map((t) =>
                                  t.id === id ? { ...t, status: newStatus } : t,
                                ),
                              }));
                              bulkTasksMutation.mutate({ tasks: [{ taskId: id, status: newStatus }] });
                            }}
                            onToggleLock={(id) => {
                              const task = groupedTasks[group.taskType]?.find((t) => t.id === id);
                              if (!task) return;
                              const newPinned = !task.pinned;
                              setGroupedTasks((prev) => ({
                                ...prev,
                                [group.taskType]: prev[group.taskType]?.map((t) =>
                                  t.id === id ? { ...t, pinned: newPinned } : t,
                                ),
                              }));
                              bulkTasksMutation.mutate({ tasks: [{ taskId: id, pinned: newPinned }] });
                            }}
                            onTaskDragStart={handleTaskDragStart}
                            onTaskDragOver={handleTaskDragOver}
                            onTaskDrop={handleDrop}
                            onTaskDragEnd={handleDragEnd}
                            dropTargetTaskId={dropTarget?.groupType === group.taskType ? (dropTarget?.taskId ?? null) : null}
                            dropPosition={dropTarget?.groupType === group.taskType ? (dropTarget?.position ?? null) : null}
                            draggedTaskId={isDraggingTask ? (dragData?.id ?? null) : null}
                          />
                        ) : null}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <BacklogFilter
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        onApply={(filters) => setActiveFilters(filters)}
        initialFilters={activeFilters}
      />

      <div className="fixed bottom-[50px] left-1/2 -translate-x-1/2 z-50">
        <ToolBar
          hasSelection={Object.values(selectedTasks).some((set) => set.size > 0)}
          isAllSelected={
            Object.values(selectedTasks).some((set) => set.size > 0) &&
            Object.entries(groupedTasks).every(
              ([type, tasks]) => tasks?.every((t) => selectedTasks[type as TaskType]?.has(t.id)),
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
              ([type, tasks]) => tasks?.every((t) => selectedTasks[type as TaskType]?.has(t.id)),
            );
            if (allSelected) {
              clearSelections();
            } else {
              setSelectedTasks({
                [TaskType.BACKLOG]: new Set(groupedTasks[TaskType.BACKLOG]?.map((t) => t.id)),
                [TaskType.ACTIVE]: new Set(groupedTasks[TaskType.ACTIVE]?.map((t) => t.id)),
                [TaskType.STAGING]: new Set(groupedTasks[TaskType.STAGING]?.map((t) => t.id)),
              });
            }
          }}
        />
      </div>

      <ConfirmDialog
        open={!!pendingAction}
        title={getConfirmTitle()}
        description={getConfirmDescription()}
        confirmText="OK"
        cancelText="Cancel"
        onConfirm={handleConfirmAction}
        onCancel={() => setPendingAction(null)}
      />
    </div>
  );
}
