"use client";

import { useOnboardingContext } from "@/hooks/context/OnboardingProvider";
import { useStepTracking } from "@/hooks/useStepTracking";
import { useEffect, useRef, useState } from "react";
import { useOnboardingBraindumpStore } from "@/stores/onboardingBraindumpStore";
import { identify, setUserProperties } from "@/lib/mixpanel";
import { v4 as uuidv4 } from "uuid";

export default function YourNamePage() {
  const [name, setName] = useState("");
  const { trackLandingViewed } = useStepTracking();
  const { setHandleNext, setCurrentQuestion, setCurrentAnswer, trackStepCompleted } = useOnboardingContext();
  const { data: storeData, setSessionId } = useOnboardingBraindumpStore();
  const slug = "your_name";

  const question = "What should we call you?";
  const subtitle = "First name is fine. This is how Vantum will talk to you.";

  const stateRef = useRef({ name, slug, trackStepCompleted });

  // Create session ID on first load
  useEffect(() => {
    if (!storeData.session_id) {
      const newSessionId = uuidv4();
      setSessionId(newSessionId);
      sessionStorage.removeItem("onboarding_seen_building_progress");

      setUserProperties({
        session_id: newSessionId,
        is_anonymous: true,
        session_started_at: new Date().toISOString(),
      });
    }
  }, [storeData.session_id, setSessionId]);

  // Always identify user in Mixpanel when page loads
  useEffect(() => {
    if (storeData.session_id) {
      identify(storeData.session_id);
    }
  }, [storeData.session_id]);

  // Track landing view when page loads
  useEffect(() => {
    trackLandingViewed({
      landing_variant: slug,
      message_type: "diagnostic",
    });
  }, [slug, trackLandingViewed]);

  // Set currentQuestion
  useEffect(() => {
    setCurrentQuestion(question);
    return () => setCurrentQuestion("");
  }, [setCurrentQuestion]);

  // Set currentAnswer when name changes
  useEffect(() => {
    setCurrentAnswer(name.trim() ? name.trim() : "");
  }, [name, setCurrentAnswer]);

  useEffect(() => {
    stateRef.current = { name, slug, trackStepCompleted };
  }, [name, slug, trackStepCompleted]);

  useEffect(() => {
    const isValid = name.trim().length > 0;

    if (!isValid) {
      setHandleNext(null);
      return;
    }

    const handler = async () => {
      const current = stateRef.current;
      if (!current.name.trim()) return;
      current.trackStepCompleted(current.slug, 1, current.name.trim());
    };
    setHandleNext(() => handler);
    return () => setHandleNext(null);
  }, [name, setHandleNext]);

  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
      <h1 className="text-[28px] sm:text-3xl md:text-4xl lg:text-[42px] font-bold mb-2 sm:mb-4">
        {question}
      </h1>
      <p className="text-sm text-secondary-foreground mb-6 sm:mb-10">{subtitle}</p>

      <textarea
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="e.g. Sarah"
        className="w-full h-32 sm:h-40 bg-card border-2 border-border rounded-2xl p-4 sm:p-6 text-sm sm:text-base resize-none focus:outline-none focus:border-primary transition-colors placeholder:text-muted-foreground"
        autoFocus
      />
    </div>
  );
}
