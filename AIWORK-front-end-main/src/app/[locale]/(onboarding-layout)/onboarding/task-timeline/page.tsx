"use client";

import { useState, useEffect, useRef } from "react";
import { useOnboardingContext } from "@/hooks/context/OnboardingProvider";
import { useStepTracking } from "@/hooks/useStepTracking";

const QUESTION = "We're about to help you curate your tasks.\nWhen do you need them done?";

const OPTIONS = [
  { id: "today", label: "Today" },
  { id: "in_a_few_days", label: "In a few days" },
  { id: "within_a_week", label: "Within a week" },
];

export default function TaskTimelinePage() {
  const [selected, setSelected] = useState<string | null>(null);
  const slug = "task-timeline";
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
      current.trackStepCompleted(current.slug, 11, current.selected);
    };
    setHandleNext(() => handler);
    return () => setHandleNext(null);
  }, [selected, setHandleNext]);

  return (
    <div className="flex-1 flex flex-col items-center justify-center min-h-0 mb-8 md:mb-18">
      <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-center leading-tight">
        We&rsquo;re about to help you curate your tasks.
        <br />
        When do you need them done?
      </h1>

      <div className="w-full max-w-150 mx-auto mt-6 sm:mt-8 mb-10 sm:mb-14">
        <div className="h-px bg-foreground" />
      </div>

      <div className="grid grid-cols-3 gap-3 sm:gap-4 w-full max-w-[1100px]">
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
  );
}
