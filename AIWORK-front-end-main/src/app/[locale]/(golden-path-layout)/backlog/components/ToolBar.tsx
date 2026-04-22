import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
  Priority,
  TaskStatus,
  TaskType,
  priorityToLabelMapping,
  statusToLabelMapping,
  statusToColorMapping,
  sprintStatusToLabelMapping,
} from "@/models/Task";
import { DoubleTriagle } from "@/components/icon/DoubleTriagle";
import {
  Sparkles,
  Star,
  Shuffle,
  CircleDot,
  Trash2,
  CheckCheck,
  Circle,
  Triangle,
} from "lucide-react";
import React from "react";

const priorityIconMap: Record<Priority, { icon: React.ElementType; color: string }> = {
  [Priority.Highest]: { icon: Star, color: "text-red-500" },
  [Priority.High]: { icon: Triangle, color: "text-orange-500" },
  [Priority.Medium]: { icon: Circle, color: "text-orange-500" },
  [Priority.Low]: { icon: Triangle, color: "text-blue-500 rotate-180" },
  [Priority.Lowest]: { icon: DoubleTriagle, color: "text-gray-500" },
};

interface ToolBarProps {
  hasSelection?: boolean;
  isAllSelected?: boolean;
  isShuffling?: boolean;
  onChangeLane?: (lane: TaskType) => void;
  onChangePriority?: (priority: Priority) => void;
  onChangeStatus?: (status: TaskStatus) => void;
  onDelete?: () => void;
  onSelectAll?: () => void;
  onShuffle?: () => void;
}

export default function ToolBar({
  hasSelection = false,
  isAllSelected = false,
  isShuffling = false,
  onChangeLane,
  onChangePriority,
  onChangeStatus,
  onDelete,
  onSelectAll,
  onShuffle,
}: ToolBarProps) {
  const dimmed = !hasSelection;

  const actionBtnClass = cn(
    "rounded-lg px-6 py-2 border-border bg-secondary-card/70 text-foreground",
    dimmed
      ? "opacity-40 pointer-events-none"
      : "hover:bg-secondary-card",
  );

  const shuffleBtnClass = cn(
    "rounded-full w-9 h-9 border-none bg-white text-black",
    dimmed
      ? "opacity-40 pointer-events-none"
      : "hover:bg-gray-100",
  );

  return (
    <div className="flex items-center justify-center gap-3 p-2 px-4 bg-sidebar rounded-lg">
      {/* Change Lane */}
      <Select value="" onValueChange={(v) => onChangeLane?.(v as TaskType)}>
        <SelectTrigger className={cn(actionBtnClass, "[&>svg:last-child]:hidden")} disabled={dimmed}>
          <Sparkles className="w-5 h-5 mr-2" />
          <SelectValue placeholder="Change Lane" />
        </SelectTrigger>
        <SelectContent position="popper" side="top">
          {Object.values(TaskType)?.map((type) => (
            <SelectItem key={type} value={type} className="text-white!">
              {sprintStatusToLabelMapping()[type]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Change Priority */}
      <Select value="" onValueChange={(v) => onChangePriority?.(v as Priority)}>
        <SelectTrigger className={cn(actionBtnClass, "[&>svg:last-child]:hidden")} disabled={dimmed}>
          <Star className="w-5 h-5 mr-2" />
          <SelectValue placeholder="Change Priority" />
        </SelectTrigger>
        <SelectContent position="popper" side="top">
          {Object.values(Priority)?.map((priority) => {
            const { icon: Icon, color } = priorityIconMap[priority];
            return (
              <SelectItem key={priority} value={priority} className="text-white!">
                <div className="flex items-center gap-2">
                  <Icon className={`w-4 h-4 ${color}`} />
                  {priorityToLabelMapping()[priority]}
                </div>
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>

      <Button
        variant="secondary"
        size="icon"
        className={cn(shuffleBtnClass, isShuffling && "opacity-40 pointer-events-none")}
        onClick={onShuffle}
        disabled={isShuffling}
      >
        <Shuffle className="w-6 h-6" />
      </Button>

      {/* Change Status */}
      <Select value="" onValueChange={(v) => onChangeStatus?.(v as TaskStatus)}>
        <SelectTrigger className={cn(actionBtnClass, "[&>svg:last-child]:hidden")} disabled={dimmed}>
          <CircleDot className="w-5 h-5 mr-2" />
          <SelectValue placeholder="Change Status" />
        </SelectTrigger>
        <SelectContent position="popper" side="top">
          {Object.values(TaskStatus)?.map((status) => (
            <SelectItem key={status} value={status} className="text-white!">
              <div className="flex items-center gap-2">
                <span
                  className="w-3 h-3 rounded-full border-2"
                  style={{ borderColor: statusToColorMapping()[status] }}
                />
                {statusToLabelMapping()[status]}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Button variant="outline" className={actionBtnClass} onClick={onDelete} disabled={dimmed}>
        <Trash2 className="w-5 h-5 mr-2" />
        Delete
      </Button>

      <Button
        variant="outline"
        className="rounded-lg px-6 py-2 bg-secondary-card/70 border-border hover:bg-secondary-card text-foreground"
        onClick={onSelectAll}
      >
        <CheckCheck className="w-5 h-5 mr-2" />
        {isAllSelected ? "Deselect All" : "Select All"}
      </Button>
    </div>
  );
}
