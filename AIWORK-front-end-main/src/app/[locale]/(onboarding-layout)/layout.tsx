"use client";

import { ArrowBackIcon } from "@/components/icon/ArrowBackIcon";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { RouteConfig } from "@/constants/RouteConfig";
import {
  OnboardingProvider,
  useOnboardingContext,
} from "@/hooks/context/OnboardingProvider";
import { useOnboardingBraindumpStore } from "@/stores/onboardingBraindumpStore";
import { useExtractProfile } from "@/hooks/shared/onboarding/useExtractProfile";
import { buildExtractProfilePayload } from "@/utils/buildExtractProfilePayload";
import { ArrowRight } from "lucide-react";
import { useTheme } from "next-themes";
import { usePathname, useRouter } from "next/navigation";
import { BuildingProfileProgress } from "@/components/shared/BuildingProfileProgress";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useOnboardingFlowRedirect } from "@/utils/onboardingFlowRedirect";

const onboardingSteps = [
  { path: "/onboarding/your-name", label: "Your Name", index: 1 },
  { path: "/onboarding/primary-role", label: "Primary Role", index: 2 },
  { path: "/onboarding/weekly-hours", label: "Weekly Hours", index: 3 },
  { path: "/onboarding/task-sources", label: "Task Sources", index: 4 },
  { path: "/onboarding/quarterly-goal", label: "Quarterly Goal", index: 5 },
  { path: "/onboarding/core-values", label: "Core Values", index: 6 },
  { path: "/onboarding/top-client", label: "Top Client", index: 7 },
  { path: "/onboarding/client-health", label: "Client Health", index: 8 },
  { path: "/onboarding/client-goal", label: "Client Goal", index: 9 },
  { path: "/onboarding/client-revenue", label: "Client Revenue", index: 10 },
  { path: "/onboarding/task-timeline", label: "Task Timeline", index: 11 },
];

function OnboardingLayoutContent({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [showProgress, setShowProgress] = useState(false);
  const { handleNext: childHandleNext, currentQuestion, currentAnswer } = useOnboardingContext();
  const { addQuestion } = useOnboardingBraindumpStore();
  const { mutate: extractProfile } = useExtractProfile();
  const { handleRedirect } = useOnboardingFlowRedirect();

  const orderedSteps = useMemo(
    () => [...onboardingSteps].sort((a, b) => a.index - b.index),
    []
  );

  const currentStepIndex = orderedSteps.findIndex((step) =>
    pathname.includes(step.path)
  );

  useEffect(() => {
    setMounted(true);
  }, []);

  // Reset showProgress when navigating back to onboarding steps
  useEffect(() => {
    if (currentStepIndex >= 0) {
      setShowProgress(false);
    }
  }, [currentStepIndex]);

  const canGoBack = currentStepIndex > 0;

  const handleBack = useCallback(() => {
    if (currentStepIndex > 0) {
      router.push(orderedSteps[currentStepIndex - 1].path);
    }
  }, [currentStepIndex, orderedSteps, router]);

  const handleNext = useCallback(async () => {
    if (childHandleNext) {
      await childHandleNext();
    }

    if (currentQuestion && currentAnswer) {
      const currentStep = orderedSteps[currentStepIndex];
      const slug = currentStep?.path.split("/").pop() || "";
      addQuestion({
        slug,
        question: currentQuestion,
        answer: currentAnswer,
      });
    }

    if (currentStepIndex === orderedSteps.length - 1) {
      const latestQuestions = useOnboardingBraindumpStore.getState().data.questions;
      const payload = buildExtractProfilePayload(latestQuestions);
      extractProfile(payload);
      setShowProgress(true);
      return;
    }
    if (currentStepIndex >= 0) {
      router.push(orderedSteps[currentStepIndex + 1].path);
    }
  }, [childHandleNext, currentStepIndex, orderedSteps, router, currentQuestion, currentAnswer, addQuestion]);
  useEffect(() => {
    if (  theme !==  "dark" && theme !==  "light") {
      setTheme("dark");
    }
  }, []);
  const toggleTheme =useCallback( () => {
    setTheme(theme === "dark" ? "light" : "dark");
  }, [ setTheme ,theme]);
  const handleProgressComplete = () => {
    sessionStorage.setItem("onboarding_seen_building_progress", "true");
    handleRedirect();
  };

  // Only show BuildingProfileProgress if we're in onboarding steps, not in brain-dump/email-collector/capacity-report
  const shouldShowProgress = showProgress && currentStepIndex >= 0;

  if (shouldShowProgress) {
    return (
      <div className="h-screen flex flex-col bg-background">
        <BuildingProfileProgress
          duration={5000}
          onComplete={handleProgressComplete}
        />
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col  bg-background">
      {/* Header with minimized progress bar for mobile */}
      {!pathname.includes(RouteConfig.OnboardingBrainDump.path) &&
        !pathname.includes(RouteConfig.OnboardingEmailCollector.path) &&
        !pathname.includes(RouteConfig.OnboardingCapacityReport.path) && (
          <div className="pt-4 sm:pt-6 md:mt-15 px-4 sm:px-0 flex flex-row justify-between items-center gap-2 sm:gap-4 w-full onboarding-container">
            {/* Minimized progress bar */}
            <div className="flex-1">
              <p className="text-xs sm:text-sm text-muted-foreground mb-1.5">You're doing Great!</p>
              <div className="flex items-center gap-1 sm:gap-2">
                {orderedSteps?.map((step, index) => (
                  <div
                    key={step.path}
                    className={`h-1 sm:h-1.5 flex-1 rounded-full transition-all duration-300 ${
                      index <= currentStepIndex ? "bg-primary" : "bg-secondary"
                    }`}
                  />
                ))}
              </div>
            </div>
            {mounted && (
              <Switch
                isDayNightMode={true}
                checked={theme === "dark"}
                onCheckedChange={toggleTheme}
                aria-label="Toggle theme"
                className="w-14 h-7 sm:w-20 sm:h-10 shrink-0"
                thumbClassName="w-6 h-6 sm:w-10 sm:h-9"
              />
            )}
          </div>
        )}
      {/* Main content */}
      <div className="flex-1 min-h-0 flex flex-col mt-6 sm:mt-8 md:mt-16 pb-[76px] sm:pb-[84px]">
        <div className="w-full px-4 sm:px-0 onboarding-container flex-1 min-h-0 flex flex-col">
          {children}
        </div>
      </div>
      {/* Navigation buttons - Fixed at bottom, 60px height on mobile */}
      {!pathname.includes(RouteConfig.OnboardingBrainDump.path) &&
        !pathname.includes(RouteConfig.OnboardingEmailCollector.path) &&
        !pathname.includes(RouteConfig.OnboardingCapacityReport.path) && (
          <div className="fixed bottom-0 left-0 right-0 h-[60px] sm:h-[68px] flex items-center px-4 z-50 bg-background border-t border-border/50">
            <div className="w-full onboarding-container flex items-center justify-end">
              <div className="flex justify-end items-center gap-2 sm:gap-3 w-full">
                <Button
                  variant="outline"
                  size="default"
                  onClick={handleBack}
                  disabled={!canGoBack}
                  className="rounded-xl text-sm px-4 h-10 sm:h-11"
                >
                  <ArrowBackIcon/>
                  Back
                </Button>

                <Button
                  variant="default"
                  size="default"
                  onClick={handleNext}
                  disabled={!childHandleNext}
                  className="rounded-xl text-sm px-4 h-10 sm:h-11 bg-chart-2"
                >
                  Next
                  <ArrowRight className="w-4 h-4 ml-1.5" />
                </Button>
              </div>
            </div>
          </div>
        )}
    </div>
  );
}

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <OnboardingProvider>
      <OnboardingLayoutContent>{children}</OnboardingLayoutContent>
    </OnboardingProvider>
  );
}
