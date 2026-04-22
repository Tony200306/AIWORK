"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { formatTimeFromMinutes } from "@/utils/formatTimeDisplay";

type ViewMode = "actual" | "plan";

interface ActualVsPlannedBarProps {
  plannedMinutes: number;
  capacityMinutes: number;
  actualMinutes: number;
}

export function ActualVsPlannedBar({
  plannedMinutes,
  capacityMinutes,
  actualMinutes,
}: ActualVsPlannedBarProps) {
  const [mode, setMode] = useState<ViewMode>("actual");
  const [animatedWidth, setAnimatedWidth] = useState(0);

  // Actual mode
  const isOverPlanned = actualMinutes > plannedMinutes;
  const actualMax = Math.max(actualMinutes, capacityMinutes);
  const actualTarget = actualMax > 0 ? Math.min((actualMinutes / actualMax) * 100, 100) : 0;

  // Plan mode (WorkLoadAndCapacity style)
  const planTarget = capacityMinutes > 0 ? Math.min((plannedMinutes / capacityMinutes) * 100, 100) : 0;

  const targetWidth = mode === "actual" ? actualTarget : planTarget;

  useEffect(() => {
    setAnimatedWidth(0);
    const timer = setTimeout(() => setAnimatedWidth(targetWidth), 100);
    return () => clearTimeout(timer);
  }, [targetWidth, mode]);

  const toggleMode = () => setMode((prev) => (prev === "actual" ? "plan" : "actual"));

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <button onClick={toggleMode} className="body-medium text-muted-foreground cursor-pointer hover:text-white transition-colors">
          Actual vs planned
        </button>
        <span className="body-medium text-muted-foreground">
          {mode === "actual"
            ? `${formatTimeFromMinutes(actualMinutes)} / ${formatTimeFromMinutes(plannedMinutes)}`
            : `${formatTimeFromMinutes(plannedMinutes)} / ${formatTimeFromMinutes(capacityMinutes)}`}
        </span>
      </div>

      {mode === "actual" ? (
        <>
          {/* Progress bar */}
          <div className="relative w-full h-8 bg-gray-700 rounded-md overflow-hidden">
            <div
              className={cn(
                "absolute h-full rounded-md transition-all duration-700 ease-out",
                isOverPlanned
                  ? "bg-gradient-to-r from-red-600 to-red-500"
                  : "bg-gradient-to-r from-emerald-600 to-emerald-500"
              )}
              style={{ width: `${animatedWidth}%` }}
            />
          </div>

          {/* Labels */}
          <div className="flex items-center justify-between mt-2">
            <span className="detail text-muted-foreground">
              Planned: <span className="text-white">{formatTimeFromMinutes(plannedMinutes)}</span>
            </span>
            <span className="detail text-muted-foreground">
              Capacity: <span className="text-white">{formatTimeFromMinutes(capacityMinutes)}</span>
            </span>
            <span className="detail text-muted-foreground">
              Actual: <span className="text-white">{formatTimeFromMinutes(actualMinutes)}</span>
            </span>
          </div>
        </>
      ) : (
        <>
          {/* Progress bar - WorkLoadAndCapacity style */}
          <div className="relative w-full h-8 bg-gray-700 rounded-md overflow-hidden">
            <div
              className="absolute h-full bg-[#00FF00] transition-all duration-700 ease-out"
              style={{ width: `${animatedWidth}%` }}
            />
          </div>

          {/* Labels */}
          <div className="flex items-center justify-between mt-2">
            <span className="detail text-muted-foreground">
              Planned: <span className="text-white">{formatTimeFromMinutes(plannedMinutes)}</span>
            </span>
            <span className="detail text-muted-foreground">
              Capacity: <span className="text-white">{formatTimeFromMinutes(capacityMinutes)}</span>
            </span>
            <span className="detail text-muted-foreground">
              Completed: <span className="text-white">{formatTimeFromMinutes(actualMinutes)}</span>
            </span>
          </div>
        </>
      )}
    </div>
  );
}
