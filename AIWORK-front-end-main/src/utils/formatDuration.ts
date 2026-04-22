export const formatDuration = (hours: number): string => {
  // Treat null/undefined/NaN as 0
  const safeHours = Number(hours) || 0;
  const wholeHours = Math.floor(safeHours);
  const mins = Math.round((safeHours - wholeHours) * 60);

  if (wholeHours > 0 && mins > 0) {
    return `${wholeHours}h ${mins}m`;
  } else if (wholeHours > 0) {
    return `${wholeHours}h`;
  } else {
    return `${mins}m`;
  }
};