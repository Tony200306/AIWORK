"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useStepTracking } from "@/hooks/useStepTracking";
import { getSessionTrackingProps } from "@/utils/utm";

const SESSION_TRACKED_KEY = "vantum_session_tracked";

/**
 * Default onboarding entry: tracks session start and redirects to first question
 */
export default function OnboardingIndexPage({
  params,
}: {
  params: { locale: string };
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { trackSessionStarted } = useStepTracking();

  useEffect(() => {
    const hasTrackedSession = sessionStorage.getItem(SESSION_TRACKED_KEY);

    if (!hasTrackedSession) {
      const trackingProps = getSessionTrackingProps(searchParams);
      trackSessionStarted(trackingProps);

      sessionStorage.setItem(SESSION_TRACKED_KEY, "true");
    }

    router.replace(`/onboarding/your-name`);
  }, [router, searchParams, trackSessionStarted]);

  return null;
}

