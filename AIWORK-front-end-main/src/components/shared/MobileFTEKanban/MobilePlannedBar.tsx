"use client";

import { useEffect, useState } from "react";
import { formatTimeFromMinutes as formatDuration } from "@/utils/formatTimeDisplay";

interface MobilePlannedBarProps {
  totalCapacity?: number;
  totalPlanned?: number;
}

export const MobilePlannedBar = ({
  totalCapacity = 480,
  totalPlanned = 360,
}: MobilePlannedBarProps) => {
  const [animatedWidth, setAnimatedWidth] = useState(0);

  const percentage = totalCapacity > 0 ? Math.round((totalPlanned / totalCapacity) * 100) : 0;
  const freeTime = totalCapacity - totalPlanned;
  const isOverCapacity = percentage > 100;
  const targetWidth = Math.min(percentage, 100);

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedWidth(targetWidth);
    }, 100);
    return () => clearTimeout(timer);
  }, [targetWidth]);

  return (
    <div className="w-full px-4 py-3">
      {/* Free time message */}
      <p className={`w-full text-center text-sm mb-3 h-[40px] ${isOverCapacity ? "text-red-400" : "text-green-400"}`}>
        {isOverCapacity
          ? `You're over capacity by ${formatDuration(Math.abs(freeTime))}. Consider reducing tasks.`
          : ``
        }
      </p>

      {/* Capacity Bar */}
      <div className="relative w-full h-10 bg-gray-700/50 rounded-full overflow-hidden">
        <div
          className={`absolute h-full transition-all duration-700 ease-out rounded-full ${
            isOverCapacity
              ? "bg-gradient-to-r from-red-500 to-red-600"
              : "bg-[#008000]"
          }`}
          style={{ width: `${animatedWidth}%` }}
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-white text-sm font-medium">
            {percentage}% of Capacity
          </span>
        </div>
      </div>
    </div>
  );
};
