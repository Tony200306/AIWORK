"use client";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { RouteConfig } from "@/constants/RouteConfig";
import { useGetSprint } from "@/hooks/shared/useGetSprint";
import { SprintItem, SprintLane } from "@/models/Sprint";
import { Priority, Task, TaskStatus, TaskType } from "@/models/Task";
import { useGetTaskLists } from "@/hooks/shared/useGetTaskLists";
import { useUpdateBulkTasks } from "@/hooks/shared/useUpdateBulkTasks";
import { useDeleteBulkTasks } from "@/hooks/shared/useDeleteBulkTasks";
import { formatDuration } from "@/utils/formatDuration";
import {
  closestCorners,
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import {
  Filter,
  PlayIcon,
  PlusIcon,
  Sparkle,
  Undo2
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { useDraggable } from "../../hooks/useDraggable";
import DoingTimer from "./DoingTimer";
import { DroppableColumn } from "./DroppableColumn";
import { KanBanCard } from "./KanBanCard";
import { SortableKanbanItem } from "./SortableKanbanItem";
import ToolBar from "./ToolBar";
import { WorkLoadAndCapacity } from "./WorkLoadAndCapacity";
import MasterKanbanFilter, { KanbanFilterState } from "./MasterKanbanFilter";
import { cn } from "@/lib/utils";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import AddTaskDialog from "./AddTaskDialog";
import ReshuffleDiffDialog from "./ReshuffleDiffDialog";



const columnConfig = {
  STAGING: {
    title: "Staging",
    bgColor: "bg-accent",
    borderColor: "border-gray-800",
  },
  TODO: {
    title: "Todo",
    bgColor: "bg-chart-3/20",
    borderColor: "border-yellow-900/50",
  },
  DOING: {
    title: "Doing",
    bgColor: "bg-chart-5/20",
    borderColor: "border-teal-900/50",
  },
  DONE: {
    title: "Done",
    bgColor: "bg-chart-2/20",
    borderColor: "border-red-900/50",
  },
};

type ColumnKey = "STAGING" | "TODO" | "DOING" | "DONE";
type KanbanColumns = Record<ColumnKey, SprintItem[]>;

/** Convert a plain Task to SprintItem shape so all columns render uniformly */
const taskToSprintItem = (task: Task): SprintItem => ({
  id: task.id,
  taskId: task.id,
  task,
  lane: SprintLane.MEDIUM,
  rank: 0,
  plannedMinutes: null,
  isStarred: false,
  startNext: false,
  completedAt: null,
});

export default function KanBanTable() {
  const params = useParams();
  const sprintId = params?.id as string;
  const { data: sprintData, isLoading: isSprintLoading } = useGetSprint(sprintId);

  const [activeFilters, setActiveFilters] = useState<KanbanFilterState>({
    priority: [],
    searchQuery: "",
  });
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Fetch staging tasks from tasks API with filters
  const stagingParams = useMemo(() => ({
    taskType: TaskType.STAGING,
    limit: 1000,
    priority: activeFilters.priority.length ? activeFilters.priority as Priority[] : undefined,
  }), [activeFilters.priority]);

  const { data: stagingData, isLoading: isStagingLoading } = useGetTaskLists(stagingParams);

  const isLoading = isSprintLoading || isStagingLoading;

  const bulkTasksMutation = useUpdateBulkTasks();
  const deleteBulkTasksMutation = useDeleteBulkTasks();

  const [groupTasks, setGroupTasks] = useState<KanbanColumns>({
    STAGING: [],
    TODO: [],
    DOING: [],
    DONE: [],
  });

  // Sync sprint data (TODO, DOING, DONE)
  useEffect(() => {
    if (sprintData?.data?.items) {
      setGroupTasks((prev) => ({
        ...prev,
        TODO: sprintData.data.items.TODO || [],
        DOING: sprintData.data.items.DOING || [],
        DONE: sprintData.data.items.DONE || [],
      }));
    }
  }, [sprintData]);

  // Sync staging tasks
  useEffect(() => {
    if (stagingData?.data) {
      setGroupTasks((prev) => ({
        ...prev,
        STAGING: stagingData.data?.map(taskToSprintItem),
      }));
    }
  }, [stagingData]);

  // Client-side filter for sprint columns (TODO/DOING/DONE) - staging is filtered via API
  const filteredGroupTasks = useMemo(() => {
    const hasPriorityFilter = activeFilters.priority.length > 0;

    if (!hasPriorityFilter) return groupTasks;

    const filterItems = (items: SprintItem[]) =>
      items?.filter((item) => activeFilters.priority.includes(item.task.priority));

    return {
      STAGING: groupTasks.STAGING, // Already filtered by API
      TODO: filterItems(groupTasks.TODO),
      DOING: filterItems(groupTasks.DOING),
      DONE: filterItems(groupTasks.DONE),
    };
  }, [groupTasks, activeFilters.priority]);

  const [selectedTasks, setSelectedTasks] = useState<string[]>([]);
  const [showBacklogConfirm, setShowBacklogConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showAddTaskDialog, setShowAddTaskDialog] = useState(false);
  const [showReshuffleDialog, setShowReshuffleDialog] = useState(false);
  const router = useRouter();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeTask, setActiveTask] = useState<SprintItem | null>(null);
  const sourceContainerRef = useRef<ColumnKey | null>(null);

  // Document PiP state
  const [pipWindow, setPipWindow] = useState<Window | null>(null);
  const [timerTask, setTimerTask] = useState<Task | null>(null);
  const pipRootRef = useRef<any>(null);
  const [selectedDoingTask, setSelectedDoingTask] = useState<SprintItem | null>(null);
  const [isTimerCollapsed, setIsTimerCollapsed] = useState(false);
  const { position, onMouseDown, isDragging } = useDraggable({
    x: 100,
    y: 100,
  });
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(true);
  //Timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (selectedDoingTask && isTimerRunning) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, selectedDoingTask]);

  useEffect(() => {
    if (selectedDoingTask) {
      setTimerSeconds(0);
      setIsTimerRunning(true);
    }
  }, [selectedDoingTask?.id]);
  // Cấu hình sensor để trải nghiệm mượt mà
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );
  // Trong React component
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        console.log("User đã quay lại tab", new Date());
        // Xử lý logic khi user quay lại
      } else {
        console.log("User đã rời tab", new Date());
        // Xử lý logic khi user rời đi
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  // Helper: Tìm xem item thuộc cột nào
  const findContainer = (id: string) => {
    if (id in groupTasks) return id;
    return Object.keys(groupTasks).find((key) =>
      groupTasks[key].some((task) => task.id === id)
    );
  };

  // Helper: Find task by id
  const findTaskById = (id: string): SprintItem | null => {
    for (const status of Object.keys(groupTasks)) {
      const task = groupTasks[status].find((t) => t.id === id);
      if (task) return task;
    }
    return null;
  };

  const handleDragStart = (event: DragStartEvent) => {
    const id = event.active.id as string;
    setActiveId(id);

    // Track source column before any moves happen
    sourceContainerRef.current = findContainer(id) as ColumnKey | null;

    // Find the task being dragged
    const task = findTaskById(id);
    setActiveTask(task);
  };

  // LOGIC 1: Xử lý khi đang di chuyển (DragOver)
  // Mục đích: Chuyển item sang cột khác ngay khi di chuột sang
  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    const overId = over?.id;
    if (!overId || active.id === overId) return;

    const activeContainer = findContainer(active.id as string);
    const overContainer = findContainer(overId as string);

    if (
      !activeContainer ||
      !overContainer ||
      activeContainer === overContainer
    ) {
      return;
    }

    // Di chuyển item giữa 2 mảng state khác nhau
    setGroupTasks((prev) => {
      const activeItems = prev[activeContainer];
      const overItems = prev[overContainer];
      const activeIndex = activeItems.findIndex(
        (task) => task.id === active.id
      );
      const overIndex = overItems.findIndex((task) => task.id === overId);

      let newIndex;
      if (overId in prev) {
        // Nếu over là một Container rỗng, ném vào cuối
        newIndex = overItems.length + 1;
      } else {
        const isBelowOverItem =
          over &&
          active.rect.current.translated &&
          active.rect.current.translated.top > over.rect.top + over.rect.height;

        const modifier = isBelowOverItem ? 1 : 0;
        newIndex = overIndex >= 0 ? overIndex + modifier : overItems.length + 1;
      }
      return {
        ...prev,
        [activeContainer]: [
          ...prev[activeContainer]?.filter((item) => item.id !== active.id),
        ],
        [overContainer]: [
          ...prev[overContainer].slice(0, newIndex),
          {
            ...prev[activeContainer][activeIndex],
          },
          ...prev[overContainer].slice(newIndex, prev[overContainer].length),
        ],
      };
    });
    if (
      activeContainer === "STAGING" &&
      selectedTasks.includes(active.id as string)
    ) {
      setSelectedTasks((prev) => {
        return prev?.filter((id) => id !== active.id);
      });
    }
  };

  // Map column key to TaskStatus (STAGING has no TaskStatus)
  const columnToStatus: Partial<Record<ColumnKey, TaskStatus>> = {
    TODO: TaskStatus.TODO,
    DOING: TaskStatus.DOING,
    DONE: TaskStatus.DONE,
  };

  // Update task status/taskType via API when moved between columns
  const updateTaskAfterColumnChange = async (taskId: string, from: ColumnKey, to: ColumnKey) => {
    const task = findTaskById(taskId);
    if (!task) return;

    const update: { taskId: string; status?: TaskStatus; taskType?: TaskType; sprintId?: string } = {
      taskId: task.task.id,
    };

    // Set new status based on destination column
    const newStatus = columnToStatus[to];
    if (newStatus) {
      update.status = newStatus;
    }

    // STAGING → other column: activate the task and assign to sprint
    if (from === "STAGING") {
      update.taskType = TaskType.ACTIVE;
      if (sprintId) {
        update.sprintId = sprintId;
      }
    }

    // Other column → STAGING: deactivate the task
    if (to === "STAGING") {
      update.taskType = TaskType.STAGING;
    }

    // Optimistically update local task data
    setGroupTasks((prev) => {
      const next = { ...prev };
      for (const key of Object.keys(next)) {
        next[key] = next[key]?.map((t) =>
          t.id === task.id
            ? {
                ...t,
                task: {
                  ...t.task,
                  ...(update.status && { status: update.status }),
                  ...(update.taskType && { taskType: update.taskType }),
                },
              }
            : t,
        );
      }
      return next;
    });

    await bulkTasksMutation.mutateAsync({ tasks: [update] });
  };

  // LOGIC 2: Xử lý khi thả tay (DragEnd)
  // Mục đích: Sắp xếp lại vị trí trong CÙNG 1 cột (vì DragOver đã lo việc chuyển cột rồi)
  // + Gọi API cập nhật status/taskType khi chuyển cột
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    const destinationContainer = findContainer(active.id as string) as ColumnKey | undefined;
    const overContainer = findContainer(over?.id as string);
    const sourceContainer = sourceContainerRef.current;

    // Reset ref
    sourceContainerRef.current = null;

    if (
      !destinationContainer ||
      !overContainer ||
      destinationContainer !== overContainer
    ) {
      // Cross-column move already handled by handleDragOver — fire API update
      if (sourceContainer && destinationContainer && sourceContainer !== destinationContainer) {
        updateTaskAfterColumnChange(active.id as string, sourceContainer, destinationContainer);
      }
      setActiveId(null);
      setActiveTask(null);
      return;
    }

    // Same-column reorder
    const activeIndex = groupTasks[destinationContainer].findIndex(
      (task) => task.id === active.id
    );
    const overIndex = groupTasks[overContainer].findIndex(
      (task) => task.id === over?.id
    );

    if (activeIndex !== overIndex) {
      setGroupTasks((items) => ({
        ...items,
        [destinationContainer]: arrayMove(
          items[destinationContainer],
          activeIndex,
          overIndex
        ),
      }));
    }

    // Item may have been moved across columns by handleDragOver before landing in same column
    if (sourceContainer && sourceContainer !== destinationContainer) {
      updateTaskAfterColumnChange(active.id as string, sourceContainer, destinationContainer);
    }

    setActiveId(null);
    setActiveTask(null);
  };
  return (
    <div className="bg-background pt-10  h-[100vh] flex flex-col">
      <div className="max-w-[100vw] flex flex-col flex-1 min-h-0 bg-background p-6 py-0 xl:w-[1500px] 1.5xl:w-[1800px] mx-auto">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <div className="text-lg">Sprint Week 1</div>
            <span className="text-muted-foreground text-sm">
              Goal: Ship Q4 onboarding
            </span>
          </div>
          <div className="text-muted-foreground mb-5">
            Drag tasks to lanes. Staging items don’t count against capacity.
          </div>
        </div>
        <div className="flex justify-between mb-6 ">
          <div onClick={() => router.push(RouteConfig.AtomicSplitPage.path)}>
            <Button>
              <Undo2 />
              Back
            </Button>
          </div>
          <div className="flex gap-2 items-center">
            {/* {selectedDoingTask && isTimerCollapsed && (
              <div className="mr-2">
                <DoingTimer
                  isTimerCollapsed={true}
                  task={selectedDoingTask}
                  onCollapseChange={setIsTimerCollapsed}
                  seconds={timerSeconds}
                  isRunning={isTimerRunning}
                  onPauseToggle={() => setIsTimerRunning(!isTimerRunning)}
                />
              </div>
            )} */}
            <Button
              onClick={() => setIsFilterOpen(true)}
              className={cn(
                "rounded-lg flex items-center gap-2",
                activeFilters.priority.length > 0
                  ? "bg-accent text-accent-foreground"
                  : "bg-secondary-card/70 text-foreground hover:bg-secondary-card",
              )}
            >
              <Filter className="w-4 h-4" />
              Filters
              {activeFilters.priority.length > 0 && (
                <span className="ml-1 px-2 py-0.5 text-xs rounded-full bg-accent-foreground text-accent">
                  {activeFilters.priority.length}
                </span>
              )}
            </Button>
          </div>
        </div>
        <div className=" flex flex-col flex-1 min-h-0 overflow-x-auto scrollbar-hide [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
          >
            <div className="min-w-[1400px] flex-1 min-h-0 bg-card p-4 px-2 rounded-lg flex gap-4">
              {(Object.keys(columnConfig) as ColumnKey[] || [])?.map((status) => {
                const config = columnConfig[status];
                const displayItems = filteredGroupTasks?.[status] || [];

                return (
                  <SortableContext
                    key={status}
                    id={status}
                    items={displayItems?.map((task) => task.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    <div
                      key={status}
                      className={`min-w-[320px] flex-1 border-border border flex flex-col ${config.bgColor} ${config.borderColor} rounded-2xl p-4`}
                    >
                      <div className="flex items-center justify-between mb-4 min-h-[34px]">
                        <div className="flex-1">
                          <h2 className="text-white font-semibold text-lg">
                            {config.title}
                          </h2>
                          {status === "STAGING" && (
                            <span className="detail">
                              Not in sprint capacity
                            </span>
                          )}
                          {status === TaskStatus.TODO && (
                            <span className="detail">
                              Committed for this sprint
                            </span>
                          )}
                          {status === TaskStatus.DOING && (
                            <span className="detail">Active now</span>
                          )}{" "}
                          {status === TaskStatus.DONE && (
                            <span className="detail">Delivered</span>
                          )}
                        </div>

                        <div
                          className={`flex flex-wrap justify-end gap-2 items-center ${
                            status === "STAGING"
                              ? "xl:w-[210px] xl:flex-nowrap!"
                              : ""
                          }`}
                        >
                          <div className="shrink-0 text-xs w-7 h-7 border border-white justify-center rounded-full flex items-center">
                            {displayItems.length}
                          </div>
                          {status === "STAGING" && (
                            <Button
                              onClick={() => setShowAddTaskDialog(true)}
                              className="text-xs px-4 py-1 gap-1 cursor-pointer rounded-lg"
                            >
                              <PlusIcon size={12} /> Add task
                            </Button>
                          )}
                          {/* {status === TaskStatus.DOING && (
                            <Button
                              onClick={() =>
                                setSelectedDoingTask(groupTasks[status]?.[0])
                              }
                              className="cursor-pointer font-semibold! bg-card-foreground! text-popover-foreground! "
                            >
                              <PlayIcon size={12} className="mr-1" /> Start next
                            </Button>
                          )} */}
                        </div>
                      </div>

                      <DroppableColumn
                        id={status}
                        className="flex-1 space-y-3 overflow-auto min-h-0 scrollbar-hide [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
                      >
                        {isLoading
                          ? Array.from({ length: 2 })?.map((_, i) => (
                              <div key={i} className="bg-card rounded-xl p-4 space-y-3">
                                <div className="flex items-start justify-between">
                                  <Skeleton className="h-4 w-4 rounded-full shrink-0" />
                                  <Skeleton className="h-4 flex-1 mx-2" />
                                  <Skeleton className="h-3 w-16 shrink-0" />
                                </div>
                                <div className="space-y-2">
                                  <Skeleton className="h-3 w-full" />
                                  <Skeleton className="h-3 w-3/4" />
                                </div>
                              </div>
                            ))
                          : displayItems?.map((item) => (
                              <SortableKanbanItem key={item.id} id={item.id}>
                                <KanBanCard
                                  setSelectedDoingTask={setSelectedDoingTask}
                                  isSelectionMode={selectedTasks.length > 0}
                                  isSelected={selectedTasks.includes(item.id)}
                                  isDone={status === "DONE"}
                                  key={item.id}
                                  item={item}
                                  title={item.task.title}
                                  setSelectedTasks={setSelectedTasks}
                                  timeEstimate={formatDuration(item.task.expectedTimeHours)}
                                  isLocked={!!item.task.pinned}
                                  isStarred={item.isStarred}
                                  onToggleStar={() => {
                                    setGroupTasks((prev) => {
                                      const next = { ...prev };
                                      for (const key of Object.keys(next)) {
                                        next[key] = next[key]?.map((t) =>
                                          t.id === item.id
                                            ? { ...t, isStarred: !t.isStarred }
                                            : t,
                                        );
                                      }
                                      return next;
                                    });
                                  }}
                                  onToggleLock={() => {
                                    const newPinned = !item.task.pinned;
                                    // Optimistic update
                                    setGroupTasks((prev) => {
                                      const next = { ...prev };
                                      for (const key of Object.keys(next)) {
                                        next[key] = next[key]?.map((t) =>
                                          t.id === item.id
                                            ? { ...t, task: { ...t.task, pinned: newPinned } }
                                            : t,
                                        );
                                      }
                                      return next;
                                    });
                                    bulkTasksMutation.mutateAsync({
                                      tasks: [{
                                        taskId: item.task.id,
                                        status: item.task.status,
                                        rank: item.task.rank,
                                        priority: item.task.priority,
                                        taskType: item.task.taskType,
                                        pinned: newPinned,
                                        sprintId,
                                      }],
                                    });
                                  }}
                                  onEdit={() => console.log("Edit:", item.id)}
                                  onPriorityChange={(priority) => {
                                    setGroupTasks((prev) => {
                                      const next = { ...prev };
                                      for (const key of Object.keys(next)) {
                                        next[key] = next[key]?.map((t) =>
                                          t.id === item.id
                                            ? { ...t, task: { ...t.task, priority } }
                                            : t,
                                        );
                                      }
                                      return next;
                                    });
                                    bulkTasksMutation.mutate({
                                      tasks: [{ taskId: item.task.id, priority }],
                                    });
                                  }}
                                  onClick={() =>
                                    console.log("Task clicked:", item.id)
                                  }
                                />
                              </SortableKanbanItem>
                            ))}
                      </DroppableColumn>
                      {status === "STAGING" && (
                        <Button
                          onClick={() => {
                            if (selectedTasks.length === 0) return;
                            setShowBacklogConfirm(true);
                          }}
                          variant="outline"
                          className={cn(
                            "mt-3 w-full rounded-lg transition-all duration-300",
                            selectedTasks.length > 0
                              ? "opacity-100 text-white border-white hover:bg-white/10 cursor-pointer"
                              : "opacity-50 text-gray-500 border-gray-700 cursor-default hover:bg-transparent hover:text-gray-500"
                          )}
                        >
                          Move to backlog
                        </Button>
                      )}
                    </div>
                  </SortableContext>
                );
              })}
            </div>
            <DragOverlay
              dropAnimation={{
                duration: 200,
                easing: "cubic-bezier(0.18, 0.67, 0.6, 1.22)",
              }}
            >
              {activeId && activeTask ? (
                <div className="rotate-3 opacity-90 scale-105">
                  <KanBanCard
                    isSelected={false}
                    item={activeTask}
                    title={activeTask.task.title}
                    setSelectedTasks={setSelectedTasks}
                    timeEstimate={formatDuration(activeTask.task.expectedTimeHours)}
                    isStarred={activeTask.isStarred}
                    onEdit={() => {}}
                    onClick={() => {}}
                  />
                </div>
              ) : null}
            </DragOverlay>
          </DndContext>
        </div>
        {/* Workload vs Capacity Bar */}
        <WorkLoadAndCapacity
          totalCapacity={sprintData?.data?.capacityMinutes}
          totalPlanned={
            [...(groupTasks.TODO || []), ...(groupTasks.DOING || []), ...(groupTasks.DONE || [])]
              .reduce((total, item) => total + (item.task?.expectedTimeHours || 0) * 60, 0)
          }
          totalProgress={
            [...(groupTasks.DOING || []), ...(groupTasks.DONE || [])]
              .reduce((total, item) => total + (item.task?.expectedTimeHours || 0) * 60, 0)
          }
          totalCompleted={
            (groupTasks.DONE || [])
              .reduce((total, item) => total + (item.task?.expectedTimeHours || 0) * 60, 0)
          }
        />
        <div className="flex justify-end">
          <Button
            onClick={() => router.push(RouteConfig.SprintComplete.getPath(sprintId))}
            className="cursor-pointer"
          >
            <span>
              Complete the sprint
            </span>
            <Sparkle className="ml-1" />
          </Button>
        </div>
        <div className="flex justify-center mb-4">
              <ToolBar
            hasSelection={selectedTasks.length > 0}
            isAllSelected={selectedTasks.length > 0 && selectedTasks.length === Object.values(groupTasks).flat().length}
            onDelete={() => {
              if (selectedTasks.length === 0) return;
              setShowDeleteConfirm(true);
            }}
            onBacklog={() => router.push(RouteConfig.BackLog.path)}
            onShuffle={() => setShowReshuffleDialog(true)}
            onDashboard={() => console.log("Go to dashboard")}
            onSelectAll={() => {
              const allTaskIds = Object.values(groupTasks).flat()?.map(t => t.id);
              setSelectedTasks(selectedTasks.length === allTaskIds.length ? [] : allTaskIds);
            }}
          />
        </div>
      </div>

      {/* {selectedDoingTask && !isTimerCollapsed && (
        <div
          onMouseDown={onMouseDown}
          style={{
            position: "fixed",
            left: position.x,
            top: position.y,
            zIndex: 50,
            cursor: isDragging ? "grabbing" : "grab",
          }}
          className="flex flex-col items-center gap-2 active:scale-95 transition-transform"
        >
          <DoingTimer
            isTimerCollapsed={false}
            task={selectedDoingTask}
            onCollapseChange={setIsTimerCollapsed}
            seconds={timerSeconds}
            isRunning={isTimerRunning}
            onPauseToggle={() => setIsTimerRunning(!isTimerRunning)}
          />
        </div>
      )} */}

      <MasterKanbanFilter
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        onApply={(filters) => setActiveFilters(filters)}
        initialFilters={activeFilters}
      />

      <ConfirmDialog
        open={showDeleteConfirm}
        title={`Delete ${selectedTasks.length} task${selectedTasks.length > 1 ? "s" : ""}?`}
        description="This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        onCancel={() => setShowDeleteConfirm(false)}
        onConfirm={() => {
          const taskIdsToDelete = selectedTasks
            ?.map((id) => findTaskById(id)?.task.id)
            ?.filter(Boolean) as string[];

          setGroupTasks((prev) => {
            const next = { ...prev };
            for (const key of Object.keys(next)) {
              next[key] = next[key]?.filter(
                (item) => !selectedTasks.includes(item.id),
              );
            }
            return next;
          });
          setSelectedTasks([]);
          setShowDeleteConfirm(false);

          deleteBulkTasksMutation.mutate({ taskIds: taskIdsToDelete });
        }}
      />

      <AddTaskDialog
        open={showAddTaskDialog}
        onClose={() => setShowAddTaskDialog(false)}
        onTaskCreated={(braindumpId, taskType) => {
          router.push(RouteConfig.AtomicSplitPage.getPath(braindumpId));
        }}
      />

      <ReshuffleDiffDialog
        open={showReshuffleDialog}
        onOpenChange={setShowReshuffleDialog}
        sprintId={sprintId}
      />

      <ConfirmDialog
        open={showBacklogConfirm}
        title={`Move ${selectedTasks.length} task${selectedTasks.length > 1 ? "s" : ""} to backlog?`}
        confirmText="Move"
        cancelText="Cancel"
        onCancel={() => setShowBacklogConfirm(false)}
        onConfirm={() => {
          const tasksToUpdate = selectedTasks
            ?.map((id) => findTaskById(id))
            ?.filter(Boolean)
            ?.map((item) => ({
              taskId: item!.task.id,
              taskType: TaskType.BACKLOG,
            }));

          // Optimistically remove from UI
          setGroupTasks((prev) => {
            const next = { ...prev };
            for (const key of Object.keys(next)) {
              next[key] = next[key]?.filter(
                (item) => !selectedTasks.includes(item.id),
              );
            }
            return next;
          });

          bulkTasksMutation.mutate({ tasks: tasksToUpdate });
          setSelectedTasks([]);
          setShowBacklogConfirm(false);
        }}
      />
    </div>
  );
}
