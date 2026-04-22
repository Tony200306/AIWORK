"use client";

import { Button } from "@/components/ui/button";
import { SprintItem } from "@/models/Sprint";
import { Check, ChevronDown, EyeOff, List, Pause, Play } from "lucide-react";

interface DoingTimerProps {
  task: SprintItem;
  onCollapseChange?: (collapsed: boolean) => void;
  isTimerCollapsed: boolean;
  seconds: number;
  isRunning: boolean;
  onPauseToggle: () => void;
}

export default function DoingTimer({
  task,
  onCollapseChange,
  isTimerCollapsed,
  seconds,
  isRunning,
  onPauseToggle,
}: DoingTimerProps) {
  const formatTime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handlePause = () => {
    onPauseToggle();
  };

  const handleComplete = () => {
    // Handle complete logic
    console.log("Task completed");
  };

  const handleHide = () => {
    const newCollapsedState = !isTimerCollapsed;
    onCollapseChange?.(newCollapsedState);
  };

  return (
    <div
      className={`bg-popover-foreground border border-border rounded-3xl transition-all duration-300 ease-in-out ${
        !isTimerCollapsed ? "p-4 mx-auto mb-6" : "px-4 py-0"
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <h2
            className={`text-white ${
              isTimerCollapsed ? "text-md" : "text-lg"
            } font-semibold`}
          >
            {task?.task.title}
          </h2>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-orange-500 text-sm font-mono font-semibold">
            {formatTime(seconds)}
          </div>
          {isTimerCollapsed && (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleHide}
              className="h-2 w-2 p-4 rounded-full hover:bg-gray-700"
            >
              <ChevronDown className="w-4 h-4 text-gray-400" />
            </Button>
          )}
        </div>
      </div>

      <div
        className={`transition-all duration-300 ease-in-out overflow-hidden ${
          isTimerCollapsed ? "max-h-0 opacity-0" : "max-h-96 opacity-100"
        }`}
      >
        <div className="text-gray-400 text-sm space-y-1 mt-2 mb-4">
          <p>Est. {task?.task.expectedTimeHours}</p>
          {/* TODO: */}
          <p>
            Steps 
            {/* Steps {task?.steps?.filter((step) => step.completed === true).length} */}
            /{task?.task.steps.length}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button className="rounded-lg">
            <List className="w-4 h-4 mr-2" />
            Guided steps
          </Button>

          <Button
            variant="outline"
            onClick={handlePause}
            className="w-[110px] bg-transparent hover:bg-gray-800 text-white border border-gray-600 rounded-xl px-6 py-5"
          >
            {isRunning ? (
              <Pause className="w-4 h-4 mr-2" />
            ) : (
              <Play className="w-4 h-4 mr-2" />
            )}
            {isRunning ? "Pause" : "Resume"}
          </Button>

          <Button
            onClick={handleComplete}
            className="bg-teal-600 hover:bg-teal-700 text-white border-none rounded-xl px-6 py-5"
          >
            <Check className="w-4 h-4 mr-2" />
            Complete
          </Button>

          <Button
            variant="outline"
            onClick={handleHide}
            className="bg-gray-700 hover:bg-gray-600 text-white border-none rounded-xl px-6 py-5"
          >
            <EyeOff className="w-4 h-4 mr-2" />
            Hide
          </Button>
        </div>
      </div>
    </div>
  );
}
