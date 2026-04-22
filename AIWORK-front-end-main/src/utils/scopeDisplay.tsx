import { type ReactNode } from "react";
import { AlertCircle, Clock, CheckCircle2, Ban, AlertTriangle, Lock } from "lucide-react";
import { Scope } from "~/models/Task";

// Fields to display in scope view (in order)
const SCOPE_DISPLAY_FIELDS = [
  "objective",
  "why_now",
  "definition_of_done",
  "out_of_scope",
] as const;

// Scope field config with icon, color, and title
const SCOPE_FIELD_CONFIG = {
  objective: {
    title: "Objective",
    icon: "📛",
    color: "text-yellow-200",
  },
  why_now: {
    title: "Why Now",
    icon: "⏱️",
    color: "text-yellow-200",
  },
  definition_of_done: {
    title: "Definition of Done",
    icon: "✅",
    color: "text-yellow-200",
  },
  out_of_scope: {
    title: "Out of Scope",
    icon: "🚫",
    color: "text-red-500",
  },
  constraints: {
    title: "Constraints",
    icon: "🔒",
    color: "text-purple-600",
  },
  risk_if_ignored: {
    title: "Risk if Ignored",
    icon: "⚠️",
    color: "text-amber-600",
  },
} as const;

// Helper function to render scope value based on type
export const renderScopeValue = (value: string | string[]): ReactNode => {
  if (Array.isArray(value)) {
    return (
      <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
        {value?.map((item, idx) => (
          <li key={idx}>{item}</li>
        ))}
      </ul>
    );
  }
  return <p className="text-sm text-muted-foreground">{value}</p>;
};

// Main function to get displayable scope items
export const getScopeDisplayItems = (scope?: Scope | null): Array<{
  key: string;
  title: string;
  icon: string;
  color: string;
  value: ReactNode;
}> => {
  if (!scope) return [];

  return SCOPE_DISPLAY_FIELDS?.filter((field) => scope[field])?.map((field) => {
    const config = SCOPE_FIELD_CONFIG[field];
    return {
      key: field,
      title: config.title,
      icon: config.icon,
      color: config.color,
      value: renderScopeValue(scope[field] as string | string[]),
    };
  });
};
