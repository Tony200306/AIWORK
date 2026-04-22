import { LogoIcon } from "@/components/icon/LogoIcon";
import { Loading } from "@/components/Loading";
import { Accordion } from "@/components/ui/accordion";
import { Skeleton } from "@/components/ui/skeleton";
import { Task } from "../../../../../../models/Task";
import TaskItem from "./TaskItem";
import TaskDetailView from "./TaskDetailView";
import TaskExpandedView from "./TaskExpandedView";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Props {
  tasks: Task[];
  onTaskClick?: (taskId: string) => void;
  onEditTags?: (taskId: string) => void;
  selectedTaskId?: string | null;
  isLoading: boolean;
  isStreaming?: boolean;
  mobileView?: "steps" | "scope";
  onPrevTask?: () => void;
  onNextTask?: () => void;
  currentTaskIndex?: number;
  totalTasks?: number;
  expandedTaskId?: string | null;
  onExpandedTaskIdChange?: (taskId: string | null) => void;
  onSwitchToStepsAndExpand?: (taskId: string) => void;
  headerHeight?: number;
}
export default function TasksList({
  tasks,
  onTaskClick,
  onEditTags,
  selectedTaskId,
  isLoading,
  isStreaming = false,
  mobileView = "steps",
  onPrevTask,
  onNextTask,
  currentTaskIndex = 0,
  totalTasks = 0,
  expandedTaskId,
  onExpandedTaskIdChange,
  onSwitchToStepsAndExpand,
  headerHeight,
}: Props) {
  // Handle accordion toggle (from chevron click)
  const handleAccordionChange = (value: string) => {
    onExpandedTaskIdChange?.(value || null);
    // Also select the task when expanding via chevron
    if (value) {
      onTaskClick?.(value);
    }
  };

  // Handle card body click (selection only, no expansion)
  const handleCardClick = (taskId: string) => {
    onTaskClick?.(taskId);
  };

  // Check if navigation buttons should be disabled
  const isPrevDisabled = currentTaskIndex <= 0;
  const isNextDisabled = currentTaskIndex >= totalTasks - 1;

  // Get selected task for scope view
  const selectedTask = tasks.find((task) => task.id === selectedTaskId);

  // Mobile Scope View - show task detail
  if (mobileView === "scope") {
    return (
      <div className="w-full max-w-[690px] flex flex-col flex-1 min-h-0 md:hidden">
        {/* Header - Task Detail title */}
        <div className="flex flex-col items-center gap-4 mb-4">
          <h1 className="text-[34px] font-semibold text-white">Task Detail</h1>

          {/* Task navigation */}
          <div className="flex items-center gap-4">
            <button
              onClick={onPrevTask}
              disabled={isPrevDisabled}
              className={`p-1 transition-opacity ${
                isPrevDisabled ? "opacity-30 cursor-not-allowed" : "opacity-100 cursor-pointer"
              }`}
            >
              <ChevronLeft size={24} className="text-white" />
            </button>
            <span className="text-lg font-medium text-white">
              Task {currentTaskIndex + 1}
            </span>
            <button
              onClick={onNextTask}
              disabled={isNextDisabled}
              className={`p-1 transition-opacity ${
                isNextDisabled ? "opacity-30 cursor-not-allowed" : "opacity-100 cursor-pointer"
              }`}
            >
              <ChevronRight size={24} className="text-white" />
            </button>
          </div>
        </div>

        {/* Task Detail Content */}
        <div className="flex-1 min-h-0 overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <Loading strokeWidth={25} size={300} classWrapper="size-10" icon={<LogoIcon size={150} />} />
            </div>
          ) : selectedTask ? (
            <TaskDetailView
              task={selectedTask}
              onExpandClick={() => onSwitchToStepsAndExpand?.(selectedTask.id)}
            />
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              No task selected
            </div>
          )}
        </div>
      </div>
    );
  }

  // Desktop and Mobile Steps View - show task list
  return (
    <div className="w-full max-w-[690px] flex flex-col flex-1 min-h-0 ">
      <div
        className="p-7 rounded-t-2xl bg-accent hidden md:flex items-center justify-between"
        style={{ height: headerHeight ? `${headerHeight}px` : undefined }}
      >
        <h2 className="text-2xl font-semibold text-white">
          Deliverables/ Tasks
        </h2>
      </div>

      {/* Tasks List */}
      <div className="relative flex flex-1 min-h-0 bg-card md:bg-none border-border border-2 rounded-2xl md:rounded-none">
        {/* Loading overlay - outside scroll area */}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-card md:bg-background z-10 rounded-2xl md:rounded-none">
            <Loading strokeWidth={25} size={300} classWrapper="size-10" icon={<LogoIcon size={150} />} />
          </div>
        )}

        {/* Expanded view - covers list when a task is expanded (mobile only) */}
        {expandedTaskId && tasks.find((t) => t.id === expandedTaskId) && (
          <TaskExpandedView
            task={tasks.find((t) => t.id === expandedTaskId)!}
            onCollapse={() => onExpandedTaskIdChange?.(null)}
            isStreaming={isStreaming}
          />
        )}

        {/* Scrollable content */}
        <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-2 md:p-5 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <Accordion
            type="single"
            collapsible
            value={expandedTaskId || ""}
            onValueChange={handleAccordionChange}
            className="flex flex-col gap-4"
          >
            {tasks?.map((task) => (
              <TaskItem
                key={task.id}
                task={task}
                variant={"dark"}
                onClick={handleCardClick}
                onEditTags={onEditTags}
                isSelected={selectedTaskId === task.id}
                isStreaming={isStreaming}
              />
            ))}
          </Accordion>
        </div>

        {/* Streaming overlay - shows when AI is generating and tasks exist */}
        {isStreaming && tasks.length > 0 && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
            <div className="opacity-50">
              <Loading strokeWidth={25} size={300} classWrapper="size-10" icon={<LogoIcon size={150} />} />
            </div>
          </div>
        )}
      </div>

      <Skeleton />
    </div>
  );
}
