"use client";

import { Priority } from "@/models/Task";
import { ChevronLeft, ChevronRight } from "lucide-react";

const PRIORITIES: Priority[] = [Priority.Low, Priority.Medium, Priority.High, Priority.Highest];

const priorityLabels: Record<Priority, string> = {
  LOW: "Low",
  MEDIUM: "Medium",
  HIGH: "High",
  HIGHEST: "Priority",
  LOWEST: "Lowest",
};

const priorityColors: Record<Priority, string> = {
  LOW: "bg-white/60",
  MEDIUM: "bg-[#E38A00]",
  HIGH: "bg-[#02BE7F]",
  HIGHEST: "bg-[#EA2416]",
  LOWEST: "bg-gray-500",
};

interface PriorityNavigationProps {
  currentPriorityIndex: number;
  onIndicatorClick?: (index: number) => void;
}

export function PriorityNavigation({
  currentPriorityIndex,
  onIndicatorClick,
}: PriorityNavigationProps) {
  const currentPriority = PRIORITIES[currentPriorityIndex];
  const canGoLeft = currentPriorityIndex > 0;
  const canGoRight = currentPriorityIndex < PRIORITIES.length - 1;

  const goLeft = () => {
    if (canGoLeft) {
      onIndicatorClick?.(currentPriorityIndex - 1);
    }
  };

  const goRight = () => {
    if (canGoRight) {
      onIndicatorClick?.(currentPriorityIndex + 1);
    }
  };

  return (
    <div className="w-full px-4 py-2 mb-2">
      {/* Arrow Navigation */}
      <div className="flex items-center justify-center gap-6 mb-3 border-t border-border pt-3">
        <button
          onClick={goLeft}
          disabled={!canGoLeft}
          className={`p-1 ${canGoLeft ? "text-white" : "text-gray-600"}`}
          aria-label="Previous priority"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        <span className="text-white font-semibold text-lg min-w-[100px] text-center">
          {priorityLabels[currentPriority]}
        </span>

        <button
          onClick={goRight}
          disabled={!canGoRight}
          className={`p-1 ${canGoRight ? "text-white" : "text-gray-600"}`}
          aria-label="Next priority"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>

      {/* Progress Indicator Bars */}
      <div className="flex gap-1.5">
        {PRIORITIES?.map((priority, index) => (
          <button
            key={priority}
            onClick={() => onIndicatorClick?.(index)}
            className={`flex-1 h-1.5 rounded-full transition-colors ${
              index === currentPriorityIndex
                ? priorityColors[priority]
                : "bg-gray-700"
            }`}
            aria-label={`Go to ${priority} column`}
          />
        ))}
      </div>
    </div>
  );
}

// Export column width constant for use in parent components
// Width calculation: 80vw per column ensures columns are visible with peek of next
export const MOBILE_COLUMN_WIDTH = 80; // vw units
