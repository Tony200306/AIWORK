import { useEffect, useState } from "react";
import { formatTimeFromMinutes as formatDuration } from "@/utils/formatTimeDisplay";

interface PlannedBarProps {
  totalCapacity?: number;
  totalPlanned?: number;
  durationLabel?: string;
}

export const PlannedBar = ({
  totalCapacity = 480,
  totalPlanned = 360,
  durationLabel = "Today",
}: PlannedBarProps) => {
  const [animatedWidth, setAnimatedWidth] = useState(0);

  const percentage = totalCapacity > 0 ? Math.round((totalPlanned / totalCapacity) * 100) : 0;
  const freeTime = totalCapacity - totalPlanned;
  const isOverCapacity = percentage > 100;
  const targetWidth = Math.min(percentage, 100);

  useEffect(() => {
    // Small delay to ensure the component is mounted before animating
    const timer = setTimeout(() => {
      setAnimatedWidth(targetWidth);
    }, 100);

    return () => clearTimeout(timer);
  }, [targetWidth]);

  return (
    <div className="w-full max-w-[1600px] mx-auto px-6 py-4">
      {/* Header */}
      <div className="text-center mb-2">
        <h2 className="text-xl font-semibold text-white mb-1">
          {durationLabel} plan {isOverCapacity ? "exceeds capacity" : "fits"} - {percentage}% planned
        </h2>
        <p className={`text-sm ${isOverCapacity ? "text-red-400" : "text-green-400"}`}>
          {isOverCapacity
            ? `You're over capacity by ${formatDuration(Math.abs(freeTime))}. Consider reducing tasks.`
            : `You've got about ${formatDuration(freeTime)} free. You can commit.`
          }
        </p>
      </div>

      {/* Progress Bar */}
      <div className="relative mb-3 ">
        <div className="relative w-full h-8 bg-gray-700/50 rounded-lg overflow-hidden">
          <div
            className={`absolute h-full transition-all duration-700 ease-out rounded-lg ${
              isOverCapacity
                ? "bg-gradient-to-r from-red-500 to-red-600"
                : "bg-[#008000]"
            }`}
            style={{ width: `${animatedWidth}%` }}
          ></div>
        </div>
        <div className="absolute -top-8 right-0 text-xs text-foreground bg-gray-800/80 px-3 py-1 rounded-md">
          {formatDuration(totalCapacity)} cap • {formatDuration(totalPlanned)}{" "}
          planned
        </div>
      </div>

      {/* Footer Text */}
    </div>
  );
};
