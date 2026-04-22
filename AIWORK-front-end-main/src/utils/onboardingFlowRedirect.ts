import { RouteConfig, ONBOARDING_FLOW_KEYS } from "@/constants/RouteConfig";
import { useAuthStore } from "@/stores/authStore";
import { useGetLastSprintId } from "@/hooks/shared/useGetLastSprintId";
import { useRouter } from "next/navigation";

type SessionStorageKey = typeof ONBOARDING_FLOW_KEYS[keyof typeof ONBOARDING_FLOW_KEYS];

export const getSessionStorageFlowKey = (): SessionStorageKey | null => {
  if (typeof window === "undefined") return null;

  if (sessionStorage.getItem(ONBOARDING_FLOW_KEYS.GET_VANTUM_LANDING_PAGE)) {
    return ONBOARDING_FLOW_KEYS.GET_VANTUM_LANDING_PAGE;
  }

  if (sessionStorage.getItem(ONBOARDING_FLOW_KEYS.HOME_LANDING_PAGE)) {
    return ONBOARDING_FLOW_KEYS.HOME_LANDING_PAGE;
  }

  return null;
};

export const setSessionStorageFlowKey = (key: SessionStorageKey) => {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(key, "true");
};

export const clearSessionStorageFlowKey = () => {
  if (typeof window === "undefined") return;
  Object.values(ONBOARDING_FLOW_KEYS).forEach((key) => {
    sessionStorage.removeItem(key);
  });
};

export const useOnboardingFlowRedirect = () => {
  const router = useRouter();
  const { data: authStore } = useAuthStore();
  const token = authStore?.token;
  const isLoggedIn = !!token?.accessToken;

  const { data: lastSprintData, isLoading: isLastSprintLoading } = useGetLastSprintId();

  const handleRedirect = async () => {
    const currentFlowKey = getSessionStorageFlowKey();

    // Flow 1: Home landing page → Onboarding Brain Dump
    if (currentFlowKey === ONBOARDING_FLOW_KEYS.HOME_LANDING_PAGE) {
      // clearSessionStorageFlowKey(); // DISABLED: preserve flow keys
      router.push(RouteConfig.OnboardingBrainDump.path);
      return;
    }

    // Flow 2: Get Vantum landing page
    if (currentFlowKey === ONBOARDING_FLOW_KEYS.GET_VANTUM_LANDING_PAGE) {
      // Not logged in → go to login (don't clear flow key yet, will be cleared after login success)
      if (!isLoggedIn) {
        router.push(RouteConfig.LoginPage.path);
        return;
      }

      // Logged in → clear flow key and continue
      // clearSessionStorageFlowKey(); // DISABLED: preserve flow keys - will be cleared in login success handler

      // Logged in → check for last sprint
      if (isLastSprintLoading) {
        return; // Wait for data to load
      }

      const sprintData = lastSprintData?.data;

      // No sprint data → go to braindump
      if (!sprintData) {
        router.push(RouteConfig.BrainDumpPage.path);
        return;
      }

      // Sprint exists
      const { id, isActive } = sprintData;

      if (isActive) {
        // Active sprint → go to master kanban
        router.push(RouteConfig.MasterKanBan.getPath(id));
      } else {
        // Completed sprint → go to sprint complete
        router.push(RouteConfig.SprintComplete.getPath(id));
      }

      return;
    }

    // Default: go to onboarding brain dump
    router.push(RouteConfig.OnboardingBrainDump.path);
  };

  return {
    handleRedirect,
    isLoading: isLastSprintLoading,
    setSessionStorageFlowKey,
    clearSessionStorageFlowKey,
    getSessionStorageFlowKey,
  };
};
