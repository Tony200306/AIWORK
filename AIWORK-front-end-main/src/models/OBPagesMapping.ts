/**
 * Onboarding Step Mapping
 * Maps page slugs to step_id for Mixpanel tracking
 */

export const STEP_ID_MAP: Record<string, string> = {
  "your-name": "your_name",
  "primary-role": "primary_role",
  "weekly-hours": "weekly_hours",
  "task-sources": "task_sources",
  "quarterly-goal": "quarterly_goal",
  "core-values": "core_values",
  "top-client": "top_client",
  "client-health": "client_health",
  "client-goal": "client_goal",
  "client-revenue": "client_revenue",
  "task-timeline": "task_timeline",
};
