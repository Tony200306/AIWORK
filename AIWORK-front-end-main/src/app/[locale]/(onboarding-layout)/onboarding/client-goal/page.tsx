"use client";

import { useState, useEffect, useRef } from "react";
import { useOnboardingContext } from "@/hooks/context/OnboardingProvider";
import { useStepTracking } from "@/hooks/useStepTracking";
import { useOnboardingBraindumpStore } from "@/stores/onboardingBraindumpStore";

const SUBTITLE = 'The strategic outcome, not the task list. What would make them say \u201Cthis was a great quarter\u201D?';
const PLACEHOLDER = "e.g. Rebuild their go-to-market pipeline and hit 50 qualified leads by June.";

export default function ClientGoalPage() {
  const [textValue, setTextValue] = useState("");
  const slug = "client-goal";
  const { setHandleNext, setCurrentQuestion, setCurrentAnswer, trackStepCompleted } = useOnboardingContext();
  const { trackLandingViewed } = useStepTracking();
  const { data } = useOnboardingBraindumpStore();

  // Get client name from the top-client answer
  const clientName = data.questions.find(q => q.slug === "top-client")?.answer || "your client";

  const question = `What are you trying to achieve for ${clientName} this quarter?`;

  const stateRef = useRef({ textValue, slug, trackStepCompleted });

  useEffect(() => {
    stateRef.current = { textValue, slug, trackStepCompleted };
  }, [textValue, slug, trackStepCompleted]);

  useEffect(() => {
    trackLandingViewed({ landing_variant: slug, message_type: "diagnostic" });
  }, [slug, trackLandingViewed]);

  useEffect(() => {
    setCurrentQuestion(question);
    return () => setCurrentQuestion("");
  }, [question, setCurrentQuestion]);

  useEffect(() => {
    setCurrentAnswer(textValue);
  }, [textValue, setCurrentAnswer]);

  useEffect(() => {
    const handler = async () => {
      const current = stateRef.current;
      current.trackStepCompleted(current.slug, 9, current.textValue);
    };
    setHandleNext(() => handler);
    return () => setHandleNext(null);
  }, [setHandleNext]);

  return (
    <div className="flex-1 flex flex-col min-h-0 mb-8 md:mb-18">
      <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
        What are you trying to achieve for{" "}
        <span className="text-chart-3">{clientName}</span>{" "}
        this quarter?
      </h1>
      <p className="text-sm sm:text-base text-secondary-foreground mb-10 sm:mb-16">
        {SUBTITLE}
      </p>

      <div className="flex-1 min-h-0 flex flex-col">
        <textarea
          value={textValue}
          onChange={(e) => setTextValue(e.target.value)}
          placeholder={PLACEHOLDER}
          className="flex-1 w-full bg-card border-2 border-border rounded-2xl p-6 text-base resize-none focus:outline-none focus:border-primary transition-colors placeholder:text-muted-foreground/50"
        />
      </div>
    </div>
  );
}
