/**
 * Capacity Calculation Utilities
 *
 * These functions implement the capacity bar math based on the formula:
 * capacity_percent = (planned_hours / target_capacity_hours) * 100
 *
 * Where:
 * - target_capacity_hours = work_hours * target_fill
 * - planned_hours = sum(duration_minutes for all tasks) / 60
 *
 * IMPORTANT: Task.est_time from the API is in HOURS, not minutes.
 * The getTaskDuration() function converts this to minutes for calculations.
 */

// Default durations by task kind (in minutes)
export const DEFAULT_DURATION_BY_KIND: Record<string, number> = {
  core: 45,
  derivative: 25,
  overhead: 15,
  life: 30,
  manual: 30, // default for manually added tasks
};

// Map slider values to target_fill values
export const SLIDER_TO_TARGET_FILL: Record<number, number> = {
  70: 0.75,
  75: 0.75,
  80: 0.75,
  85: 0.875,
  90: 0.875,
  95: 0.975,
  100: 0.975,
};

export type CapacityState = "breathing_room" | "tight_fit" | "overbooked";

export interface Task {
  id: string;
  text: string;
  est_time?: number; // in HOURS (not minutes)
  task_source?: "chip" | "manual";
  kind: string;
}

export interface CapacityData {
  capacityPercent: number;
  capacityState: CapacityState;
  targetCapacityHours: number;
  plannedHours: number;
  plannedMinutes: number;
}

/**
 * Get the duration of a task in minutes
 * Note: est_time from API is in HOURS, so we convert to minutes
 */
export function getTaskDuration(task: Task): number {
  // Use explicit est_time if available (convert from hours to minutes)
  if (task.est_time !== undefined && task.est_time !== null) {
    return task.est_time * 60;
  }

  // Use default by kind
  const defaultDuration = DEFAULT_DURATION_BY_KIND[task.kind];
  if (defaultDuration !== undefined) {
    return defaultDuration;
  }

  // Fallback: use default for manual tasks
  return DEFAULT_DURATION_BY_KIND.manual;
}

/**
 * Calculate capacity metrics based on tasks and user inputs
 *
 * @param tasks - Array of selected tasks
 * @param workHours - Weekly work hours selected by user
 * @param sliderValue - Capacity feeling slider value (70-100)
 * @returns Capacity data including percent, state, and hours
 */
export function calculateCapacity(
  tasks: Task[],
  workHours: number,
  sliderValue: number
): CapacityData {
  // Step A: Compute Target Capacity Hours
  const targetFill = SLIDER_TO_TARGET_FILL[sliderValue] || 0.875;
  const targetCapacityHours = workHours * targetFill;

  // Step B: Compute Planned Load Hours
  const plannedMinutes = tasks.reduce((sum, task) => {
    return sum + getTaskDuration(task);
  }, 0);
  const plannedHours = plannedMinutes / 60;

  // Step C: Capacity Percent
  // Handle edge case: if target capacity is 0, return 0%
  const capacityPercent = targetCapacityHours > 0
    ? (plannedHours / targetCapacityHours) * 100
    : 0;

  // Step D: Capacity State
  let capacityState: CapacityState;
  if (capacityPercent <= 85) {
    capacityState = "breathing_room";
  } else if (capacityPercent <= 100) {
    capacityState = "tight_fit";
  } else {
    capacityState = "overbooked";
  }

  return {
    capacityPercent,
    capacityState,
    targetCapacityHours,
    plannedHours,
    plannedMinutes,
  };
}

// Re-export formatTime from centralized utility for backward compatibility
export { formatTimeFromMinutes as formatTime } from "./formatTimeDisplay";

/**
 * Get capacity bar color based on state
 */
export function getCapacityBarColor(state: CapacityState): string {
  switch (state) {
    case "breathing_room":
      return "bg-chart-2"; // Green
    case "tight_fit":
      return "bg-chart-4"; // Yellow
    case "overbooked":
      return "bg-chart-5"; // Red
  }
}

/**
 * Get text color that matches the capacity bar color
 */
export function getCapacityTextColor(state: CapacityState): string {
  switch (state) {
    case "breathing_room":
      return "text-chart-2"; // Green
    case "tight_fit":
      return "text-chart-4"; // Yellow
    case "overbooked":
      return "text-chart-5"; // Red
  }
}

/**
 * Get headline and supporting text based on capacity state
 */
export function getCapacityMessages(
  capacityPercent: number,
  state: CapacityState
): { headline: string; supporting: string } {
  const roundedPercent = Math.round(capacityPercent);

  switch (state) {
    case "breathing_room":
      return {
        headline: `Your week is planned at ${roundedPercent}% capacity`,
        supporting: "You have room this week, but capacity isn't the issue. Where your effort goes is.",
      };
    case "tight_fit":
      return {
        headline: `Your week is planned at ${roundedPercent}% capacity`,
        supporting: "You are right at the edge of what this week can hold. Small tradeoffs will decide how it goes.",
      };
    case "overbooked":
      return {
        headline: `Your week is planned at ${roundedPercent}% capacity`,
        supporting: "This plan assumes more time and energy than you actually have. Something will break.",
      };
  }
}
