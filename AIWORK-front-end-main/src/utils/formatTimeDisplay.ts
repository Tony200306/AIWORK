/**
 * Time Display Formatting Utilities
 *
 * Functions to format time durations for display in the UI.
 * All functions handle floating-point precision issues by rounding first.
 */

/**
 * Format duration from minutes to "Xh Ym" format
 * @param minutes - Duration in minutes (can be decimal)
 * @returns Formatted string (e.g., "2h 30m", "45m", "3h")
 */
export const formatTimeFromMinutes = (minutes: number): string => {
  // Treat null/undefined/NaN as 0
  const safeMinutes = Number(minutes) || 0;
  // Round total minutes first to avoid floating-point precision issues
  const roundedTotal = Math.round(safeMinutes);
  const hours = Math.floor(roundedTotal / 60);
  const mins = roundedTotal % 60;

  if (hours > 0 && mins > 0) {
    return `${hours}h ${mins}m`;
  } else if (hours > 0) {
    return `${hours}h`;
  } else {
    return `${mins}m`;
  }
};

/**
 * Format duration from hours to "Xh Ym" format
 * @param hours - Duration in hours (can be decimal, e.g., 2.5 = 2h 30m)
 * @returns Formatted string (e.g., "2h 30m", "45m", "3h")
 */
export const formatTimeFromHours = (hours: number): string => {
  // Treat null/undefined/NaN as 0
  const safeHours = Number(hours) || 0;
  // Convert to minutes and round to avoid floating-point precision issues
  const totalMinutes = Math.round(safeHours * 60);
  const wholeHours = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;

  if (wholeHours > 0 && mins > 0) {
    return `${wholeHours}h ${mins}m`;
  } else if (wholeHours > 0) {
    return `${wholeHours}h`;
  } else {
    return `${mins}m`;
  }
};
