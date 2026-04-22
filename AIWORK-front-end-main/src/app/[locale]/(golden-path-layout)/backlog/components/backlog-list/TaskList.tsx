"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { Priority, Task, TaskStatus, TaskType } from "@/models/Task";
import BackLogItem from "./BackLogItem";

type BacklogTask = Task & { steps: NonNullable<Task["steps"]> };

interface TaskListProps {
  tasks: BacklogTask[];
  groupType: TaskType;
  selectedTasks: Set<string>;
  onToggleSelect: (id: string) => void;
  onPriorityChange: (id: string, priority: Priority) => void;
  onStatusChange: (id: string, status: TaskStatus) => void;
  onToggleLock: (id: string) => void;
  // Native drag props
  onTaskDragStart: (e: React.DragEvent, taskId: string, groupType: TaskType) => void;
  onTaskDragOver: (e: React.DragEvent, taskId: string) => void;
  onTaskDrop: (e: React.DragEvent, groupType: TaskType) => void;
  onTaskDragEnd: (e: React.DragEvent) => void;
  dropTargetTaskId: string | null;
  dropPosition: "before" | "after" | null;
  draggedTaskId?: string | null;
}

const emptyShowClick = () => {};

export const TaskList = React.memo(function TaskList({
  tasks,
  groupType,
  selectedTasks,
  onToggleSelect,
  onPriorityChange,
  onStatusChange,
  onToggleLock,
  onTaskDragStart,
  onTaskDragOver,
  onTaskDrop,
  onTaskDragEnd,
  dropTargetTaskId,
  dropPosition,
  draggedTaskId = null,
}: TaskListProps) {
  const isSelectionMode = selectedTasks.size > 0;

  return (
    <div className={cn("w-full isolate", isSelectionMode && "[&_[data-checkbox]]:opacity-100")}>
      {tasks?.map((task) => {
        const breadcrumb = task.tags?.map((t) => t.name) || [];
        const isDropTarget = dropTargetTaskId === task.id;
        const isBeingDragged = draggedTaskId === task.id;

        return (
          <div
            key={task.id}
            draggable={true}
            onDragStart={(e) => onTaskDragStart(e, task.id, groupType)}
            onDragOver={(e) => onTaskDragOver(e, task.id)}
            onDrop={(e) => onTaskDrop(e, groupType)}
            onDragEnd={onTaskDragEnd}
            className={cn(
              "group/item pb-2 cursor-grab active:cursor-grabbing relative touch-none select-none",
              isDropTarget && dropPosition === "before" && "before:content-[''] before:absolute before:top-0 before:left-2 before:right-2 before:h-0.5 before:bg-teal-500 before:rounded-full",
              isDropTarget && dropPosition === "after" && "after:content-[''] after:absolute after:bottom-0 after:left-2 before:right-2 after:h-0.5 after:bg-teal-500 after:rounded-full",
            )}
            style={{ willChange: "transform" }}
          >
            <div className="pointer-events-none">
              <BackLogItem
                item={task}
                breadcrumb={breadcrumb}
                isSelected={selectedTasks.has(task.id)}
                onToggleSelect={() => onToggleSelect(task.id)}
                onPriorityChange={(priority) => onPriorityChange(task.id, priority)}
                onStatusChange={(status) => onStatusChange(task.id, status)}
                onToggleLock={() => onToggleLock(task.id)}
                onShowClick={emptyShowClick}
                isDragging={isBeingDragged}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}, (prevProps, nextProps) => {
  return (
    prevProps.groupType === nextProps.groupType &&
    prevProps.tasks.length === nextProps.tasks.length &&
    prevProps.tasks.every((t, i) =>
      t.id === nextProps.tasks[i].id &&
      t.status === nextProps.tasks[i].status &&
      t.priority === nextProps.tasks[i].priority &&
      t.pinned === nextProps.tasks[i].pinned
    ) &&
    prevProps.selectedTasks.size === nextProps.selectedTasks.size &&
    Array.from(prevProps.selectedTasks).every(id => nextProps.selectedTasks.has(id)) &&
    prevProps.dropTargetTaskId === nextProps.dropTargetTaskId &&
    prevProps.dropPosition === nextProps.dropPosition &&
    prevProps.draggedTaskId === nextProps.draggedTaskId
  );
});
