"use client";

import { useState, useEffect, useRef } from "react";
import { useOnboardingContext } from "@/hooks/context/OnboardingProvider";
import { useStepTracking } from "@/hooks/useStepTracking";

const QUESTION = "Roughly what do they pay you monthly?";
const SUBTITLE = "This helps us weight their tasks against your other work. A range is fine.";

const OPTIONS = [
  { id: "under_3k", label: "Under $3k" },
  { id: "3k_7k", label: "$3k - $7k" },
  { id: "7k_12k", label: "$7k - $12k" },
  { id: "12k_plus", label: "$12k+" },
];

export default function ClientRevenuePage() {
  const [selected, setSelected] = useState<string | null>(null);
  const slug = "client-revenue";
  const { setHandleNext, setCurrentQuestion, setCurrentAnswer, trackStepCompleted } = useOnboardingContext();
  const { trackLandingViewed } = useStepTracking();

  const stateRef = useRef({ selected, slug, trackStepCompleted });

  useEffect(() => {
    stateRef.current = { selected, slug, trackStepCompleted };
  }, [selected, slug, trackStepCompleted]);

  useEffect(() => {
    trackLandingViewed({ landing_variant: slug, message_type: "diagnostic" });
  }, [slug, trackLandingViewed]);

  useEffect(() => {
    setCurrentQuestion(QUESTION);
    return () => setCurrentQuestion("");
  }, [setCurrentQuestion]);

  useEffect(() => {
    const option = OPTIONS.find((o) => o.id === selected);
    setCurrentAnswer(option?.label || "");
  }, [selected, setCurrentAnswer]);

  useEffect(() => {
    if (!selected) {
      setHandleNext(null);
      return;
    }

    const handler = async () => {
      const current = stateRef.current;
      current.trackStepCompleted(current.slug, 10, current.selected);
    };
    setHandleNext(() => handler);
    return () => setHandleNext(null);
  }, [selected, setHandleNext]);

  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
      <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
        {QUESTION}
      </h1>
      <p className="text-sm sm:text-base text-secondary-foreground mb-10 sm:mb-16">
        {SUBTITLE}
      </p>

      <div className="overflow-auto min-h-0 flex-1 scrollbar-hide">
        <div className="grid grid-cols-2 gap-3 sm:gap-4">
        {OPTIONS.map((option) => {
          const isSelected = selected === option.id;

          return (
            <div
              key={option.id}
              onClick={() => setSelected(option.id)}
              className={`rounded-2xl border-2 py-8 sm:py-10 text-center cursor-pointer transition-colors ${
                isSelected
                  ? "bg-card-foreground/10 border-chart-2"
                  : "bg-card border-border hover:border-chart-2/50"
              }`}
            >
              <p className="text-sm sm:text-base font-medium">{option.label}</p>
            </div>
          );
        })}
        </div>
      </div>
    </div>
  );
}
