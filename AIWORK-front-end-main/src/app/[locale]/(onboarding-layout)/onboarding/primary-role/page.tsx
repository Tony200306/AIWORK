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

const QUESTION = "Which role are you primarily playing right now?";

const OPTIONS: Option[] = [
  { id: 1, title: "Fractional CTO/ Engineering", value: "fractional_cto_engineering" },
  { id: 2, title: "Fractional CFO/ Finance", value: "fractional_cfo_finance" },
  { id: 3, title: "Fractional CMO/ Growth", value: "fractional_cmo_growth" },
  { id: 4, title: "Fractional CRP/Sales", value: "fractional_crp_sales" },
  { id: 5, title: "Other", value: "other" },
];

// --- Helpers ---
const isOtherOption = (option: Option | undefined): boolean => {
  if (!option) return false;
  return option.value === "other";
};

// --- Component ---
export default function PrimaryRolePage() {
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [customValue, setCustomValue] = useState<string>("");
  const { trackLandingViewed } = useStepTracking();
  const { setHandleNext, setCurrentQuestion, setCurrentAnswer, trackStepCompleted } = useOnboardingContext();
  const slug = "primary_role";

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
      if (isOtherOption(selected) && customValue) {
        setCurrentAnswer(`Other: ${customValue}`);
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
    const isOther = selectedOpt && isOtherOption(selectedOpt);
    const isOtherValid = isOther ? customValue.trim() !== "" : true;
    const isValid = selectedOption !== null && isOtherValid;

    if (!isValid) {
      setHandleNext(null);
      return;
    }

    const handler = async () => {
      const current = stateRef.current;
      if (current.selectedOption === null) return;
      const selectedOpt = OPTIONS.find((opt) => opt.id === current.selectedOption);
      const value =
        isOtherOption(selectedOpt) && current.customValue
          ? current.customValue
          : selectedOpt?.value || String(current.selectedOption);
      current.trackStepCompleted(current.slug, 2, value);
    };
    setHandleNext(() => handler);
    return () => setHandleNext(null);
  }, [selectedOption, customValue, setHandleNext]);

  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
      <h1 className="text-[28px] sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-6 sm:mb-8">
        {QUESTION}
      </h1>

      <div className="overflow-auto min-h-0 flex-1 flex flex-col gap-3 sm:gap-4 scrollbar-hide">
        {OPTIONS.map((option) => {
          const isOther = isOtherOption(option);
          const isSelected = selectedOption === option.id;

          return (
            <div
              key={option.id}
              onClick={() => {
                setSelectedOption(option.id);
                if (!isOther) setCustomValue("");
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

              {isOther && isSelected && (
                <div
                  className="mt-3 ml-8 sm:ml-10"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Input
                    type="text"
                    placeholder="Please specify your role"
                    value={customValue}
                    onChange={(e) => setCustomValue(e.target.value)}
                    onFocus={(e) => e.stopPropagation()}
                    onClick={(e) => e.stopPropagation()}
                    onMouseDown={(e) => e.stopPropagation()}
                    className="bg-background h-10"
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
