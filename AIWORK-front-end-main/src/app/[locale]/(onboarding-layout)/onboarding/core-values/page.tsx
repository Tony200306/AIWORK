"use client";

import { useState, useEffect, useRef } from "react";
import { useOnboardingContext } from "@/hooks/context/OnboardingProvider";
import { useStepTracking } from "@/hooks/useStepTracking";
import {
  Handshake,
  Goal,
  Baby,
  BicepsFlexed,
  DollarSign,
  Puzzle,
  ShieldHalf,
  Sparkles,
} from "lucide-react";

const QUESTION = "Pick the 3 things that matter most to how you work and live.";
const SUBTITLE = "These shape how Vantum protects your time. No wrong answers.";
const MAX_SELECTIONS = 3;

type ValueOption = {
  id: string;
  title: string;
  icon: React.ElementType;
};

const OPTIONS: ValueOption[] = [
  { id: "client_trust", title: "Client Trust", icon: Handshake },
  { id: "deep_work", title: "Deep Work", icon: Goal },
  { id: "family", title: "Family", icon: Baby },
  { id: "health", title: "Health", icon: BicepsFlexed },
  { id: "financial_independence", title: "Financial Independence", icon: DollarSign },
  { id: "strategic_impact", title: "Strategic Impact", icon: Puzzle },
  { id: "autonomy", title: "Autonomy", icon: ShieldHalf },
  { id: "craft", title: "Craft", icon: Sparkles },
];

export default function CoreValuesPage() {
  const [selected, setSelected] = useState<string[]>([]);
  const slug = "core-values";
  const { setHandleNext, setCurrentQuestion, setCurrentAnswer, trackStepCompleted } = useOnboardingContext();
  const { trackLandingViewed } = useStepTracking();

  const stateRef = useRef({ selected, slug, trackStepCompleted });

  useEffect(() => {
    stateRef.current = { selected, slug, trackStepCompleted };
  }, [selected, slug, trackStepCompleted]);

  const toggleOption = (id: string) => {
    setSelected((prev) => {
      if (prev.includes(id)) return prev.filter((s) => s !== id);
      if (prev.length >= MAX_SELECTIONS) return prev;
      return [...prev, id];
    });
  };

  useEffect(() => {
    trackLandingViewed({ landing_variant: slug, message_type: "diagnostic" });
  }, [slug, trackLandingViewed]);

  useEffect(() => {
    setCurrentQuestion(QUESTION);
    return () => setCurrentQuestion("");
  }, [setCurrentQuestion]);

  useEffect(() => {
    const labels = selected.map((id) => OPTIONS.find((o) => o.id === id)?.title || id);
    setCurrentAnswer(labels.join(", "));
  }, [selected, setCurrentAnswer]);

  useEffect(() => {
    if (selected.length < MAX_SELECTIONS) {
      setHandleNext(null);
      return;
    }

    const handler = async () => {
      const current = stateRef.current;
      current.trackStepCompleted(current.slug, 6, current.selected);
    };
    setHandleNext(() => handler);
    return () => setHandleNext(null);
  }, [selected.length, setHandleNext]);

  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
      <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
        {QUESTION}
      </h1>
      <p className="text-sm sm:text-base text-secondary-foreground mb-8 sm:mb-12">
        {SUBTITLE}
      </p>

      <div className="overflow-auto min-h-0 flex-1 scrollbar-hide">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
          {OPTIONS.map((option) => {
            const isSelected = selected.includes(option.id);
            const isDisabled = !isSelected && selected.length >= MAX_SELECTIONS;
            const Icon = option.icon;

            return (
              <div
                key={option.id}
                onClick={() => !isDisabled && toggleOption(option.id)}
                className={`relative border-2 rounded-2xl p-4 sm:p-6 transition-colors flex flex-col items-center justify-center text-center gap-3 min-h-[140px] sm:min-h-[160px] ${
                  isDisabled
                    ? "opacity-50 cursor-not-allowed"
                    : "cursor-pointer"
                } ${
                  isSelected
                    ? "bg-secondary border-chart-2"
                    : "bg-card border-border hover:border-chart-2/50"
                }`}
              >
                {/* Checkbox */}
                <div className="absolute top-3 right-3">
                  <div
                    className={`w-4 h-4 sm:w-5 sm:h-5 rounded border-2 flex items-center justify-center transition-colors ${
                      isSelected
                        ? "border-chart-2 bg-chart-2"
                        : "border-muted-foreground"
                    }`}
                  >
                    {isSelected && (
                      <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                        <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </div>
                </div>

                <Icon className="w-8 h-8 sm:w-10 sm:h-10" />
                <p className="text-xs sm:text-sm font-medium">{option.title}</p>
              </div>
            );
          })}
        </div>
      </div>

      {selected.length > 0 && (
        <div className="text-center text-sm text-muted-foreground pt-6">
          <span className="text-chart-2 font-semibold">{selected.length} of {MAX_SELECTIONS}</span>
          {" selected \u2022 These influence 10% of your task scoring"}
        </div>
      )}
    </div>
  );
}
