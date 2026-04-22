"use client";

import { useEffect, useState, useCallback } from "react";
import { Check, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProgressStep {
  id: string;
  text: string;
  type: "check" | "sparkle";
}

const PROGRESS_STEPS: ProgressStep[] = [
  { id: "capacity", text: "Understand your capacity", type: "check" },
  { id: "mapping", text: "Mapping how you work", type: "check" },
  { id: "obligations", text: "Identifying hidden obligations", type: "check" },
  { id: "tasks", text: "Curating personalized tasks", type: "check" },
  { id: "pattern", text: "Detected pattern: Operator under pressure", type: "sparkle" },
];

interface BuildingProfileProgressProps {
  onComplete?: () => void;
  duration?: number; // Total duration in ms (default 5000)
}

export function BuildingProfileProgress({
  onComplete,
  duration = 5000,
}: BuildingProfileProgressProps) {
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());
  const [progress, setProgress] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  const stepInterval = duration / (PROGRESS_STEPS.length + 1);

  const handleComplete = useCallback(() => {
    if (onComplete && !isComplete) {
      setIsComplete(true);
      // Small delay before calling onComplete to let the final state render
      setTimeout(onComplete, 300);
    }
  }, [onComplete, isComplete]);

  useEffect(() => {
    // Progress animation
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + 1;
      });
    }, duration / 100);

    // Step completion animation
    PROGRESS_STEPS.forEach((step, index) => {
      setTimeout(() => {
        setCompletedSteps((prev) => new Set([...prev, step.id]));
      }, stepInterval * (index + 1));
    });

    // Trigger completion callback
    const completeTimeout = setTimeout(() => {
      handleComplete();
    }, duration + 500);

    return () => {
      clearInterval(progressInterval);
      clearTimeout(completeTimeout);
    };
  }, [duration, stepInterval, handleComplete]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-4">
      {/* Heading */}
      <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-center mb-8 md:mb-12">
        We're building your profile...
      </h1>

      {/* Progress Card */}
      <div className="w-full max-w-[600px] bg-popover-foreground rounded-2xl p-6 md:p-8">
        <div className="flex flex-col md:flex-row gap-6 md:gap-8">
          {/* Left - Steps */}
          <div className="flex-1 space-y-4">
            {PROGRESS_STEPS?.map((step) => {
              const isCompleted = completedSteps.has(step.id);
              const isActive =
                !isCompleted &&
                Array.from(completedSteps).length ===
                  PROGRESS_STEPS.findIndex((s) => s.id === step.id);

              return (
                <div
                  key={step.id}
                  className={cn(
                    "flex items-center gap-3 transition-all duration-300",
                    isCompleted
                      ? "text-white"
                      : isActive
                        ? "text-white"
                        : "text-muted-foreground"
                  )}
                >
                  {/* Icon */}
                  <div
                    className={cn(
                      "w-5 h-5 flex items-center justify-center shrink-0 transition-all duration-300",
                      step.type === "sparkle" && "text-amber-400"
                    )}
                  >
                    {step.type === "check" ? (
                      isCompleted ? (
                        <div className="w-5 h-5 rounded-full border-2 border-white flex items-center justify-center">
                          <Check className="w-3 h-3" />
                        </div>
                      ) : (
                        <div
                          className={cn(
                            "w-5 h-5 rounded-full border-2",
                            isActive
                              ? "border-white animate-pulse"
                              : "border-muted-foreground"
                          )}
                        />
                      )
                    ) : (
                      <Sparkles
                        className={cn(
                          "w-5 h-5",
                          isCompleted && "animate-pulse text-amber-400"
                        )}
                      />
                    )}
                  </div>

                  {/* Text */}
                  <span
                    className={cn(
                      "text-sm md:text-base transition-all duration-300",
                      isCompleted && "font-medium"
                    )}
                  >
                    {step.text}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Right - Circular Progress */}
          <div className="flex items-center justify-center md:justify-end">
            <div className="relative w-32 h-32 md:w-40 md:h-40">
              {/* SVG Progress Circle */}
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                {/* Background circle */}
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="none"
                  className="text-muted-foreground/20"
                />
                {/* Progress circle */}
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="none"
                  strokeLinecap="round"
                  className="text-white transition-all duration-100"
                  strokeDasharray={`${progress * 2.64} 264`}
                />
              </svg>

              {/* Center text */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-xs md:text-sm text-muted-foreground">
                  Working...
                </span>
                <span className="text-2xl md:text-3xl font-bold">{progress}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-border mt-6 pt-4">
          <p className="text-muted-foreground text-sm">
            Don't worry profile isn't locked in. You can adjust later
          </p>
        </div>
      </div>
    </div>
  );
}

export default BuildingProfileProgress;
