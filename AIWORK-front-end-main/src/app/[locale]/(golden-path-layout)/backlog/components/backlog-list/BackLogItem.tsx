"use client";

import { Button } from "@/components/ui/button";
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
import { cn } from "@/lib/utils";
import { Priority, TaskStatus, priorityToLabelMapping, statusToColorMapping, statusToLabelMapping } from "@/models/Task";
import { Checkbox } from "@/components/ui/checkbox";
import { ChevronDown, ChevronUp, Circle, Layers, Lock, LockOpen, Square, SquareCheckBig, Star, Triangle, Zap } from "lucide-react";
import { useState, useCallback, useMemo } from "react";
import { Task } from "../../../../../../models/Task";
import { DoubleTriagle } from "@/components/icon/DoubleTriagle";
import React from "react";

const priorityIconMap: Record<Priority, { icon: React.ElementType; color: string; iconClass?: string; bg: string }> = {
  [Priority.Highest]: { icon: Star, color: "text-red-500", bg: "bg-red-900/40" },
  [Priority.High]: { icon: Triangle, color: "text-orange-500", bg: "bg-orange-900/40" },
  [Priority.Medium]: { icon: Circle, color: "text-orange-500", bg: "bg-orange-900/40" },
  [Priority.Low]: { icon: Triangle, color: "text-blue-500", iconClass: "rotate-180", bg: "bg-blue-900/40" },
  [Priority.Lowest]: { icon: DoubleTriagle, color: "text-gray-500", bg: "bg-gray-800/60" },
};

const scoreBarConfig = [
  { label: "Goal Alignment", field: "goalAlignment" as const, color: "bg-purple-500" },
  { label: "Client Weight", field: "clientWeightVal" as const, color: "bg-orange-400" },
  { label: "Time Sensitivity", field: "timeSensitivity" as const, color: "bg-blue-500" },
  { label: "Values", field: "valuesAlignment" as const, color: "bg-green-400" },
];

function ScoreTooltipContent({ task, priority, priorityEntry }: { task: Task; priority: string; priorityEntry: { icon: React.ElementType; color: string; iconClass?: string; bg: string } }) {
  const score = task.compositeScore ?? 0;
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
      <div className="px-6 py-4 flex items-start gap-2 text-xs text-muted-foreground italic">
        <Zap className="w-3.5 h-3.5 shrink-0 mt-0.5" />
        <span>Time sensitivity improves with calendar + deadline tracking. Coming soon</span>
      </div>
    </div>
  );
}

interface BackLogItemProps {
  item: Task;
  breadcrumb?: string[];
  isSelected?: boolean;
  isDragging?: boolean;
  onToggleSelect?: (id: string) => void;
  onPriorityChange?: (priority: Priority) => void;
  onStatusChange?: (status: TaskStatus) => void;
  onToggleLock?: () => void;
  onShowClick?: () => void;
}

const formatTime = (minutes: number | null | undefined): string => {
  if (!minutes) return "0m";
  const totalMins = Math.round(minutes);
  const hours = Math.floor(totalMins / 60);
  const mins = totalMins % 60;
  if (hours > 0 && mins > 0) {
    return `${hours}h ${mins}m`;
  }
  return hours > 0 ? `${hours}h` : `${mins}m`;
};

function BackLogItem({
  item,
  breadcrumb = [],
  isSelected = false,
  isDragging = false,
  onToggleSelect,
  onPriorityChange,
  onStatusChange,
  onToggleLock,
  onShowClick,
}: BackLogItemProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [scoreOpen, setScoreOpen] = useState(false);

  // Memoize computed values
  const { steps, completedSteps, totalSteps, priorityEntry, estTime, estTimeHours } = useMemo(() => {
    const steps = item.steps || [];
    const completedSteps = steps?.filter((step) => step.isDone).length;
    const totalSteps = steps.length;
    const priorityEntry = priorityIconMap[item?.priority] || priorityIconMap[Priority.Medium];
    const estTime = formatTime(item.totalEstimatedMinutes);
    const estTimeHours = formatTime(item.expectedTimeHours);
    return { steps, completedSteps, totalSteps, priorityEntry, estTime, estTimeHours };
  }, [item.id, item.priority, item.steps, item.totalEstimatedMinutes, item.expectedTimeHours]);

  const handleToggleExpand = useCallback(() => {
    setIsExpanded(prev => !prev);
    onShowClick?.();
  }, [onShowClick]);

  const handleCheckboxClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleSelect?.(item.id);
  }, [item.id, onToggleSelect]);

  const handleStatusChange = useCallback((value: string) => {
    onStatusChange?.(value as TaskStatus);
  }, [onStatusChange]);

  const handlePriorityChange = useCallback((value: string) => {
    onPriorityChange?.(value as Priority);
  }, [onPriorityChange]);

  return (
    <div
      draggable={false}
      className={cn(
        "group bg-[#2a2a2a] border rounded-lg px-4 py-2.5 transition-colors",
        isDragging
          ? "opacity-40 border-dashed border-muted-foreground"
          : "border-border hover:bg-[#333333]",
      )}
    >
      <div draggable={false} className="flex items-center justify-between gap-4">
        {/* CSS-only hover - no state, no re-render */}
        <div
          data-checkbox
          onClick={handleCheckboxClick}
          draggable={false}
          onDragStart={(e) => e.preventDefault()}
          className="shrink-0 cursor-pointer opacity-0 group-hover/item:opacity-100 transition-opacity pointer-events-auto"
        >
          <Checkbox
            checked={isSelected}
            // onCheckedChange={() => onToggleSelect?.(item.id)}
            className="border-muted-foreground data-[state=checked]:bg-white data-[state=checked]:text-black h-4 w-4"
          />
        </div>
        <div draggable={false} className="flex-1 min-w-0">
          <h3 className="text-white font-sm text-base leading-snug mb-2">
            {item.title}
          </h3>
          {breadcrumb.length > 0 && (
            <div className="flex items-center text-xs gap-1.5 text-sm text-muted-foreground">
              {breadcrumb?.map((crumb, index) => (
                <span key={index} className="flex items-center gap-1.5">
                  {crumb}
                  {index < breadcrumb.length - 1 && (
                    <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/60" />
                  )}
                </span>
              ))}
              {!isExpanded && totalSteps > 0 && (
                <>
                  <span className="text-muted-foreground/60">›</span>
                  <span className="flex items-center gap-1.5">
                    <Layers className="w-4 h-4" />
                    {completedSteps}/{totalSteps} steps
                  </span>
                </>
              )}
            </div>
          )}
        </div>

        <div className="shrink-0 flex items-center gap-2" draggable={false} onDragStart={(e) => e.preventDefault()}>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onToggleLock?.(); }}
            onPointerDown={(e) => e.stopPropagation()}
            className="cursor-pointer shrink-0 pointer-events-auto"
            draggable={false}
          >
            {item.pinned ? (
              <Lock className="w-4 h-4 text-[#FCB74D]" />
            ) : (
              <LockOpen className="w-4 h-4 text-card-foreground opacity-40 hover:opacity-100 transition-opacity" />
            )}
          </button>
          {!isExpanded && (
            <span className="card-body-semi text-secondary-foreground">
              Est. {estTime}
            </span>
          )}
          <Select value={item.status} onValueChange={handleStatusChange}>
            <SelectTrigger
              className="w-25 text-xs px-2 py-0 h-5! pointer-events-auto"
              style={{ backgroundColor: statusToColorMapping()[item?.status] }}
              draggable={false}
            >
              <SelectValue className="text-white! text-xs" placeholder={statusToLabelMapping()[item?.status]} />
            </SelectTrigger>
            <SelectContent>
              {Object.values(TaskStatus)?.map((status) => (
                <SelectItem key={status} value={status} className="text-white!">
                  {statusToLabelMapping()[status]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={item?.priority} onValueChange={handlePriorityChange} >
            <SelectTrigger className="p-0 border border-border bg-secondary [&>svg:last-child]:hidden flex items-center justify-center h-6 w-10 rounded-2xl pointer-events-auto" draggable={false}>
              <SelectValue>
                <priorityEntry.icon className={cn("w-4 h-4", priorityEntry.color, priorityEntry.iconClass)} />
              </SelectValue>
            </SelectTrigger>
            <SelectContent position="popper" align="end">
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

          <Popover open={scoreOpen} onOpenChange={setScoreOpen}>
            <PopoverTrigger asChild>
              <div
                className="flex items-center justify-center min-w-9 h-6 px-2 rounded-lg bg-emerald-900/60 text-emerald-400 font-semibold text-sm cursor-pointer pointer-events-auto"
                onMouseEnter={() => setScoreOpen(true)}
                onMouseLeave={() => setScoreOpen(false)}
                onClick={(e) => e.stopPropagation()}
                onPointerDown={(e) => e.stopPropagation()}
                draggable={false}
              >
                {item.compositeScore ?? 0}
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
                task={item}
                priority={priorityToLabelMapping()[item?.priority] ?? "Medium"}
                priorityEntry={priorityEntry}
              />
            </PopoverContent>
          </Popover>

          <Button
            size="sm"
            className="border px-1.5 py-0 h-6 transition-all duration-200 pointer-events-auto"
            onClick={handleToggleExpand}
            draggable={false}
          >
            {!isExpanded ? <ChevronDown /> : <ChevronUp />}
          </Button>
        </div>
      </div>

      {isExpanded && steps.length > 0 && (
        <div>
          <div className="flex items-center gap-3 justify-end text-xs">
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <Layers className="w-4 h-4" />
              {completedSteps}/{totalSteps} steps
            </span>
            <span className="text-xs text-secondary-foreground">
              Est. {estTimeHours}
            </span>
          </div>
          <div className="mt-2 items-center space-y-3 animate-in fade-in-0 slide-in-from-top-2 duration-200 border border-border rounded-lg px-3 py-3 transition-all flex justify-between">
            <div className="space-y-2 mb-0! w-full">
              {steps?.map((step) => (
                <div
                  key={step.id}
                  className="flex justify-between items-center gap-3 text-base text-card-foreground"
                >
                  <div className="flex gap-2 items-center">
                    {!step.isDone && <Square className="w-4 h-4" />}
                    {step.isDone && <SquareCheckBig className="w-4 h-4" />}
                    <span className={`text-xs ${step.isDone ? "line-through text-muted-foreground" : ""}`}>
                      {step.title}
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-xs">Done</span>
                    <Star size={20} />
                    <span className="text-xs text-muted-foreground">
                      Est. {step.userEstMinutes || step.sysEstMinutes}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Custom comparison for memo
  function arePropsEqual(prevProps: BackLogItemProps, nextProps: BackLogItemProps) {
  return (
    prevProps.item.id === nextProps.item.id &&
    prevProps.item.title === nextProps.item.title &&
    prevProps.item.status === nextProps.item.status &&
    prevProps.item.priority === nextProps.item.priority &&
    prevProps.item.totalEstimatedMinutes === nextProps.item.totalEstimatedMinutes &&
    prevProps.item.expectedTimeHours === nextProps.item.expectedTimeHours &&
    prevProps.item.compositeScore === nextProps.item.compositeScore &&
    prevProps.item.pinned === nextProps.item.pinned &&
    prevProps.isSelected === nextProps.isSelected &&
    prevProps.breadcrumb?.length === nextProps.breadcrumb?.length &&
    prevProps.breadcrumb?.join(",") === nextProps.breadcrumb?.join(",") &&
    prevProps.item.steps?.length === nextProps.item.steps?.length &&
    prevProps.isDragging === nextProps.isDragging
  );
}

export default React.memo(BackLogItem, arePropsEqual);
