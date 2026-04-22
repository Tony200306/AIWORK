"use client";

import { useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { RouteConfig, ONBOARDING_FLOW_KEYS } from "@/constants/RouteConfig";
import { setSessionStorageFlowKey, clearSessionStorageFlowKey } from "@/utils/onboardingFlowRedirect";

export function FlowParameterHandler() {
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const flow = searchParams.get("flow");

    // Check if user arrived from Vantum website CTA
    if (flow === "vantum-cta") {
      // clearSessionStorageFlowKey(); // Remove any existing flow keys (including home-landing-page) - DISABLED: preserve flow keys
      setSessionStorageFlowKey(ONBOARDING_FLOW_KEYS.GET_VANTUM_LANDING_PAGE);
      router.push(RouteConfig.YourNamePage.path);
    }
  }, [searchParams, router]);

  return null;
}
