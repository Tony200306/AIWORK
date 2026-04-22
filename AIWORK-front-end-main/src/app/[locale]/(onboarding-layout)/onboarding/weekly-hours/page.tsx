"use client";

import { useOnboardingContext } from "@/hooks/context/OnboardingProvider";
import { useStepTracking } from "@/hooks/useStepTracking";
import { useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/input";

// --- Data ---
type Option = {
  id: number;
  title: string;
  description?: string;
  value: string;
};

const QUESTION = "How many hours a week do you want to work?";
const SUBTITLE = "Be honest, not aspirational. We'll use this to plan what actually fits.";

const OPTIONS: Option[] = [
  { id: 1, title: "8 hours", description: "~1 focused day", value: "8" },
  { id: 2, title: "24 hours", description: "~3 focused day", value: "24" },
  { id: 3, title: "32 hours", description: "~4 focused days \u2022 Most common for 3-4 clients", value: "32" },
  { id: 4, title: "40 hours", description: "Full week", value: "40" },
  { id: 5, title: "Custom", description: "Set your own number", value: "custom" },
];

// --- Helpers ---
const isCustomOption = (option: Option | undefined): boolean => {
  if (!option) return false;
  return option.value === "custom";
};

// --- Component ---
export default function WeeklyHoursPage() {
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [customValue, setCustomValue] = useState<string>("");
  const { trackLandingViewed } = useStepTracking();
  const { setHandleNext, setCurrentQuestion, setCurrentAnswer, trackStepCompleted } = useOnboardingContext();
  const slug = "weekly_hours";

  const stateRef = useRef({ selectedOption, customValue, slug, trackStepCompleted });

  useEffect(() => {
    stateRef.current = { selectedOption, customValue, slug, trackStepCompleted };
  }, [selectedOption, customValue, slug, trackStepCompleted]);

  // Track landing view
  useEffect(() => {
    trackLandingViewed({ landing_variant: slug, message_type: "diagnostic" });
  }, [slug, trackLandingViewed]);

  // Set currentQuestion
  useEffect(() => {
    setCurrentQuestion(QUESTION);
    return () => setCurrentQuestion("");
  }, [setCurrentQuestion]);

  // Set currentAnswer
  useEffect(() => {
    if (selectedOption !== null) {
      const selected = OPTIONS.find((opt) => opt.id === selectedOption);
      if (isCustomOption(selected) && customValue) {
        setCurrentAnswer(`${customValue} hours`);
      } else {
        setCurrentAnswer(selected?.title || String(selectedOption));
      }
    } else {
      setCurrentAnswer("");
    }
  }, [selectedOption, customValue, setCurrentAnswer]);

  // Validation & handleNext
  useEffect(() => {
    const selectedOpt = OPTIONS.find((opt) => opt.id === selectedOption);
    const isCustom = selectedOpt && isCustomOption(selectedOpt);
    const isCustomValid = isCustom ? customValue.trim() !== "" && !isNaN(Number(customValue)) : true;
    const isValid = selectedOption !== null && isCustomValid;

    if (!isValid) {
      setHandleNext(null);
      return;
    }

    const handler = async () => {
      const current = stateRef.current;
      if (current.selectedOption === null) return;
      const selectedOpt = OPTIONS.find((opt) => opt.id === current.selectedOption);
      const value =
        isCustomOption(selectedOpt) && current.customValue
          ? current.customValue
          : selectedOpt?.value || String(current.selectedOption);
      current.trackStepCompleted(current.slug, 3, value);
    };
    setHandleNext(() => handler);
    return () => setHandleNext(null);
  }, [selectedOption, customValue, setHandleNext]);

  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
      <h1 className="text-[28px] sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-2 sm:mb-4">
        {QUESTION}
      </h1>
      <p className="text-sm text-secondary-foreground mb-6 sm:mb-10">{SUBTITLE}</p>

      <div className="overflow-auto min-h-0 flex-1 flex flex-col gap-3 sm:gap-4 scrollbar-hide">
        {OPTIONS.map((option) => {
          const isCustom = isCustomOption(option);
          const isSelected = selectedOption === option.id;

          return (
            <div
              key={option.id}
              onClick={() => {
                setSelectedOption(option.id);
                if (!isCustom) setCustomValue("");
              }}
              className={`bg-card border-2 rounded-2xl p-4 sm:p-6 transition-colors cursor-pointer ${
                isSelected
                  ? "border-chart-2"
                  : "border-border hover:border-chart-2/50"
              }`}
            >
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="flex-shrink-0">
                  <div
                    className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                      isSelected
                        ? "border-chart-2 bg-chart-2"
                        : "border-muted-foreground"
                    }`}
                  >
                    {isSelected && (
                      <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-white" />
                    )}
                  </div>
                </div>
                <div className="flex-1">
                  <p className="text-sm sm:text-base">{option.title}</p>
                  {option.description && (
                    <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                      {option.description}
                    </p>
                  )}
                </div>
              </div>

              {isCustom && isSelected && (
                <div
                  className="mt-3 ml-8 sm:ml-10"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Input
                    type="number"
                    placeholder="Enter hours per week"
                    value={customValue}
                    onChange={(e) => setCustomValue(e.target.value)}
                    onFocus={(e) => e.stopPropagation()}
                    onClick={(e) => e.stopPropagation()}
                    onMouseDown={(e) => e.stopPropagation()}
                    className="bg-background h-10"
                    min="1"
                    max="168"
                    autoFocus
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
