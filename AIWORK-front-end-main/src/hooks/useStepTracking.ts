import { track } from "@/lib/mixpanel";
import { STEP_ID_MAP } from "@/models/OBPagesMapping";

/**
 * Formats value according to Mixpanel spec requirements
 */
const formatValueForStep = (
  stepId: string,
  value: string | string[] | number | number[]
): string | string[] | number | number[] | { text_length: number, text: string } => {
  // Handle capacity_fullness - convert slider value to range format
  if (stepId === "capacity_fullness") {
    const numValue = typeof value === "string" ? parseInt(value, 10) : typeof value === "number" ? value : null;
    if (numValue !== null) {
      if (numValue >= 70 && numValue <= 80) return "70_80";
      if (numValue >= 85 && numValue <= 90) return "85_90";
      if (numValue >= 95 && numValue <= 100) return "95_100";
    }
    return String(value);
  }

  // Handle freeform - NEVER send raw text, only metadata
  if (stepId === "freeform" && typeof value === "string") {
    return {
      text: value,
      text_length: value.replaceAll(" ", "").length
    };
  }

  // Handle arrays (multi-select steps)
  if (Array.isArray(value)) {
    return value;
  }

  return value;
};

export const useStepTracking = () => {
  // ==================== EVENT 1: session_started ====================
  /**
   * Tracks session start
   * When to fire: On first page load of a new session
   *
   * V1 Attribution Logic:
   * - If URL has UTM params, use them
   * - If no UTM params, set source = "direct"
   * - source = "paid" if utm_source exists AND utm_medium contains "paid"/"cpc"/"ppc"
   * - source = "organic" if utm_source exists but utm_medium doesn't indicate paid
   * - source = "direct" if no utm_source
   */
  const trackSessionStarted = (props: {
    source: "paid" | "organic" | "direct" | "unknown";
    utm_source: string | null;
    utm_medium: string | null;
    utm_campaign: string | null;
    campaign_id: string | null;
  }) => {
    track("session_started", props);
  };

  // ==================== EVENT 2: landing_viewed ====================
  /**
   * Tracks landing page view
   * When to fire: Landing page is rendered
   */
  const trackLandingViewed = (props: {
    landing_variant: string;
    message_type: "diagnostic" | "feature_led";
  }) => {
    track("landing_viewed", props);
  };

  // ==================== EVENT 3: onboarding_step_completed ====================
  /**
   * Tracks onboarding step completion
   * When to fire: User clicks "Next" on a card
   * ⚠️ This event is reused for ALL onboarding cards
   */
  const trackOnboardingStepCompleted = (
    stepSlug: string,
    stepIndex: number,
    value: string | string[] | number | number[]
  ) => {
    const stepId = STEP_ID_MAP[stepSlug] || stepSlug;
    const formattedValue = formatValueForStep(stepId, value);

    track("onboarding_step_completed", {
      step_id: stepId,
      step_index: stepIndex,
      value: formattedValue,
    });
  };

  // ==================== EVENT 4: brain_dump_started ====================
  /**
   * Tracks brain dump start
   * When to fire: User enters brain dump screen
   */
  const trackBrainDumpStarted = (props: {
    initial_task_count: number;
  }) => {
    track("brain_dump_started", props);
  };

  // ==================== EVENT 5: task_chip_clicked ====================
  /**
   * Tracks task chip click
   * When to fire: User clicks a task chip (before it's added)
   */
  const trackTaskChipClicked = (props: {
    id: string;
    task_est_time: number;
    task_title: string;
    task_source: "chip";
    tray_version: string | null;
    est_time?: number;
    kind: string;
    parent_id: string;
    relation_type: string
  }) => {
    track("task_chip_clicked", props);
  };

  // ==================== EVENT 6: task_added_to_load ====================
  /**
   * Tracks task added to load
   * When to fire: Task is added to the user's load list
   *
   * For chip-generated tasks:
   * {
   *   task_kind: "core" | "derivative" | "overhead" | "life",
   *   family_id: string,
   *   cumulative_task_count: number
   * }
   *
   * For manual tasks (when user types and presses Enter):
   * {
   *   task_kind: "manual",
   *   input_method: "text",
   *   cumulative_task_count: number,
   *   session_manual_task_count: number
   * }
   */
  const trackTaskAddedToLoad = (
    props:
      {
        task_source: "manual" | "chip";
        task_title: string;
        task_est_time: number | null;
        session_manual_task_count?: number;
        cumulative_task_count: number;

      }
  ) => {
    track("task_added_to_load", props);
  };

  // ==================== EVENT 7: brain_dump_completed ====================
  /**
   * Tracks brain dump completion
   * When to fire: User clicks "Continue" after brain dump
   */
  const trackBrainDumpCompleted = (props: {
    total_tasks: number,
    manual_task_count: number,
    chip_task_count: number
  }) => {
    track("brain_dump_completed", props);
  };

  // ==================== EVENT 8: archetype_viewed ====================
  /**
   * Tracks archetype page view
   * When to fire: Archetype page is rendered
   */
  const trackArchetypeViewed = (props: {
    archetype_id: string;
    capacity_hours: number;
    capacity_fullness: "70_80" | "85_90" | "95_100";
    overload_score: number;
  }) => {
    track("archetype_viewed", props);
  };

  // ==================== EVENT 9: cta_clicked ====================
  /**
   * Tracks CTA click
   * When to fire: User clicks final CTA
   */
  const trackCtaClicked = (props: {
    cta_type: "early_access" | "waitlist" | "continue";
  }) => {
    track("cta_clicked", props);
  };

  // ==================== DEPRECATED METHODS ====================
  /**
   * @deprecated Use trackOnboardingStepCompleted instead
   */
  const trackStepCompletion = (
    stepName: string,
    stepNumber: number,
    selectedData: string | string[] | number | number[]
  ) => {
    trackOnboardingStepCompleted(stepName, stepNumber, selectedData);
  };

  /**
   * @deprecated Not part of spec
   */
  const trackStepView = (stepName: string) => {
    // No-op
  };

  return {
    // All 9 events from the spec
    trackSessionStarted,
    trackLandingViewed,
    trackOnboardingStepCompleted,
    trackBrainDumpStarted,
    trackTaskChipClicked,
    trackTaskAddedToLoad,
    trackBrainDumpCompleted,
    trackArchetypeViewed,
    trackCtaClicked,

    // Deprecated methods (for backward compatibility)
    trackStepCompletion,
    trackStepView,
  };
};
