"use client";

import { Button } from "@/components/ui/button";
import { Task, Priority, TaskStatus } from "@/models/Task";
import { MobileKanBanItem } from "./MobileKanBanItem";
import { MobileSortableKanbanItem } from "./MobileSortableKanbanItem";
import { AlertCircle } from "lucide-react";
import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { formatTimeFromHours as formatDuration } from "@/utils/formatTimeDisplay";

const priorityLabels: Record<Priority, string> = {
  LOW: "Low",
  MEDIUM: "Medium",
  HIGH: "High",
  HIGHEST: "Priority",
  LOWEST: "Lowest",

};

const priorityBgColors: Record<Priority, string> = {
  LOW: "bg-white/10",
  MEDIUM: "bg-[#E38A00]/10",
  HIGH: "bg-[#02BE7F]/10",
  HIGHEST: "bg-[#EA2416]/10",
  LOWEST: "bg-gray-800/10",
};

interface MobileColumnProps {
  priority: Priority;
  tasks: Task[];
  isLoading: boolean;
  isDefering: boolean;
  selectedTasks: string[];
  setSelectedTasks: React.Dispatch<React.SetStateAction<string[]>>;
  setDefering: React.Dispatch<React.SetStateAction<boolean>>;
  isMovingToBacklog: boolean;
  isUpdatingPriorities: boolean;
  onDeferToBacklog: () => void;
  onStarClick: (task: Task, e: React.MouseEvent) => void;
  onEditTask: (taskId: string) => void;
}

export function MobileColumn({
  priority,
  tasks,
  isLoading,
  isDefering,
  selectedTasks,
  setSelectedTasks,
  setDefering,
  isMovingToBacklog,
  isUpdatingPriorities,
  onDeferToBacklog,
  onStarClick,
  onEditTask,
}: MobileColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: priority });

  const handleSelectAll = () => {
    const taskIds = tasks?.map((t) => t.id);
    const allSelected = taskIds.every((id) => selectedTasks.includes(id));
    if (allSelected) {
      setSelectedTasks([]);
    } else {
      setSelectedTasks(taskIds);
    }
  };

  return (
    <SortableContext
      id={priority}
      items={tasks?.map((task) => task.id)}
      strategy={verticalListSortingStrategy}
    >
      <div
        className={`w-[calc(100vw-40px)] flex flex-col min-h-0 ${priorityBgColors[priority]} rounded-2xl border border-border overflow-hidden w-[80vw] shrink-0 snap-center ${
          isOver ? "ring-2 ring-teal-500/50 ring-inset" : ""
        } transition-all duration-200`}
      >
        {/* Column Header */}
        <div className="flex items-center justify-between px-4 py-3 shrink-0">
          <h2 className="text-white font-semibold text-base">
            {priorityLabels[priority]}
          </h2>
          {priority === "LOW" && (
            <div className="flex items-center gap-2">
              {isDefering ? (
                <>
                  <span className="text-xs text-gray-400">Select items</span>
                  <button
                    onClick={handleSelectAll}
                    className="text-xs text-gray-400 hover:text-white underline"
                  >
                    {tasks.length > 0 && tasks.every((t) => selectedTasks.includes(t.id))
                      ? "Unselect all"
                      : "Select all"}
                  </button>
                </>
              ) : (
                <Button
                  onClick={() => setDefering(true)}
                  variant="outline"
                  size="sm"
                  disabled={isUpdatingPriorities || isMovingToBacklog}
                  className="text-xs rounded-lg border-gray-700 text-gray-400 hover:text-white h-7 px-2"
                >
                  Defer to backlog
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Task List - Droppable Area */}
        <div
          ref={setNodeRef}
          className="flex-1 overflow-auto px-3 pb-2 space-y-2 scrollbar-hide [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
        >
          {isLoading ? (
            <>
              {[1, 2, 3]?.map((i) => (
                <div
                  key={i}
                  className="w-full bg-[#2a2a2a] border border-border rounded-xl p-3 animate-pulse"
                >
                  <div className="h-3 bg-card-foreground/20 rounded w-3/4 mb-2" />
                  <div className="h-2 bg-card-foreground/20 rounded w-1/2" />
                </div>
              ))}
            </>
          ) : tasks.length === 0 ? (
            <div className="flex flex-col items-center pt-4 text-gray-500 min-h-[100px]">
              <p className="text-sm">No tasks</p>
              {isOver && (
                <p className="text-xs text-teal-400 mt-2">Drop here</p>
              )}
            </div>
          ) : (
            tasks?.map((task) => (
              <MobileSortableKanbanItem key={task.id} id={task.id}>
                <MobileKanBanItem
                  item={task}
                  title={task.title}
                  timeEstimate={formatDuration(task.expectedTimeHours)}
                  isStarred={task.priority ===  Priority.Highest}
                  isSelected={selectedTasks.includes(task.id)}
                  isDefering={isDefering}
                  isLoading={isUpdatingPriorities}
                  setSelectedTasks={setSelectedTasks}
                  onStarClick={(e) => onStarClick(task, e)}
                  onEdit={() => onEditTask(task.id)}
                />
              </MobileSortableKanbanItem>
            ))
          )}
        </div>

        {/* Defer Actions Footer */}
        {priority === "LOW" && isDefering && (
          <div className="flex items-center gap-2 px-3 py-2 border-t border-border justify-center shrink-0">
            <span className="text-gray-400 text-xs">
              {selectedTasks.length} selected
            </span>
            <Button
              onClick={() => {
                setDefering(false);
                setSelectedTasks([]);
              }}
              variant="outline"
              size="sm"
              className="px-3 py-1 text-xs rounded-md border-gray-700 text-gray-400 hover:text-white h-7"
            >
              Cancel
            </Button>
            <Button
              onClick={onDeferToBacklog}
              disabled={isMovingToBacklog || isUpdatingPriorities || selectedTasks.length === 0}
              variant="outline"
              size="sm"
              className="hover:text-black! px-3 py-1 text-xs rounded-lg bg-white! text-black font-medium hover:bg-gray-200 h-7 disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-transparent disabled:text-gray-400"
            >
              {isMovingToBacklog && (
                <div className="w-2.5 h-2.5 border-2 border-black border-t-transparent rounded-full animate-spin mr-1" />
              )}
              Move to backlog
            </Button>
          </div>
        )}

        {/* Star Hint */}
        <div className="flex items-center justify-center gap-1.5 px-3 py-2 shrink-0">
          <AlertCircle className="w-3.5 h-3.5 text-gray-500" />
          <span className="text-xs text-gray-500">
            Star anything that needs Vantum protection
          </span>
        </div>
      </div>
    </SortableContext>
  );
}
