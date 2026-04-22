"use client";

import { Tag } from "@/components/shared/ReactComponent/components/Tag";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RouteConfig } from "@/constants/RouteConfig";
import { useDebounce } from "@/hooks/useDebounce";
import {
  pointerWithin,
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import dayjs from "dayjs";
import { Calendar, InfoIcon, Sparkles, Undo2 } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useCreateSprint } from "../../../../../hooks/shared/useCreateSprint";
import { useGetExtBrainDumpTasks } from "../../../../../hooks/shared/useGetExtBrainDumpTasks";
import { useUpdateExtBulkPriorities } from "../../../../../hooks/shared/useUpdateExtBulkPriorities";
import { useReshufflePriorities } from "../../../../../hooks/shared/useReshufflePriorities";
import { mapTaskToReshuffleInput, mapPriorityFromInt } from "../../../../../services/braindump/reshufflePriorities";
import { useUpdateExtBulkTasks } from "../../../../../hooks/shared/useUpdateExtBulkTasks";
import { SprintWindowType } from "../../../../../models/Sprint";
import { Task as BaseTask, Priority, TaskType } from "../../../../../models/Task";
import {
  groupTasksByPriority,
  PriorityGroup,
} from "../../../../../utils/groupTasksByPriority";
import { ConfirmModal } from "../components/ConfirmModal";
import { DroppableColumn } from "../components/DroppableColumn";
import { KanBanItem } from "../components/KanBanItem";
import { PlannedBar } from "../components/PlannedBar";
import { SortableKanbanItem } from "../components/SortableKanbanItem";
import {
  MobilePlannedBar,
  PriorityNavigation,
  PlanningWindowTabs,
  MobileColumn,
} from "@/components/shared/MobileFTEKanban";
import { formatTimeFromHours as formatDuration } from "@/utils/formatTimeDisplay";

const columnConfig = {
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

export default function FTEKanbanPage() {
  const params = useParams();
  const router = useRouter();
  const { data: brainDumpData, isLoading, isFetching, refetch } = useGetExtBrainDumpTasks({
    brainDumpId: params.id as string,
  });

  // Refetch data khi vào trang để đảm bảo dữ liệu luôn mới
  useEffect(() => {
    refetch();
  }, []);
  const { mutate: updateBulkPriorities, isPending: isUpdatingPriorities } = useUpdateExtBulkPriorities({ brainDumpId: params.id as string });
  const { mutate: createSprint, isPending: isCreatingSprint } = useCreateSprint();
  const { mutate: updateBulkTasks, isPending: isMovingToBacklog } = useUpdateExtBulkTasks({ brainDumpId: params.id as string });
  const [groupTasks, setGroupTasks] = useState<PriorityGroup>({
    LOW: [],
    MEDIUM: [],
    HIGH: [],
    HIGHEST: [],
  });
  const [selectedWindowType, setSelectedWindowType] = useState<SprintWindowType>(SprintWindowType.TODAY);

  // Track các task đã thay đổi priority để gửi API
  const [changedTasks, setChangedTasks] = useState<Map<string, Priority>>(new Map());

  useEffect(() => {
    if (brainDumpData?.data?.tasks) {
      const grouped = groupTasksByPriority(brainDumpData.data.tasks);
      // Ensure all priority levels exist in the grouped object
      setGroupTasks({
        LOW: grouped.LOW || [],
        MEDIUM: grouped.MEDIUM || [],
        HIGH: grouped.HIGH || [],
        HIGHEST: grouped.HIGHEST || [],
      });
    }
  }, [brainDumpData]);

  const [defering, setDefering] = useState(false);
  const [selecteTasks, setSelectedTasks] = useState<string[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeTask, setActiveTask] = useState<BaseTask | null>(null);
  const [showCalendarComingSoon, setShowCalendarComingSoon] = useState(false);
  const [openConfirmModal, setOpenConfirmModal] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [showStarHint, setShowStarHint] = useState(true);
  const [isBouncing, setIsBouncing] = useState(false);

  // Mobile-specific state
  const [currentMobilePriorityIndex, setCurrentMobilePriorityIndex] = useState(0);
  const mobileScrollRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(false);
  const { mutate: reshuffleMutate, isPending: isReshuffling } = useReshufflePriorities();

  // Detect mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768 || 'ontouchstart' in window);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Debounce changedTasks - chỉ debounce khi không đang kéo
  const debouncedChangedTasks = useDebounce(isDragging ? null : changedTasks, 1000);

  // Effect to submit bulk priority updates after debounce
  useEffect(() => {
    // Skip if this is the initial load
    if (!brainDumpData?.data?.tasks) return;

    // Skip if still dragging or no debounced value
    if (!debouncedChangedTasks) return;

    // Chỉ gửi các task đã thay đổi
    if (debouncedChangedTasks.size > 0) {
      const taskUpdates = Array.from(debouncedChangedTasks.entries())?.map(
        ([taskId, priority]) => ({
          taskId,
          priority,
        })
      );

      updateBulkPriorities({ tasks: taskUpdates });

      // Clear changed tasks sau khi gửi API
      setChangedTasks(new Map());
    }
  }, [debouncedChangedTasks]);

  // Cấu hình sensor để trải nghiệm mượt mà (desktop)
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: isUpdatingPriorities ? 99999 : 8, // Effectively disable when updating
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Mobile touch sensors - chỉ dùng TouchSensor với delay dài để tránh activation nhạy
  const mobileSensors = useSensors(
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 100,
        tolerance: 2,
      },
    })
  );

  // Helper: Tìm xem item thuộc cột nào
  const findContainer = (id: string) => {
    if (id in groupTasks) return id;
    return Object.keys(groupTasks).find((key) =>
      groupTasks[key].some((task) => task.id === id)
    );
  };

  const handleDragStart = (event: DragStartEvent) => {
    if (isUpdatingPriorities) return; // Prevent drag during update

    setIsDragging(true);
    setIsBouncing(false);
    const id = event.active.id as string;
    setActiveId(id);

    // Find the task being dragged
    const container = findContainer(id);
    if (container) {
      const task = groupTasks[container].find((t) => t.id === id);
      setActiveTask(task || null);
    }
  };

  // Helper function to perform the actual move
  const performMove = (activeId: string, activeContainer: string, overContainer: string, overId: string | number, over: any) => {
    console.log('🔄 [Column Switch] Task:', activeId, 'from', activeContainer, '→', overContainer);

    // Track task đã thay đổi priority
    setChangedTasks((prev) => {
      const newMap = new Map(prev);
      newMap.set(activeId, overContainer as Priority);
      return newMap;
    });

    // Di chuyển item giữa 2 mảng state khác nhau
    setGroupTasks((prev) => {
      const activeItems = prev[activeContainer];
      const overItems = prev[overContainer];
      const activeIndex = activeItems.findIndex(
        (task) => task.id === activeId
      );
      const overIndex = overItems.findIndex((task) => task.id === overId);

      let newIndex: number;
      if (overId in prev) {
        newIndex = overItems.length + 1;
      } else {
        const modifier = 0;
        newIndex = overIndex >= 0 ? overIndex + modifier : overItems.length + 1;
      }
      return {
        ...prev,
        [activeContainer]: [
          ...prev[activeContainer]?.filter((item) => item.id !== activeId),
        ],
        [overContainer]: [
          ...prev[overContainer].slice(0, newIndex),
          {
            ...prev[activeContainer][activeIndex],
            priority: overContainer as Priority,
          },
          ...prev[overContainer].slice(newIndex, prev[overContainer].length),
        ],
      };
    });

    if (
      defering &&
      activeContainer === "LOW" &&
      selecteTasks.includes(activeId)
    ) {
      setSelectedTasks((prev) => {
        return prev?.filter((id) => id !== activeId);
      });
    }
  };

  // LOGIC 1: Xử lý khi đang di chuyển (DragOver)
  // Disabled tự động chuyển cột - chỉ chuyển khi thực sự thả (DragEnd)
  const handleDragOver = (event: DragOverEvent) => {
    // Không làm gì - để DragEnd xử lý chuyển cột khi thả
    return;
  };

  // LOGIC 2: Xử lý khi thả tay (DragEnd)
  // Xử lý cả chuyển cột và sắp xếp (cho cả desktop và mobile)
  const handleDragEnd = (event: DragEndEvent) => {
    if (isUpdatingPriorities) return;

    setIsDragging(false);
    const { active, over } = event;
    const activeContainer = findContainer(active.id as string);
    const overContainer = findContainer(over?.id as string);

    if (!activeContainer || !overContainer) {
      setActiveId(null);
      return;
    }

    // Xử lý chuyển cột khi drop (cho cả desktop và mobile)
    if (activeContainer !== overContainer && over) {
      console.log('🎯 [Drop] Switching column:', activeContainer, '→', overContainer);
      performMove(active.id as string, activeContainer, overContainer, over.id, over);
      setActiveId(null);
      setActiveTask(null);
      return;
    }

    // Sắp xếp trong cùng cột (cả desktop và mobile)
    const activeIndex = groupTasks[activeContainer].findIndex(
      (task) => task.id === active.id
    );
    const overIndex = groupTasks[overContainer].findIndex(
      (task) => task.id === over?.id
    );

    if (activeIndex !== overIndex) {
      setGroupTasks((items) => ({
        ...items,
        [activeContainer]: arrayMove(
          items[activeContainer],
          activeIndex,
          overIndex
        ),
      }));
    }
    setActiveId(null);
    setActiveTask(null);
  };

  // Calculate sprint dates and capacity based on window type
  const getSprintData = () => {
    const now = dayjs();
    let startDate: string;
    let endDate: string;
    let capacityMinutes: number;
    let selection = ""
    switch (selectedWindowType) {
      case SprintWindowType.TODAY:
        startDate = now.format("YYYY-MM-DD");
        endDate = now.format("YYYY-MM-DD");
        capacityMinutes = 480; // 8 hours
        selection = "Today"
        break;
      case SprintWindowType.THREEDAYS:
        startDate = now.format("YYYY-MM-DD");
        endDate = now.add(3, "day").format("YYYY-MM-DD");
        capacityMinutes = 1440; // 24 hours
        selection = "3 Days"
        break;
      case SprintWindowType.WEEK:
      default:
        startDate = now.format("YYYY-MM-DD");
        endDate = now.add(7, "day").format("YYYY-MM-DD");
        capacityMinutes = 2400; // 40 hours
        selection = "Weekly"
        break;
    }

    return { startDate, endDate, capacityMinutes, selection };
  };

  // Handler for starting sprint
  const handleStartSprint = () => {
    // Get all task IDs from groupTasks
    const taskIds = Object.values(groupTasks)
      .flat()
      ?.map((task) => task.id);

    // Prevent sprint creation if no tasks
    if (taskIds.length === 0) {
      toast.error("Cannot create sprint without tasks");
      return;
    }

    const { startDate, endDate, capacityMinutes } = getSprintData();
    const sprintTitle = `${selectedWindowType === SprintWindowType.WEEK ? "Week" : selectedWindowType === SprintWindowType.TODAY ? "Today" : "3 Days"} Sprint - ${dayjs().format("MMM DD")}`;

    createSprint({
      title: sprintTitle,
      windowType: selectedWindowType,
      startDate,
      endDate,
      capacityMinutes,
      taskIds,
    }, {
      onSuccess: () => {
        router.push(RouteConfig.MasterKanBan.path);
      },
    });
  };

  // Handler for immediate optimistic update when star is clicked
  const handlePriorityChange = (taskId: string, newPriority: Priority) => {
    setGroupTasks((prev) => {
      let foundTask: BaseTask | null = null;
      const updated: PriorityGroup = {
        LOW: [],
        MEDIUM: [],
        HIGH: [],
        HIGHEST: [],
      };

      Object.keys(prev).forEach((key) => {
        updated[key as Priority] = prev[key as Priority]?.filter((task) => {
          if (task.id === taskId) {
            foundTask = { ...task, priority: newPriority };
            return false;
          }
          return true;
        });
      });

      if (foundTask) {
        updated[newPriority].push({ ...foundTask, priority: newPriority });
      }

      return updated;
    });
  };

  const activeTasks = brainDumpData?.data?.tasks?.filter(task => task.taskType !== TaskType.BACKLOG) || [];

  // Handler for reshuffle - sends current tasks to AI service
  const handleReshuffle = () => {
    const allTasks = Object.values(groupTasks).flat()?.filter(task => task.taskType !== TaskType.BACKLOG);
    if (allTasks.length === 0) return;

    reshuffleMutate(
      { tasks: allTasks?.map(mapTaskToReshuffleInput) },
      {
        onSuccess: (data) => {
          if (!data?.tasks?.length) return;
          // Merge changed tasks back into groupTasks
          const changesMap = new Map(data.tasks?.map((t) => [t.id, t.priority]));
          setGroupTasks((prev) => {
            const allCurrent = Object.values(prev).flat();
            const updated = allCurrent?.map((task) => {
              const newPriority = changesMap.get(task.id);
              if (newPriority != null) {
                return { ...task, priority: mapPriorityFromInt(newPriority) as Priority };
              }
              return task;
            });
            const grouped = groupTasksByPriority(updated);
            return {
              LOW: grouped.LOW || [],
              MEDIUM: grouped.MEDIUM || [],
              HIGH: grouped.HIGH || [],
              HIGHEST: grouped.HIGHEST || [],
            };
          });
          // Persist new priorities to backend
          const taskUpdates = data.tasks?.map((t) => ({
            taskId: t.id,
            priority: mapPriorityFromInt(t.priority) as Priority,
          }));
          updateBulkPriorities({ tasks: taskUpdates });
        },
      }
    );
  };

  // Mobile scroll handlers
  const handleMobileScroll = () => {
    if (!mobileScrollRef.current) return;
    const scrollLeft = mobileScrollRef.current.scrollLeft;
    const columnWidth = mobileScrollRef.current.offsetWidth * 0.8; // 80vw per column
    const index = Math.round(scrollLeft / columnWidth);
    setCurrentMobilePriorityIndex(Math.min(Math.max(index, 0), 3));
  };

  const scrollToColumn = (index: number) => {
    if (!mobileScrollRef.current) return;
    const columnWidth = mobileScrollRef.current.offsetWidth * 0.8;
    mobileScrollRef.current.scrollTo({
      left: columnWidth * index,
      behavior: "smooth",
    });
  };

  // Mobile handlers
  const handleMobileStarClick = (task: BaseTask, e: React.MouseEvent) => {
    e.stopPropagation();
    const newPriority = task.priority === Priority.Highest ? Priority.Low : Priority.Highest;
    handlePriorityChange(task.id, newPriority);
    updateBulkPriorities({
      tasks: [{ taskId: task.id, priority: newPriority }],
    });
  };

  const handleMobileDeferToBacklog = () => {
    const tasksToMove = selecteTasks?.map((taskId) => ({
      taskId,
      taskType: TaskType.BACKLOG,
    }));

    updateBulkTasks(
      { tasks: tasksToMove },
      {
        onSuccess: () => {
          setDefering(false);
          setSelectedTasks([]);
        },
      }
    );
  };
  return (
    <div className="mx-auto flex flex-col h-[100vh] w-full">
      {/* Mobile View */}
      <div className="flex flex-col h-full md:hidden">
        {/* Planning Window Tabs */}
        <PlanningWindowTabs
          selectedWindow={selectedWindowType}
          onWindowChange={setSelectedWindowType}
          showCalendarComingSoon={showCalendarComingSoon}
          onCalendarClick={() => setShowCalendarComingSoon(true)}
        />

        {/* Priority Navigation - Scroll Position Indicator */}
        <PriorityNavigation
          currentPriorityIndex={currentMobilePriorityIndex}
          onIndicatorClick={scrollToColumn}
        />

        {/* Horizontally Scrollable Columns with DnD */}
        <DndContext
          sensors={mobileSensors}
          collisionDetection={pointerWithin}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          <div
            ref={mobileScrollRef}
            onScroll={handleMobileScroll}
            className="flex flex-1 min-h-0 overflow-x-auto gap-3 px-3 scrollbar-hide [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
          >
            {([Priority.Low, Priority.Medium, Priority.High, Priority.Highest] as Priority[])?.map((priority) => (
              <MobileColumn
                key={priority}
                priority={priority}
                tasks={(groupTasks[priority] || [])?.filter(task => task.taskType !== TaskType.BACKLOG)}
                isLoading={isLoading || isReshuffling || isFetching}
                isDefering={defering && priority === Priority.Low}
                selectedTasks={selecteTasks}
                setSelectedTasks={setSelectedTasks}
                setDefering={setDefering}
                isMovingToBacklog={isMovingToBacklog}
                isUpdatingPriorities={isUpdatingPriorities}
                onDeferToBacklog={handleMobileDeferToBacklog}
                onStarClick={handleMobileStarClick}
                onEditTask={(taskId) => console.log("Edit:", taskId)}
              />
            ))}
          </div>
          {/* Mobile Drag Overlay */}
          <DragOverlay
            dropAnimation={{
              duration: 200,
              easing: "cubic-bezier(0.18, 0.67, 0.6, 1.22)",
            }}
          >
            {activeId && activeTask ? (
              <div className={`rotate-2 opacity-90 scale-105 bg-[#2a2a2a] border-border border rounded-xl p-3 transition-transform ${
                isBouncing ? 'animate-bounce' : ''
              }`}>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-white font-medium text-sm leading-snug line-clamp-2">
                      {activeTask.title}
                    </h3>
                  </div>
                  <span className="text-gray-400 text-xs shrink-0">
                    {formatDuration(activeTask.expectedTimeHours)}
                  </span>
                </div>
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>

        {/* Capacity Bar */}
        <MobilePlannedBar
          totalCapacity={getSprintData().capacityMinutes}
          totalPlanned={activeTasks?.reduce((total, task) => total + (task.expectedTimeHours || 0) * 60, 0) || 0}
        />

        {/* Commit Button */}
        <div className="px-6 pb-10 mt-10 shrink-0 flex justify-center">
          <Button
            onClick={() => setOpenConfirmModal(true)}
            disabled={!brainDumpData?.data?.tasks?.length || brainDumpData.data.tasks.length === 0}
            className="w-[164px] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Commit to Sprint
            <Sparkles className="ml-2 w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Desktop View */}
      <div className="hidden md:flex flex-col flex-1 min-h-0 mt-10 p-6 py-0 max-w-[100vw] xl:max-w-[1300px] 1.5xl:max-w-[1600px] mx-auto">
        <div className="flex justify-between mb-6 ">
          <div onClick={() => router.push(RouteConfig.ExtAtomicSplitPage.getPath(params.id as string))}>
            {" "}
            <Button>
              <Undo2 />
              Back
            </Button>
          </div>
          <div className="flex items-center gap-3">
            <Tabs
              defaultValue="TODAY"
              className="select-none text-foreground"
              onValueChange={(value) => {
                if (value === "TODAY") setSelectedWindowType(SprintWindowType.TODAY);
                else if (value === "THREEDAYS") setSelectedWindowType(SprintWindowType.THREEDAYS);
                else setSelectedWindowType(SprintWindowType.WEEK);
              }}
            >

              <TabsList className="bg-[#1a1a1a] border border-gray-800">
              <TabsTrigger
                className="data-[state=active]:bg-green-400/33!  p-3"
                value="TODAY"
              >
                Today
              </TabsTrigger>
              <TabsTrigger
                className="data-[state=active]:bg-green-400/33!  p-3"
                value="THREEDAYS"
              >
                3 Days
              </TabsTrigger>
              <TabsTrigger
                className="data-[state=active]:bg-green-400/33!  p-3 relative"
                value="WEEK"
              >
                <Tag className="bg-green-400/33! absolute -top-8 text-[10px]! rounded-2xl!">
                  Recommended
                </Tag>
                Weekly
              </TabsTrigger>
              <button
                onClick={() => setShowCalendarComingSoon(true)}
                className={`bg-secondary-card ml-2 flex gap-2 items-center rounded-lg border px-4 py-0.4 border-border`}
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
        </div>
        <div className="flex  justify-center items-center gap-2 h-6! mb-5 text-sm">
        {showStarHint && (
          <> <InfoIcon />
          <span className="text-muted-foreground">
            Star + date anything that must land before sprint end - Vantum will
            protect it when replanning.
          </span></>
        )}
        </div>
        <div className="flex flex-col flex-1 min-h-0 overflow-x-auto scrollbar-hide [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <DndContext
            sensors={sensors}
            collisionDetection={pointerWithin}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
          >
            <div className="min-w-[1400px] xl:min-w-auto flex-1 min-h-0 bg-card p-4 px-2 rounded-lg flex justify-evenly gap-4">
              {(Object.keys(columnConfig) as Priority[])?.map(
                (priority) => {
                  const config = columnConfig[priority];
                  return (
                    <SortableContext
                      key={priority}
                      id={priority}
                      items={groupTasks[priority]?.filter(task => task.taskType !== TaskType.BACKLOG)?.map((task) => task.id)}

                      strategy={verticalListSortingStrategy}
                    >
                      <div
                        key={priority}
                        className={`w-[350px] border-border border flex flex-col ${config.bgColor} ${config.borderColor} rounded-2xl p-4`}
                      >
                        <div className="flex items-center justify-between mb-4 shrink-0 min-h-[34px]">
                          <h2 className="text-white font-semibold ">
                            {config.title}
                          </h2>
                          {priority === "LOW" && (
                            <div className="flex items-center gap-2">
                              {defering ? (
                                <>
                                  <span className="text-sm">
                                    Select items to defer
                                  </span>
                                  <button
                                    onClick={() => {
                                      const lowTaskIds = groupTasks.LOW?.map(t => t.id);
                                      const allSelected = lowTaskIds.every(id => selecteTasks.includes(id));
                                      if (allSelected) {
                                        setSelectedTasks([]);
                                      } else {
                                        setSelectedTasks(lowTaskIds);
                                      }
                                    }}
                                    className="text-xs text-gray-400 hover:text-white underline"
                                  >
                                    {groupTasks.LOW.length > 0 && groupTasks.LOW.every(t => selecteTasks.includes(t.id))
                                      ? "Unselect all"
                                      : "Select all"}
                                  </button>
                                </>
                              ) : (
                                <Button
                                  onClick={() => {
                                    setDefering(true);
                                  }}
                                  variant="outline"
                                  size="sm"
                                  disabled={isUpdatingPriorities || isMovingToBacklog}
                                  className="text-xs rounded-lg border-gray-700 text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  Defer to backlog
                                </Button>
                              )}
                            </div>
                          )}
                        </div>

                        <DroppableColumn
                          id={priority}
                          className="flex-1 space-y-3 overflow-auto min-h-0 scrollbar-hide [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
                        >
                          {isLoading || (isReshuffling || isFetching) ? (
                            // Loading skeleton
                            <>
                              {[1, 2, 3]?.map((i) => (
                                <div
                                  key={i}
                                  className="bg-card-foreground/10 rounded-lg p-4 animate-pulse"
                                >
                                  <div className="h-4 bg-card-foreground/20 rounded w-3/4 mb-2" />
                                  <div className="h-3 bg-card-foreground/20 rounded w-1/2" />
                                </div>
                              ))}
                            </>
                          ) : (
                            (groupTasks[priority] || [])?.filter(task => task.taskType !== TaskType.BACKLOG)?.map((task) => (
                            <SortableKanbanItem key={task.id} id={task.id}>
                              <KanBanItem
                                isDefering={defering}
                                isSelected={selecteTasks.includes(task.id)}
                                isLoading={isUpdatingPriorities}
                                key={task.id}
                                item={task}
                                title={task.title}
                                setSelectedTasks={setSelectedTasks}
                                timeEstimate={formatDuration(
                                  task.expectedTimeHours
                                )}
                                isStarred={
                                  task.priority === Priority.Highest || false
                                }
                                onEdit={() => console.log("Edit:", task.id)}
                                onToggleStar={() => setShowStarHint(false)}
                                onPriorityChange={handlePriorityChange}
                                onClick={() =>
                                  console.log("Task clicked:", task.id)
                                }
                              />
                            </SortableKanbanItem>
                          ))
                          )}
                        </DroppableColumn>
                        {priority === "LOW" && defering && (
                          <div className="flex items-center gap-3 pt-2 border-t-2 border-border justify-center">
                            <>
                              <div className="text-gray-400 text-sm flex gap-1">
                                <span> {selecteTasks.length}</span>
                                <span>selected</span>
                              </div>
                              <Button
                                onClick={() => {
                                  setDefering(false);
                                  setSelectedTasks([]);
                                }}
                                variant="outline"
                                size="sm"
                                className="px-4 py-1 text-xs rounded-md border-gray-700 text-gray-400 hover:text-white"
                              >
                                Cancel
                              </Button>
                              <Button
                                onClick={() => {
                                  const tasksToMove = selecteTasks?.map((taskId) => ({
                                    taskId,
                                    taskType: TaskType.BACKLOG,
                                  }));

                                  updateBulkTasks(
                                    { tasks: tasksToMove },
                                    {
                                      onSuccess: () => {
                                        setDefering(false);
                                        setSelectedTasks([]);
                                      },
                                    }
                                  );
                                }}
                                disabled={isMovingToBacklog || isUpdatingPriorities || selecteTasks.length === 0}
                                variant="outline"
                                size="sm"
                                className="hover:text-black! px-4 py-1 text-xs rounded-lg bg-white! text-black font-medium hover:bg-gray-200 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-transparent disabled:text-gray-400 disabled:border-dashed disabled:border-gray-500"
                              >
                                {isMovingToBacklog && (
                                  <div className="w-3 h-3 border-2 border-black border-t-transparent rounded-full animate-spin " />
                                )}
                                Move to backlog
                              </Button>
                            </>
                          </div>
                        )}
                      </div>
                    </SortableContext>
                  );
                }
              )}
            </div>
            <DragOverlay
              dropAnimation={{
                duration: 200,
                easing: "cubic-bezier(0.18, 0.67, 0.6, 1.22)",
              }}
            >
              {activeId && activeTask ? (
                <div className={`rotate-3 opacity-90 scale-105 transition-transform ${
                  isBouncing ? 'animate-bounce' : ''
                }`}>
                  <KanBanItem
                    isDefering={false}
                    isSelected={false}
                    isLoading={isUpdatingPriorities}
                    item={activeTask}
                    title={activeTask.title}
                    setSelectedTasks={setSelectedTasks}
                    timeEstimate={formatDuration(activeTask.expectedTimeHours)}
                    isStarred={activeTask.priority === Priority.Highest || false}
                    onEdit={() => {}}
                    onToggleStar={() => {}}
                    onPriorityChange={handlePriorityChange}
                    onClick={() => {}}
                  />
                </div>
              ) : null}
            </DragOverlay>
          </DndContext>
        </div>
        {/* Workload vs Capacity Bar */}
        <PlannedBar
          totalCapacity={getSprintData().capacityMinutes}
          totalPlanned={activeTasks?.reduce((total, task) => total + (task.expectedTimeHours || 0) * 60, 0) || 0}
          durationLabel={getSprintData().selection}
        />
        <div className="text-center">

          <div className="grid grid-cols-3 mb-5">
            {" "}
            <div></div>
            <div className="col-span-1">
              {" "}
              <Button
                onClick={handleReshuffle}
                disabled={isReshuffling || !brainDumpData?.data?.tasks?.length}
                className="mt-5 mb-5 hover:bg-chart-3/40! cursor-pointer bg-chart-3/20 px-5 py-2 border border-border text-foreground disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Sparkles />
                <span>{isReshuffling ? "Re-shuffling..." : "Re-shuffle now"}</span>
              </Button>
            </div>
            <div className="items-center flex justify-end">
              <Button
                onClick={() => setOpenConfirmModal(true)}
                disabled={!brainDumpData?.data?.tasks?.length || brainDumpData.data.tasks.length === 0}
                className="disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Commit to Sprint
                <Sparkles />
              </Button>
            </div>
          </div>
        </div>
      </div>
      <ConfirmModal
        tasksCount={activeTasks.length}
        plannedTime={formatDuration(
          activeTasks.reduce((total, task) => total + (task.expectedTimeHours || 0), 0) || 0
        )}
        totalPlannedMinutes={activeTasks.reduce((total, task) => total + (task.expectedTimeHours || 0) * 60, 0) || 0}
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
