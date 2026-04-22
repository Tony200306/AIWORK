"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { DoubleTriagle } from "@/components/icon/DoubleTriagle";
import { SprintItem } from "@/models/Sprint";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Check,
  ChevronDown,
  Circle,
  Layers,
  Lock,
  LockOpen,
  Square,
  SquareCheckBig,
  Star,
  Triangle,
  Zap,
} from "lucide-react";
import { useCallback, useState } from "react";
import { Priority, Task, TaskStatus, TaskType, priorityToLabelMapping } from "../../../../../../models/Task";
import { cn } from "@/lib/utils";

const scoreBarConfig = [
  { label: "Goal Alignment", field: "goalAlignment" as const, color: "bg-purple-500" },
  { label: "Client Weight", field: "clientWeightVal" as const, color: "bg-orange-400" },
  { label: "Time Sensitivity", field: "timeSensitivity" as const, color: "bg-blue-500" },
  { label: "Values", field: "valuesAlignment" as const, color: "bg-green-400" },
];

function ScoreTooltipContent({ task, priority, priorityEntry }: { task: Task; priority: string; priorityEntry: { icon: React.ElementType; color: string; iconClass?: string; bg: string } }) {
  const score = task.compositeScore ?? 87;
  const goal = task.goal;
  const tierRank = goal ? `${goal.tier}-R${goal.rank}` : null;

  const rawValues = {
    goalAlignment: task.goalAlignment ?? 0,
    clientWeightVal: task.clientWeightVal ?? 0,
    timeSensitivity: task.timeSensitivity ?? 0,
    valuesAlignment: Math.max(0, task.valuesAlignment ?? 0),
  };

  return (
    <div className="w-[388px] bg-background border border-border rounded-2xl shadow-xl divide-y divide-border">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4">
        <div>
          <span className="text-2xl font-bold text-emerald-500">{score}</span>
          <span className="text-sm text-muted-foreground font-medium"> / 100</span>
        </div>
        <span className={cn("flex items-center gap-1.5 px-3 py-1 rounded-xs text-xs font-medium", priorityEntry.bg, priorityEntry.color)}>
          <priorityEntry.icon className={cn("w-2.5 h-2.5", priorityEntry.iconClass)} />
          {priority}
        </span>
      </div>

      {/* Progress Bars */}
      <div className="flex flex-col gap-4 px-6 py-4">
        {scoreBarConfig.map(({ label, field, color }) => {
          const pct = Math.round(rawValues[field] * 100);
          return (
            <div key={field} className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground w-28 shrink-0 text-right">{label}</span>
              <div className="flex-1 h-2.5 bg-white/20 rounded-full overflow-hidden">
                <div className={cn("h-full rounded-full", color)} style={{ width: `${pct}%` }} />
              </div>
              <span className="text-xs text-muted-foreground w-8 text-right shrink-0">{pct}%</span>
            </div>
          );
        })}
      </div>

      {/* Serves goal */}
      {goal && (
        <div className="flex items-center gap-2 px-6 py-4">
          <div className="w-5 h-5 shrink-0 text-muted-foreground">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-full h-full">
              <circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 3" />
            </svg>
          </div>
          <span className="text-sm text-muted-foreground font-medium">Serves:</span>
          <span className="text-sm text-purple-400 font-medium truncate">{goal.title}</span>
          <span className="ml-auto shrink-0 px-2 py-0.5 rounded-md bg-purple-900/40 text-purple-400 text-xs font-semibold">
            {tierRank}
          </span>
        </div>
      )}

      {/* Explanation */}
      <div className="px-6 py-4">
        <p className="text-sm text-muted-foreground leading-relaxed">
          <span className="font-bold text-foreground">Highest priority</span> because it directly drives your top client goal for <span className="font-bold text-foreground">Acme Corp</span> and aligns with your value of <span className="font-bold text-foreground">Client Trust.</span>
        </p>
      </div>
   

      {/* Coming soon hint */}
      <div className="px-6 py-4 flex items-start gap-2 text-xs text-muted-foreground italic">
        <Zap className="w-3.5 h-3.5 shrink-0 mt-0.5" />
        <span>Time sensitivity improves with calendar + deadline tracking. Coming soon</span>
      </div>
    </div>
  );
}

const priorityIconMap: Record<Priority, { icon: React.ElementType; color: string; iconClass?: string; bg: string }> = {
  [Priority.Highest]: { icon: Star, color: "text-red-500", bg: "bg-red-900/40" },
  [Priority.High]: { icon: Triangle, color: "text-orange-500", bg: "bg-orange-900/40" },
  [Priority.Medium]: { icon: Circle, color: "text-orange-500", bg: "bg-orange-900/40" },
  [Priority.Low]: { icon: Triangle, color: "text-blue-500", iconClass: "rotate-180", bg: "bg-blue-900/40" },
  [Priority.Lowest]: { icon: DoubleTriagle, color: "text-gray-500", bg: "bg-gray-800/60" },
};

interface KanBanItemProps {
  item: SprintItem;
  title: string;
  timeEstimate: string;
  isStarred?: boolean;
  isLocked?: boolean;
  isSelected?: boolean;
  isSelectionMode?: boolean;
  isDone?: boolean;
  onEdit?: () => void;
  onPriorityChange?: (priority: Priority) => void;
  onClick?: () => void;
  onToggleLock?: () => void;
  onToggleStar?: () => void;
  setSelectedTasks?: React.Dispatch<React.SetStateAction<string[]>>;
  dragHandleProps?: any;
  setSelectedDoingTask?: (task: SprintItem) => void;
}

export function KanBanCard({
  item,
  title,
  timeEstimate,
  isStarred = false,
  isLocked = false,
  onEdit,
  onPriorityChange,
  onClick,
  onToggleLock,
  onToggleStar,
  isSelected = false,
  isSelectionMode = false,
  isDone = false,
  setSelectedTasks,
  dragHandleProps,
  setSelectedDoingTask,
}: KanBanItemProps) {
  const priorityEntry = priorityIconMap[item?.task.priority] || priorityIconMap[Priority.Medium];
  const [scoreOpen, setScoreOpen] = useState(false);

  const handlePriorityChange = useCallback((value: string) => {
    onPriorityChange?.(value as Priority);
  }, [onPriorityChange]);

  return (
    <div
      onClick={onClick}
      className={cn(
        "bg-[#2a2a2a] border rounded-lg p-4 pt-0 hover:bg-[#333333] transition-colors group",
        isDone ? "border-white" : "border-border"
      )}
    >
      <Accordion type="single" collapsible>
        <AccordionItem value="item-1">
          {/* 3-column grid: icons | content | right zone */}
          <div className="mt-3 grid grid-cols-[auto_1fr_auto] gap-3 items-stretch">
            {/* Col 1: Lock + Star icons stacked */}
            <div className="flex flex-col items-center gap-2">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleLock?.();
                }}
                onPointerDown={(e) => e.stopPropagation()}
                className="cursor-pointer"
              >
                {isLocked ? (
                  <Lock className="w-5 h-5 text-[#FCB74D]" />
                ) : (
                  <LockOpen className="w-5 h-5 text-card-foreground" />
                )}
              </button>
              <div
                onClick={(e) => e.stopPropagation()}
                onPointerDown={(e) => e.stopPropagation()}
              >
                <Select value={item?.task.priority} onValueChange={handlePriorityChange}>
                  <SelectTrigger size="sm" className="p-0 border border-muted-foreground/40 bg-transparent shadow-none [&>svg:last-child]:hidden flex items-center justify-center w-8 h-8! rounded-full! cursor-pointer">
                    <SelectValue>
                      <priorityEntry.icon className={cn("w-4 h-4", priorityEntry.color, priorityEntry.iconClass)} />
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent position="popper" align="start">
                    {Object.values(Priority)?.map((priority) => {
                      const { icon: Icon, color, iconClass } = priorityIconMap[priority];
                      return (
                        <SelectItem key={priority} value={priority} className="text-white!">
                          <div className="flex items-center gap-2">
                            <Icon className={cn("w-4 h-4", color, iconClass)} />
                            {priorityToLabelMapping()[priority]}
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Col 2: Title + Tags */}
            <div className="min-w-0">
              <h3 className="text-white font-medium text-base leading-snug mb-2">
                {title}
              </h3>
              <div className="flex flex-wrap items-center gap-x-1.5 gap-y-1">
                {item?.task.tags?.map((tag, index) => (
                  <div className="flex items-center gap-1.5" key={tag.id}>
                    {index > 0 && (
                      <div className="w-1 h-1 rounded-full bg-muted-foreground/60 shrink-0" />
                    )}
                    <span className="text-sm text-muted-foreground whitespace-nowrap">
                      {tag.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Col 3: Score + Show/Hide | Checkbox */}
            <div className="flex items-stretch self-stretch w-20">
              {/* Score (top) + Show/Hide (bottom) — stretches full width when no checkbox */}
              <div className="flex flex-col items-center justify-between flex-1">
                <Popover open={scoreOpen} onOpenChange={setScoreOpen}>
                  <PopoverTrigger asChild>
                    <div
                      className="flex items-center justify-center min-w-9 h-9 px-2 rounded-lg bg-emerald-900/60 text-emerald-400 font-semibold text-sm cursor-pointer"
                      onMouseEnter={() => setScoreOpen(true)}
                      onMouseLeave={() => setScoreOpen(false)}
                      onClick={(e) => e.stopPropagation()}
                      onPointerDown={(e) => e.stopPropagation()}
                    >
                      {item?.task.compositeScore ?? 87}
                    </div>
                  </PopoverTrigger>
                  <PopoverContent
                    side="left"
                    align="start"
                    className="p-0 border-none shadow-none bg-transparent w-auto"
                    onMouseEnter={() => setScoreOpen(true)}
                    onMouseLeave={() => setScoreOpen(false)}
                    onPointerDown={(e) => e.stopPropagation()}
                  >
                    <ScoreTooltipContent
                      task={item?.task}
                      priority={priorityToLabelMapping()[item?.task.priority] ?? "Medium"}
                      priorityEntry={priorityEntry}
                    />
                  </PopoverContent>
                </Popover>
                <AccordionTrigger
                  icon={<ChevronDown className="size-4 text-muted-foreground transition-transform duration-200 group-data-[state=open]:rotate-180" />}
                  className="my-0.5 flex flex-row-reverse gap-1 cursor-pointer p-0 hover:no-underline"
                >
                  <span className="text-xs group-data-[state=open]:hidden">Show</span>
                  <span className="text-xs hidden group-data-[state=open]:inline">Hide</span>
                </AccordionTrigger>
              </div>
              {/* Checkbox — slides in on hover, centered vertically */}
              <div
                className={cn(
                  "flex items-center overflow-hidden transition-all duration-200",
                  isSelectionMode || isSelected ? "w-7 opacity-100" : "w-0 opacity-0 group-hover:w-7 group-hover:opacity-100"
                )}
              >
                <div
                  className="shrink-0 cursor-pointer ml-2"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedTasks?.((prev) =>
                      prev.includes(item.id)
                        ? prev?.filter((id) => id !== item.id)
                        : [...prev, item.id]
                    );
                  }}
                  onPointerDown={(e) => e.stopPropagation()}
                >
                  {isSelected ? (
                    <SquareCheckBig className="w-5 h-5 text-white" />
                  ) : (
                    <Square className="w-5 h-5 text-muted-foreground" />
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Accordion content: priority selector + steps */}
          <AccordionContent>
            <div className="mt-4 space-y-3">
              {/* Steps list */}
              <div className="grid grid-cols-[auto_1fr_auto_auto] gap-x-3 gap-y-2 items-start p-4 border border-border rounded-xl">
                {item?.task.steps?.map((step) => {
                  const hours = Math.floor((step.sysEstMinutes ?? 0) / 60);
                  const minutes = (step.sysEstMinutes ?? 0) % 60;
                  const estLabel = hours > 0 && minutes > 0
                    ? `${hours}h ${minutes}m`
                    : hours > 0
                      ? `${hours}h`
                      : `${minutes}m`;

                  return (
                    <div key={step.id} className="col-span-4 grid grid-cols-subgrid items-start">
                      {/* Checkbox icon */}
                      <div className="pt-0.5">
                        {step.isDone ? (
                          <SquareCheckBig className="w-4 h-4 text-chart-2" />
                        ) : (
                          <Square className="w-4 h-4 text-card-foreground" />
                        )}
                      </div>
                      {/* Title */}
                      <span
                        className={cn(
                          "text-base",
                          step.isDone ? "text-chart-2 line-through" : "text-card-foreground"
                        )}
                      >
                        {step.title}
                      </span>
                      {/* Priority icon */}
                      <priorityEntry.icon className={cn("w-4 h-4 mt-1", priorityEntry.color, priorityEntry.iconClass)} />
                      {/* Estimated time */}
                      <span className="text-sm text-muted-foreground whitespace-nowrap mt-0.5">
                        {step.sysEstMinutes != null ? `Est. ${estLabel}` : ""}
                      </span>
                    </div>
                  );
                })}
              </div>
              {/* Summary row */}
              {(() => {
                const steps = item?.task.steps ?? [];
                const doneCount = steps.filter((s) => s.isDone).length;
                const totalMinutes = steps.reduce((sum, s) => sum + (s.sysEstMinutes ?? 0), 0);
                const totalH = Math.floor(totalMinutes / 60);
                const totalM = totalMinutes % 60;
                const totalLabel = totalH > 0 && totalM > 0
                  ? `${totalH}h ${totalM}m`
                  : totalH > 0
                    ? `${totalH}h`
                    : `${totalM}m`;

                return (
                  <div className="flex items-center justify-between text-sm text-muted-foreground mt-2">
                    <div className="flex items-center gap-1.5">
                      <Layers className="w-4 h-4" />
                      <span>{doneCount}/{steps.length}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span>Total Estimated Time:</span>
                      <span>Est. {totalLabel}</span>
                    </div>
                  </div>
                );
              })()}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
