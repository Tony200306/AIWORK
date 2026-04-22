"use client";

import { useState } from "react";
import { AlertTriangle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useUpdateBulkTasks } from "@/hooks/shared/useUpdateBulkTasks";
import { TaskType } from "@/models/Task";
import { SprintItem } from "@/models/Sprint";

type MoveDestination = "BACKLOG" | "NEXT_SPRINT" | "STAGING";

const DESTINATION_OPTIONS: { value: MoveDestination; label: string }[] = [
  { value: "NEXT_SPRINT", label: "Next Sprint" },
  { value: "STAGING", label: "Staging" },
  { value: "BACKLOG", label: "Backlog" },
];

function destinationToTaskType(dest: MoveDestination): TaskType {
  switch (dest) {
    case "BACKLOG":
      return TaskType.BACKLOG;
    case "STAGING":
      return TaskType.STAGING;
    case "NEXT_SPRINT":
      return TaskType.NEWSPRINT;
  }
}

interface IncompletedTasksDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  incompletedItems: SprintItem[];
  onComplete: (destination: MoveDestination) => void;
}

export function IncompletedTasksDialog({
  open,
  onOpenChange,
  incompletedItems,
  onComplete,
}: IncompletedTasksDialogProps) {
  const [destination, setDestination] = useState<MoveDestination>("BACKLOG");

  const { mutateAsync: updateBulkTasks, isLoading: isMoving } = useUpdateBulkTasks();

  const taskIds = incompletedItems?.map((item) => item.taskId);

  const handleContinue = async () => {
    try {
      await updateBulkTasks({
        tasks: taskIds?.map((taskId) => ({
          taskId,
          taskType: destinationToTaskType(destination),
        })),
      });
      onComplete(destination);
    } catch {
      // Error handled by hook
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="max-w-md gap-6 rounded-2xl border-none bg-[#2A2A2A] p-8"
      >
        <button
          onClick={() => onOpenChange(false)}
          className="absolute right-4 top-4 text-white/60 hover:text-white transition-colors"
        >
          <X className="size-5" />
        </button>

        <DialogHeader className="items-center gap-3">
          <div className="flex size-12 items-center justify-center rounded-full bg-amber-500/20">
            <AlertTriangle className="size-6 text-amber-500" />
          </div>
          <DialogTitle className="text-2xl font-bold text-white">
            {incompletedItems.length} Incomplete Tasks
          </DialogTitle>
          <DialogDescription className="text-center text-sm text-white/60">
            What do you want to do with these Incompleted Tasks?
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-white/80">Move to:</span>
          <Select
            value={destination}
            onValueChange={(v) => setDestination(v as MoveDestination)}
          >
            <SelectTrigger className="flex-1 border-white/10 !bg-[#1A1A1A] text-white font-medium">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="border-white/10 bg-[#1A1A1A]">
              {DESTINATION_OPTIONS.map((opt) => (
                <SelectItem
                  key={opt.value}
                  value={opt.value}
                  className="text-white focus:bg-[#3A3A3A] focus:text-white"
                >
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-3 pt-2">
          <Button
            variant="outline"
            disabled={isMoving}
            onClick={() => onOpenChange(false)}
            className="h-11 rounded-lg border-white/10 bg-[#1A1A1A] text-white hover:bg-[#3A3A3A] hover:text-white font-medium"
          >
            Cancel
          </Button>
          <Button
            disabled={isMoving}
            onClick={handleContinue}
            className="h-11 rounded-lg bg-teal-600 text-white hover:bg-teal-700 font-semibold"
          >
            {isMoving ? "Moving..." : "Continue"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
