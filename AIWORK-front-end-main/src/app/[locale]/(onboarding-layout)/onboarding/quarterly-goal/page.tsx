"use client";

import { useState, useEffect, useRef } from "react";
import { useOnboardingContext } from "@/hooks/context/OnboardingProvider";
import { useStepTracking } from "@/hooks/useStepTracking";

const QUESTION = "What\u2019s the #1 goal for your business this quarter?";
const SUBTITLE = "Not a client\u2019s goal - yours. The thing that keeps getting pushed aside. This is what Vantum will protect.";
const PLACEHOLDER = "e.g. Launch my advisory service website and get 3 paying clients by end of Q2";

export default function QuarterlyGoalPage() {
  const [textValue, setTextValue] = useState("");
  const slug = "quarterly-goal";
  const { setHandleNext, setCurrentQuestion, setCurrentAnswer, trackStepCompleted } = useOnboardingContext();
  const { trackLandingViewed } = useStepTracking();

  const stateRef = useRef({ textValue, slug, trackStepCompleted });

  useEffect(() => {
    stateRef.current = { textValue, slug, trackStepCompleted };
  }, [textValue, slug, trackStepCompleted]);

  useEffect(() => {
    trackLandingViewed({ landing_variant: slug, message_type: "diagnostic" });
  }, [slug, trackLandingViewed]);

  useEffect(() => {
    setCurrentQuestion(QUESTION);
    return () => setCurrentQuestion("");
  }, [setCurrentQuestion]);

  useEffect(() => {
    setCurrentAnswer(textValue);
  }, [textValue, setCurrentAnswer]);

  useEffect(() => {
    const handler = async () => {
      const current = stateRef.current;
      current.trackStepCompleted(current.slug, 5, current.textValue);
    };
    setHandleNext(() => handler);
    return () => setHandleNext(null);
  }, [setHandleNext]);

  return (
    <div className="flex-1 flex flex-col min-h-0 mb-8 md:mb-18">
      <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
        {QUESTION}
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
