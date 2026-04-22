import { useEffect, useState } from "react";
import { formatTimeFromMinutes as formatDuration } from "@/utils/formatTimeDisplay";

type ViewMode = "progress" | "workload";

interface WorkLoadAndCapacityProps {
  totalCapacity?: number;
  totalPlanned?: number;
  totalProgress?: number;
  totalCompleted?: number;
}

export const WorkLoadAndCapacity = ({
  totalCapacity = 2400,
  totalPlanned = 630,
  totalProgress = 0,
  totalCompleted = 0,
}: WorkLoadAndCapacityProps) => {
  const [mode, setMode] = useState<ViewMode>("progress");
  const [animatedWidth, setAnimatedWidth] = useState(0);

  // Workload vs Capacity: planned / capacity
  const workloadPercent = totalCapacity > 0 ? Math.min((totalPlanned / totalCapacity) * 100, 100) : 0;
  const isOverCapacity = totalCapacity > 0 && totalPlanned > totalCapacity;

  // Progress vs Planned: (done + doing) / planned
  const isOverPlanned = totalProgress > totalPlanned;
  const progressPercent = totalPlanned > 0 ? Math.min((totalProgress / totalPlanned) * 100, 100) : 0;

  const targetWidth = mode === "progress" ? progressPercent : workloadPercent;

  useEffect(() => {
    setAnimatedWidth(0);
    const timer = setTimeout(() => setAnimatedWidth(targetWidth), 100);
    return () => clearTimeout(timer);
  }, [targetWidth, mode]);

  const toggleMode = () => setMode((prev) => (prev === "progress" ? "workload" : "progress"));

  return (
    <div className="mt-4  p-4">
      <div className="flex items-center justify-between mb-2">
        <button
          onClick={toggleMode}
          className="text-sm font-medium text-white cursor-pointer hover:text-gray-300 transition-colors"
        >
          {mode === "progress" ? "Progress vs. planned" : "Workload vs. capacity"}
        </button>
        <span className="text-sm text-gray-400">
          {mode === "progress"
            ? `${formatDuration(totalProgress)} / ${formatDuration(totalPlanned)}`
            : `${formatDuration(totalPlanned)} / ${formatDuration(totalCapacity)}`}
        </span>
      </div>

      {/* Progress Bar */}
      <div className="relative w-full h-8 bg-gray-700 rounded-md overflow-hidden">
        <div
          className={`absolute h-full transition-all duration-700 ease-out ${
            mode === "progress"
              ? isOverPlanned
                ? "bg-gradient-to-r from-red-500 to-red-600"
                : "bg-[#00FF00]"
              : isOverCapacity
                ? "bg-gradient-to-r from-red-500 to-red-600"
                : "bg-[#00FF00]"
          }`}
          style={{ width: `${animatedWidth}%` }}
        />
      </div>

      {/* Labels */}
      <div className="flex items-center justify-between mt-2 text-xs">
        {mode === "progress" ? (
          <>
            <span className="text-gray-400">
              Planned: <span className="text-white">{formatDuration(totalPlanned)}</span>
            </span>
            <span className="text-gray-400">
              In progress: <span className="text-white">{formatDuration(totalProgress - totalCompleted)}</span>
            </span>
            <span className="text-gray-400">
              Completed: <span className="text-white">{formatDuration(totalCompleted)}</span>
            </span>
          </>
        ) : (
          <>
            <span className="text-gray-400">
              Planned: <span className="text-white">{formatDuration(totalPlanned)}</span>
            </span>
            <span className="text-gray-400">
              Capacity: <span className="text-white">{formatDuration(totalCapacity)}</span>
            </span>
            <span className="text-gray-400">
              Completed: <span className="text-white">{formatDuration(totalCompleted)}</span>
            </span>
          </>
        )}
      </div>
    </div>
  );
};
