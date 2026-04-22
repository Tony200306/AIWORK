"use client";

import { Calendar } from "lucide-react";
import { SprintWindowType } from "@/models/Sprint";

interface PlanningWindowTabsProps {
  selectedWindow: SprintWindowType;
  onWindowChange: (window: SprintWindowType) => void;
  showCalendarComingSoon: boolean;
  onCalendarClick: () => void;
}

export function PlanningWindowTabs({
  selectedWindow,
  onWindowChange,
  showCalendarComingSoon,
  onCalendarClick,
}: PlanningWindowTabsProps) {
  return (
    <div className="w-full px-4 py-3">
      <div className="flex flex-col items-center gap-1">
        {/* Recommended Badge - only show when Weekly is selected */}
        <div className="h-5">
          {selectedWindow === SprintWindowType.WEEK && (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-400/20 text-green-400 border border-green-400/30">
              Recommended
            </span>
          )}
        </div>

        {/* Planning window label */}
        <span className="text-muted-foreground text-xs mb-1">Planning window</span>

        {/* Tabs Container */}
        <div className="flex items-center bg-[#1a1a1a] rounded-lg border border-gray-800 p-0.5">
        
          <button
            onClick={() => onWindowChange(SprintWindowType.TODAY)}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              selectedWindow === SprintWindowType.TODAY
                ? "bg-green-400/20 text-white"
                : "text-gray-400 hover:text-white"
            }`}
          >
            Today
          </button>
          <button
            onClick={() => onWindowChange(SprintWindowType.THREEDAYS)}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              selectedWindow === SprintWindowType.THREEDAYS
                ? "bg-green-400/20 text-white"
                : "text-gray-400 hover:text-white"
            }`}
          >
            3 Days
          </button>
            <button
            onClick={() => onWindowChange(SprintWindowType.WEEK)}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              selectedWindow === SprintWindowType.WEEK
                ? "bg-green-400/20 text-white"
                : "text-gray-400 hover:text-white"
            }`}
          >
            Weekly
          </button>
          <button
            onClick={onCalendarClick}
            className="ml-1 p-1.5 rounded-md bg-[#2a2a2a] border border-gray-700"
          >
            <Calendar className="w-4 h-4 text-white" />
          </button>
        </div>
      </div>
    </div>
  );
}
