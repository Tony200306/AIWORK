import { Tag } from "@/components/shared/ReactComponent/components/Tag/src/Tag";
import { Task } from "../../../../../../models/Task";
import { ChevronUp } from "lucide-react";
import { getScopeDisplayItems } from "@/utils/scopeDisplay";

interface Props {
  task: Task;
  onExpandClick?: () => void;
}

const formatEstimate = (hours: number | null | undefined): string => {
  if (!hours) return "Est. N/A";

  const totalMinutes = hours * 60;
  const wholeHours = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;

  if (wholeHours > 0 && mins > 0) {
    return `Est. ${wholeHours}h ${Math.round(mins)}m`;
  } else if (wholeHours > 0) {
    return `Est. ${wholeHours}h`;
  } else {
    if (mins < 1) {
      const rounded = parseFloat(mins.toFixed(2));
      return `Est. ${rounded}m`;
    }
    return `Est. ${Math.round(mins)}m`;
  }
};

export default function TaskDetailView({ task, onExpandClick }: Props) {
  return (
    <div className="flex flex-col h-full bg-card rounded-2xl border-2 border-border overflow-hidden">
      {/* Task Header Card */}
      <div className="p-4 bg-secondary rounded-xl m-2 min-h-0 flex-1 flex flex-col">
        {/* Title row with chevron */}
        <div className="flex items-start justify-between gap-2">
          <span className="text-sm font-semibold text-secondary-foreground flex-1">
            {task.title}
          </span>
          <button
            onClick={onExpandClick}
            className="p-1"
          >
            <ChevronUp
              size={20}
              className="text-muted-foreground transition-transform duration-200"
            />
          </button>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1 mt-2">
          {(task?.tags || [])?.map((tag) => (
            <Tag
              key={tag.id}
              variant="pill"
              dotColor={tag.color ?? null}
              bordered={false}
              className="text-[13px]! h-7"
            >
              {tag.name}
            </Tag>
          ))}
        </div>

        {/* Steps count and estimate */}
        <div className="flex items-center justify-between mt-2">
          <span className="text-[13px] text-muted-foreground">
            {task?.steps?.length} steps
          </span>
          <span className="text-[13px] text-muted-foreground">
            {formatEstimate(task.expectedTimeHours)}
          </span>
        </div>

        {/* Divider */}
        <div className="border-t border-border mt-3" />

        {/* Scope content area */}
        <div className="flex-1 overflow-y-auto py-3 space-y-3 min-h-0 scrollbar-hide">
          {task?.scope ? (
            getScopeDisplayItems(task.scope)?.map(({ key, title, icon, color, value }) => (
              <div key={key} className="space-y-1">
                <h4 className={`text-xs font-semibold flex items-center gap-1 ${color}`}>
                  <span>{icon}</span>
                  {title}
                </h4>
                {value}
              </div>
            ))
          ) : (
            <span className="text-sm text-muted-foreground">No scope information available</span>
          )}
        </div>
      </div>

      {/* Spacer to fill remaining height */}
    </div>
  );
}
