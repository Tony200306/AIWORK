"use client";

import { useState, useEffect, useRef } from "react";
import { useOnboardingContext } from "@/hooks/context/OnboardingProvider";
import { useStepTracking } from "@/hooks/useStepTracking";

const QUESTION = "How\u2019s the relationship with them right now?";
const SUBTITLE = "Be honest. This changes how urgently we treat their work.";

type HealthOption = {
  id: string;
  title: string;
  description: string;
  cssColor: string;
  titleColor: string;
};

const OPTIONS: HealthOption[] = [
  {
    id: "thriving",
    title: "Thriving",
    description: "Trust is high. They give you room.",
    cssColor: "var(--chart-2)",
    titleColor: "text-chart-2",
  },
  {
    id: "stable",
    title: "Stable",
    description: "Steady state. No red flags.",
    cssColor: "var(--chart-1)",
    titleColor: "text-chart-1",
  },
  {
    id: "under_pressure",
    title: "Under Pressure",
    description: "Tension building. Recent miss or slow responses.",
    cssColor: "#FFAD2E",
    titleColor: "text-[#FFAD2E]",
  },
  {
    id: "at_risk",
    title: "At Risk",
    description: "Escalation, churn risk, or critical period.",
    cssColor: "var(--destructive)",
    titleColor: "text-destructive",
  },
];

export default function ClientHealthPage() {
  const [selected, setSelected] = useState<string | null>(null);
  const slug = "client-health";
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
    setCurrentAnswer(option?.title || "");
  }, [selected, setCurrentAnswer]);

  useEffect(() => {
    if (!selected) {
      setHandleNext(null);
      return;
    }

    const handler = async () => {
      const current = stateRef.current;
      current.trackStepCompleted(current.slug, 8, current.selected);
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
        <div className="flex flex-col gap-4">
          {OPTIONS.map((option) => {
            const isSelected = selected === option.id;

            return (
              <div
                key={option.id}
                onClick={() => setSelected(option.id)}
                className={`group relative flex items-center gap-4 sm:gap-5 rounded-2xl border-2 transition-all cursor-pointer overflow-hidden ${
                  isSelected
                    ? "bg-card-foreground border-none"
                    : "bg-card border-border hover:border-border"
                }`}
              >
                {/* Color accent bar with fade gradient */}
                  <div
                  className={`absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl transition-opacity`}
                  style={{
                    backgroundColor: `${option.cssColor}`,
                  }}
                />

                
                <div
                  className={`absolute left-0.75 top-0 bottom-0 w-2 rounded-l-2xl transition-opacity ${
                    isSelected ? "opacity-100" : "opacity-30 group-hover:opacity-100"
                  }`}
                  style={{
                    background: isSelected
                      ? option.cssColor
                      : `linear-gradient(to right, ${option.cssColor}, transparent)`,
                  }}
                />

                {/* Radio button */}
                <div className="pl-6 sm:pl-8">
                  <div
                    className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                      isSelected
                        ? "border-accent bg-accent"
                        : "border-muted-foreground"
                    }`}
                  >
                    {isSelected && (
                      <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-white" />
                    )}
                  </div>
                </div>

                {/* Text */}
                <div className="py-5 sm:py-6 pr-6">
                  <p className={`text-sm sm:text-base font-semibold ${option.titleColor}`}>
                    {option.title}
                  </p>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                    {option.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
