"use client";

import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { useReshuffleMasterKanban } from "@/hooks/shared/useReshuffleMasterKanban";
import { useUpdateBulkTasks } from "@/hooks/shared/useUpdateBulkTasks";
import { useApplyReshuffleChanges } from "@/hooks/shared/useApplyReshuffleChanges";
import { TaskBulkUpdate } from "@/services/task/updateBulkTasks";
import {
  ReshuffleChange,
  ReshuffleDecision,
  ReshuffleMasterKanbanResult,
} from "@/services/reshuffle/reshuffleMasterKanban";
import { Priority, TaskType } from "@/models/Task";
import { useQueryClient } from "@tanstack/react-query";
import { ArrowDown, ArrowUp, ChevronsDown, ChevronsUp, Loader2, Lock, Minus, SignalHigh, SignalLow } from "lucide-react";

// Theme colors
const C = {
  card: "#131920",
  panel: "#161d27",
  inner: "#1a2332",
  border: "#242f3d",
  text: "#e2e8f0",
  sec: "#8b97a8",
  dim: "#4a5568",
  green: "#34d399",
  red: "#f87171",
  amber: "#fbbf24",
  purple: "#a78bfa",
  blue: "#60a5fa",
};

const PRIORITY_MAP: Record<string, { icon: React.ElementType; color: string }> = {
  HIGHEST: { icon: ChevronsUp, color: "#f87171" },
  HIGH:    { icon: SignalHigh, color: "#fb923c" },
  MEDIUM:  { icon: Minus,      color: "#fbbf24" },
  LOW:     { icon: SignalLow,  color: "#60a5fa" },
  LOWEST:  { icon: ChevronsDown, color: "#8b97a8" },
};

function PriorityIcon({ priority, className }: { priority: string; className?: string }) {
  const p = PRIORITY_MAP[priority?.toUpperCase()] ?? PRIORITY_MAP.MEDIUM;
  const Icon = p.icon;
  return <Icon className={className ?? "w-3.5 h-3.5 shrink-0"} style={{ color: p.color }} />;
}

/** Map TaskType to display label */
function taskTypeToZoneLabel(taskType: TaskType): string {
  const map: Record<TaskType, string> = {
    [TaskType.ACTIVE]: "Active",
    [TaskType.STAGING]: "Staging",
    [TaskType.BACKLOG]: "Backlog",
    [TaskType.NEWSPRINT]: "New Sprint",
  };
  return map[taskType] || taskType;
}

function fmtH(n: number) {
  return Number.isInteger(n) ? `${n}` : n.toFixed(1).replace(/\.0$/, "");
}

function CapacityBar({ used, total }: { used: number; total: number }) {
  const pct = Math.min((used / total) * 100, 100);
  return (
    <div
      className="relative w-full overflow-hidden rounded-md"
      style={{ height: 26, background: "color-mix(in oklch, var(--chart-2) 8%, transparent)" }}
    >
      <div
        className="absolute top-0 left-0 h-full rounded-md transition-[width] duration-400"
        style={{ width: `${pct}%`, background: "var(--chart-2)" }}
      />
      <div className="absolute inset-0 flex items-center justify-center gap-1.5">
        <span className="text-xs font-bold" style={{ color: "var(--secondary-foreground)" }}>
          {fmtH(used)}h
        </span>
        <span className="text-[10px]" style={{ color: "var(--secondary-foreground)" }}>
          /
        </span>
        <span className="text-[11px] font-medium" style={{ color: "var(--secondary-foreground)" }}>
          {fmtH(total)}h
        </span>
      </div>
    </div>
  );
}

function ZonePill({ zone, small }: { zone: string; small?: boolean }) {
  const styles: Record<string, { bg: string; color: string }> = {
    Active: { bg: `${C.green}18`, color: C.green },
    Staging: { bg: `${C.amber}15`, color: C.amber },
    Backlog: { bg: `${C.dim}18`, color: C.sec },
    "New Sprint": { bg: `${C.blue}18`, color: C.blue },
  };
  const s = styles[zone] || styles.Backlog;
  return (
    <span
      className="font-bold tracking-wide rounded"
      style={{
        fontSize: small ? 8 : 9,
        padding: small ? "1px 5px" : "2px 7px",
        background: s.bg,
        color: s.color,
      }}
    >
      {zone}
    </span>
  );
}

function ZoneAndScore({
  from,
  to,
  score,
}: {
  from: string | null;
  to: string;
  score: { old: number; new: number };
}) {
  const delta = score.new - score.old;
  const scoreColor = delta > 0 ? C.green : delta < 0 ? C.red : C.sec;
  const moved = from && from !== to;

  if (!from) {
    return (
      <div className="flex items-center gap-1 shrink-0">
        <ZonePill zone="New" />
        <span className="text-[10px]" style={{ color: C.green }}>→</span>
        <ZonePill zone={to} />
        <span className="text-xs font-extrabold font-mono ml-1" style={{ color: scoreColor }}>
          {score.new}
        </span>
      </div>
    );
  }
  if (!moved) {
    const ArrowIcon = delta > 0 ? ArrowUp : delta < 0 ? ArrowDown : null;
    return (
      <div className="flex items-center gap-1 shrink-0">
        <ZonePill zone={to} />
        {ArrowIcon && <ArrowIcon className="w-3 h-3" style={{ color: scoreColor }} />}
        <span className="text-xs font-extrabold font-mono" style={{ color: scoreColor }}>
          {score.new}
        </span>
      </div>
    );
  }
  const up =
    (to === "Active" && from !== "Active") || (to === "Staging" && from === "Backlog");
  return (
    <div className="flex items-center gap-1 shrink-0">
      <ZonePill zone={from} />
      <span className="text-[10px]" style={{ color: up ? C.green : C.red }}>→</span>
      <ZonePill zone={to} />
      <span className="text-xs font-extrabold font-mono ml-1" style={{ color: scoreColor }}>
        {score.new}
      </span>
    </div>
  );
}

function SectionHeader({
  icon,
  title,
  badge,
  badgeColor,
  muted,
  expanded,
  onToggle,
}: {
  icon: string;
  title: string;
  badge: string;
  badgeColor?: string;
  muted?: boolean;
  expanded: boolean;
  onToggle: () => void;
}) {
  return (
    <div
      onClick={onToggle}
      className="flex items-center gap-2 cursor-pointer mt-4 select-none"
      style={{
        padding: "10px 0 8px",
        borderBottom: expanded ? `1px solid ${C.border}` : "none",
      }}
    >
      <span className="text-[13px]">{icon}</span>
      <span
        className="text-[13px] font-bold tracking-wide"
        style={{ color: muted ? C.dim : C.text }}
      >
        {title}
      </span>
      <span
        className="text-[9px] font-bold rounded-full px-2 py-0.5"
        style={{
          background: `${badgeColor || C.dim}15`,
          color: badgeColor || C.dim,
        }}
      >
        {badge}
      </span>
      <span className="flex-1" />
      <span
        className="text-[10px] transition-transform duration-150"
        style={{
          color: C.dim,
          transform: expanded ? "rotate(180deg)" : "rotate(0deg)",
        }}
      >
        ▾
      </span>
    </div>
  );
}

function DecisionCard({
  item,
  onConfirm,
}: {
  item: ReshuffleDecision;
  onConfirm: (id: string, choice: string) => Promise<void>;
}) {
  const [expanded, setExpanded] = useState(false);
  const [pendingChoice, setPendingChoice] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const fromLabel = taskTypeToZoneLabel(item.zoneBefore);
  const toLabel = taskTypeToZoneLabel(item.zoneRecommended);
  const options = [
    `Accept - move to ${toLabel}`,
    `Keep in ${fromLabel}`,
    "Defer to Backlog",
  ];

  const handleConfirm = async () => {
    if (!pendingChoice || submitting) return;
    setSubmitting(true);
    try {
      await onConfirm(item.taskId, pendingChoice);
    } finally {
      setSubmitting(false);
      setPendingChoice(null);
    }
  };

  return (
    <div
      className="rounded-md mb-1.5 transition-opacity duration-200"
      style={{
        background: C.inner,
        borderLeft: `3px solid ${C.amber}`,
      }}
    >
      <div
        onClick={() => setExpanded(!expanded)}
        className="p-2.5 px-3.5 cursor-pointer"
      >
        <div className="flex items-center gap-2">
          <PriorityIcon priority={item.priority} />
          <span className="text-[13px] font-semibold flex-1 min-w-0 truncate" style={{ color: C.text }}>
            {item.title}
          </span>
          <ZoneAndScore
            from={fromLabel}
            to={toLabel}
            score={{ old: item.scoreBefore, new: item.scoreAfter }}
          />
        </div>
        {expanded && (
          <div className="mt-2">
            <p className="text-[11px] leading-relaxed m-0" style={{ color: C.sec }}>
              {item.reason}
            </p>
            <span
              className="text-[10px] font-mono mt-1 inline-block"
              style={{ color: C.dim }}
            >
              {item.scoreBefore}{" "}
              <span style={{ color: C.red }}>→</span> {item.scoreAfter}
            </span>
          </div>
        )}
      </div>
      {pendingChoice ? (
        <div className="px-3.5 pb-2.5">
          <div
            className="flex items-center justify-between gap-2 rounded-md px-3 py-2"
            style={{ background: `${C.amber}10`, border: `1px solid ${C.amber}30` }}
          >
            <span className="text-[10px] font-semibold truncate" style={{ color: C.text }}>
              {pendingChoice}
            </span>
            <div className="flex gap-1.5 shrink-0">
              <button
                onClick={(e) => { e.stopPropagation(); handleConfirm(); }}
                disabled={submitting}
                className="rounded-md text-[10px] font-bold cursor-pointer px-3 py-1 transition-opacity hover:opacity-80"
                style={{ border: "none", background: C.green, color: "#0d1117", opacity: submitting ? 0.6 : 1 }}
              >
                {submitting ? "..." : "Confirm"}
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); setPendingChoice(null); }}
                disabled={submitting}
                className="rounded-md text-[10px] font-semibold cursor-pointer px-3 py-1 transition-opacity hover:opacity-80"
                style={{ border: `1px solid ${C.border}`, background: "transparent", color: C.sec }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex gap-1.5 px-3.5 pb-2.5 flex-wrap">
          {options.map((opt, i) => {
            const hoverColors = [C.amber, C.green, C.sec];
            const hc = hoverColors[i] ?? C.dim;
            return (
              <button
                key={opt}
                onClick={(e) => { e.stopPropagation(); setPendingChoice(opt); }}
                className="rounded-md text-[10px] font-semibold cursor-pointer px-3 py-1.5 transition-all duration-150"
                style={{ border: `1px solid ${C.border}`, background: C.inner, color: C.sec }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background = `${hc}20`;
                  (e.currentTarget as HTMLButtonElement).style.borderColor = `${hc}60`;
                  (e.currentTarget as HTMLButtonElement).style.color = hc;
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background = C.inner;
                  (e.currentTarget as HTMLButtonElement).style.borderColor = C.border;
                  (e.currentTarget as HTMLButtonElement).style.color = C.sec;
                }}
              >
                {opt}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function ChangeRow({
  item,
  checked,
  onToggle,
  expanded,
  onExpand,
}: {
  item: ReshuffleChange;
  checked: boolean;
  onToggle: () => void;
  expanded: boolean;
  onExpand: () => void;
}) {
  const delta = item.scoreAfter - item.scoreBefore;
  const fromLabel = taskTypeToZoneLabel(item.zoneBefore);
  const toLabel = taskTypeToZoneLabel(item.zoneRecommended);

  return (
    <div
      className="mb-1 rounded-md overflow-hidden"
      style={{ borderLeft: `3px solid ${checked ? C.green : C.red}` }}
    >
      <div
        onClick={onExpand}
        className="flex items-center gap-2 px-6 py-4 cursor-pointer transition-all duration-150"
        style={{
          background: checked ? C.inner : `${C.inner}60`,
          opacity: checked ? 1 : 0.35,
        }}
      >
        <div
          onClick={(e) => {
            e.stopPropagation();
            onToggle();
          }}
          className="w-4 h-4 rounded shrink-0 flex items-center justify-center cursor-pointer"
          style={{
            border: checked ? "none" : `2px solid ${C.sec}`,
            background: checked ? C.green : "transparent",
          }}
        >
          {checked && (
            <span className="text-[9px] font-extrabold" style={{ color: "#0d1117" }}>
              ✓
            </span>
          )}
        </div>
        <PriorityIcon priority={item.priority} />
        <span
          className="text-xs font-semibold flex-1 min-w-0 truncate"
          style={{ color: C.text }}
        >
          {item.title}
        </span>
        <ZoneAndScore
          from={fromLabel}
          to={toLabel}
          score={{ old: item.scoreBefore, new: item.scoreAfter }}
        />
      </div>
      {expanded && (
        <div
          className="rounded-b-md px-3.5 py-2 pl-10"
          style={{ background: C.card }}
        >
          <div className="text-[11px] leading-relaxed mb-1" style={{ color: C.sec }}>
            {item.reason}
          </div>
          <span className="text-[10px] font-mono" style={{ color: C.dim }}>
            {item.scoreBefore}{" "}
            <span style={{ color: delta > 0 ? C.green : delta < 0 ? C.red : C.dim }}>
              →
            </span>{" "}
            {item.scoreAfter}
          </span>
        </div>
      )}
    </div>
  );
}

interface ReshuffleDiffDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sprintId: string;
}

export default function ReshuffleDiffDialog({
  open,
  onOpenChange,
  sprintId,
}: ReshuffleDiffDialogProps) {
  const reshuffleMutation = useReshuffleMasterKanban();
  const bulkUpdateMutation = useUpdateBulkTasks();
  const applyChangesMutation = useApplyReshuffleChanges();
  const queryClient = useQueryClient();

  const [sections, setSections] = useState({
    decisions: true,
    changes: true,
    unchanged: false,
  });
  const [resolved, setResolved] = useState<Record<string, string>>({});
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Trigger reshuffle API when dialog opens
  useEffect(() => {
    if (open && sprintId) {
      reshuffleMutation.mutate(sprintId, {
        onSuccess: (response) => {
          const data = response.data;
          // Initialize checked state for changes
          setChecked(
            Object.fromEntries(data.changes.map((c) => [c.taskId, true]))
          );
          // Reset other state
          setResolved({});
          setExpandedId(null);
          setSections({ decisions: true, changes: true, unchanged: false });
        },
      });
    }
  }, [open, sprintId]);

  const data: ReshuffleMasterKanbanResult | null =
    reshuffleMutation.data?.data ?? null;

  const toggle = (s: keyof typeof sections) =>
    setSections((p) => ({ ...p, [s]: !p[s] }));

  const decisions = data?.decisions ?? [];
  const changes = data?.changes ?? [];
  const unchanged = data?.unchanged ?? [];

  const cApproved = Object.values(checked).filter(Boolean).length;
  const cTotal = changes.length;

  const movedToActive = changes.filter(
    (c) =>
      c.zoneRecommended === TaskType.ACTIVE && c.zoneBefore !== TaskType.ACTIVE
  ).length;
  const scoreShifts = changes.filter(
    (c) => c.zoneBefore === c.zoneRecommended
  ).length;

  const visibleDecisions = decisions.filter((d) => !resolved[d.taskId]);

  const applyOptimistic = (tasks: TaskBulkUpdate[]) => {
    const sprintQueryKey = ["sprint", sprintId];
    const updateMap = new Map(tasks.map((t) => [t.taskId, t]));
    queryClient.setQueryData(sprintQueryKey, (old: any) => {
      if (!old?.data?.items) return old;
      const applyToLane = (items: any[]) =>
        items
          .map((item) => {
            const upd = updateMap.get(item.task?.id);
            if (!upd) return item;
            return {
              ...item,
              task: {
                ...item.task,
                ...(upd.priority !== undefined && { priority: upd.priority }),
                ...(upd.taskType !== undefined && { taskType: upd.taskType }),
              },
            };
          })
          .filter((item) => {
            const upd = updateMap.get(item.task?.id);
            return !upd?.taskType || upd.taskType === TaskType.ACTIVE;
          });
      return {
        ...old,
        data: {
          ...old.data,
          items: {
            TODO: applyToLane(old.data.items.TODO ?? []),
            DOING: applyToLane(old.data.items.DOING ?? []),
            DONE: applyToLane(old.data.items.DONE ?? []),
          },
        },
      };
    });
    return queryClient.getQueryData(["sprint", sprintId]);
  };

  const handleDecisionConfirm = async (id: string, choice: string) => {
    // "Keep" → no API, just remove from list
    if (choice.startsWith("Keep")) {
      setResolved((p) => ({ ...p, [id]: choice }));
      return;
    }
    const decision = decisions.find((d) => d.taskId === id);
    if (!decision) return;
    const task: TaskBulkUpdate = {
      taskId: id,
      priority: decision.priority as Priority,
      taskType: choice.startsWith("Accept") ? decision.zoneRecommended : TaskType.BACKLOG,
    };
    const snapshot = queryClient.getQueryData(["sprint", sprintId]);
    applyOptimistic([task]);
    try {
      await bulkUpdateMutation.mutateAsync({ tasks: [task] });
      setResolved((p) => ({ ...p, [id]: choice }));
      queryClient.invalidateQueries({ queryKey: ["task-list"] });
    } catch {
      queryClient.setQueryData(["sprint", sprintId], snapshot);
    }
  };

  const handleApprove = async () => {
    const selectedChanges = changes.filter((c) => checked[c.taskId]);

    if (selectedChanges.length === 0) {
      onOpenChange(false);
      return;
    }

    const optimisticTasks: TaskBulkUpdate[] = selectedChanges.map((c) => ({
      taskId: c.taskId,
      priority: c.priority as Priority,
      taskType: c.zoneRecommended,
    }));

    const snapshot = queryClient.getQueryData(["sprint", sprintId]);
    applyOptimistic(optimisticTasks);
    try {
      await applyChangesMutation.mutateAsync({
        changes: selectedChanges.map((c) => ({
          taskId: c.taskId,
          taskType: c.zoneRecommended,
          compositeScore: c.scoreAfter,
        })),
      });
      queryClient.invalidateQueries({ queryKey: ["task-list"] });
      queryClient.invalidateQueries({ queryKey: ["sprint", sprintId] });
      onOpenChange(false);
    } catch {
      queryClient.setQueryData(["sprint", sprintId], snapshot);
    }
  };

  // Sum expectedTimeHours for tasks that stay in Active (zone=ACTIVE & zoneRecommended=ACTIVE)
  const activeUsedHours =
    unchanged
      .filter((u) => u.zone === TaskType.ACTIVE)
      .reduce((sum, u) => sum + (u.expectedTimeHours ?? 0), 0) +
    changes
      .filter(
        (c) =>
          c.zoneBefore === TaskType.ACTIVE &&
          c.zoneRecommended === TaskType.ACTIVE
      )
      .reduce((sum, c) => sum + (c.expectedTimeHours ?? 0), 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="p-0 border-0 bg-transparent sm:max-w-[580px] max-h-[90vh]"
      >
        <VisuallyHidden>
          <DialogTitle>Reshuffle Complete</DialogTitle>
        </VisuallyHidden>
        <div
          className="flex flex-col overflow-hidden rounded-2xl max-h-[90vh]"
          style={{
            background: C.panel,
            border: `1px solid ${C.border}`,
            boxShadow: "0 24px 64px rgba(0,0,0,0.5)",
            color: C.text,
            fontFamily:
              "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
          }}
        >
          {/* Loading state */}
          {reshuffleMutation.isPending && (
            <div className="flex flex-col items-center justify-center py-20 px-5 gap-3">
              <Loader2 className="w-8 h-8 animate-spin" style={{ color: C.green }} />
              <span className="text-sm" style={{ color: C.sec }}>
                Reshuffling tasks...
              </span>
            </div>
          )}

          {/* Error state */}
          {reshuffleMutation.isError && (
            <div className="flex flex-col items-center justify-center py-20 px-5 gap-3">
              <span className="text-sm" style={{ color: C.red }}>
                Failed to reshuffle. Please try again.
              </span>
              <button
                onClick={() => onOpenChange(false)}
                className="text-xs cursor-pointer border-none rounded-md px-4 py-2"
                style={{ background: C.inner, color: C.sec }}
              >
                Close
              </button>
            </div>
          )}

          {/* Success state */}
          {data && (
            <>
              {/* Header */}
              <div
                className="shrink-0 px-5 pt-5 pb-3.5"
                style={{ borderBottom: `1px solid ${C.border}` }}
              >
                <div className="flex items-start justify-between mb-0.5">
                  <div>
                    <h2 className="text-lg font-extrabold m-0" style={{ color: C.text }}>
                      Reshuffle Complete
                    </h2>
                    <p className="text-[11px] m-0 mt-0.5" style={{ color: C.dim }}>
                      Review before approving
                    </p>
                  </div>
                  <button
                    onClick={() => onOpenChange(false)}
                    className="text-sm cursor-pointer border-none bg-transparent p-1 rounded-md transition-colors hover:bg-white/10"
                    style={{ color: C.sec }}
                  >
                    ✕
                  </button>
                </div>

                {/* Summary stats */}
                <div
                  className="flex flex-col gap-1.5 rounded-lg p-3 mt-3 mb-3"
                  style={{ background: C.card }}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] w-3.5 text-center" style={{ color: C.sec }}>
                      ↑
                    </span>
                    <span className="text-xs font-semibold" style={{ color: C.text }}>
                      {movedToActive} moved to Active
                    </span>
                  </div>
                  {decisions.length > 0 && (
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] w-3.5 text-center" style={{ color: C.sec }}>
                        ↓
                      </span>
                      <span className="text-xs font-semibold" style={{ color: C.text }}>
                        {decisions.length} leaving Active
                      </span>
                      <span className="text-[10px] font-semibold" style={{ color: C.amber }}>
                        — need your call
                      </span>
                    </div>
                  )}
                  {scoreShifts > 0 && (
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] w-3.5 text-center" style={{ color: C.sec }}>
                        ↕
                      </span>
                      <span className="text-xs font-semibold" style={{ color: C.text }}>
                        {scoreShifts} score shift{scoreShifts !== 1 ? "s" : ""}
                      </span>
                      <span className="text-[10px]" style={{ color: C.dim }}>
                        — same zone, score changed
                      </span>
                    </div>
                  )}
                </div>

                <CapacityBar
                  used={activeUsedHours}
                  total={data.capacity.allocatedHours}
                />
              </div>

              {/* Scrollable content */}
              <div className="flex-1 overflow-y-auto px-5 pb-4 min-h-0">
                {/* Leaving Active (Decisions) */}
                {visibleDecisions.length > 0 && (
                  <>
                    <SectionHeader
                      icon="⚠️"
                      title="Leaving Active"
                      badge={`${visibleDecisions.length}`}
                      badgeColor={C.amber}
                      expanded={sections.decisions}
                      onToggle={() => toggle("decisions")}
                    />
                    {sections.decisions && (
                      <div className="pt-1.5">
                        {visibleDecisions.map((d) => (
                          <DecisionCard
                            key={d.taskId}
                            item={d}
                            onConfirm={handleDecisionConfirm}
                          />
                        ))}
                      </div>
                    )}
                  </>
                )}

                {/* Changes */}
                {changes.length > 0 && (
                  <>
                    <SectionHeader
                      icon="↕"
                      title="Changes"
                      badge={`${cApproved}/${cTotal}`}
                      badgeColor={cApproved === cTotal ? C.green : C.sec}
                      expanded={sections.changes}
                      onToggle={() => toggle("changes")}
                    />
                    {sections.changes && (
                      <div className="pt-1.5">
                        <div className="flex items-center gap-1.5 mb-1.5">
                          <span
                            onClick={() => {
                              const all = Object.values(checked).every(Boolean);
                              setChecked(
                                Object.fromEntries(
                                  changes.map((c) => [c.taskId, !all])
                                )
                              );
                            }}
                            className="text-[9px] font-semibold cursor-pointer"
                            style={{ color: C.blue }}
                          >
                            {Object.values(checked).every(Boolean)
                              ? "Uncheck all"
                              : "Check all"}
                          </span>
                          <span className="text-[9px]" style={{ color: C.dim }}>
                            · Uncheck to reject
                          </span>
                        </div>
                        {changes.map((c) => (
                          <ChangeRow
                            key={c.taskId}
                            item={c}
                            checked={checked[c.taskId]}
                            onToggle={() =>
                              setChecked((p) => ({
                                ...p,
                                [c.taskId]: !p[c.taskId],
                              }))
                            }
                            expanded={expandedId === c.taskId}
                            onExpand={() =>
                              setExpandedId((p) =>
                                p === c.taskId ? null : c.taskId
                              )
                            }
                          />
                        ))}
                      </div>
                    )}
                  </>
                )}

                {/* Unchanged */}
                {unchanged.length > 0 && (
                  <>
                    <SectionHeader
                      icon="—"
                      title="Unchanged"
                      badge={`${unchanged.length}`}
                      muted
                      expanded={sections.unchanged}
                      onToggle={() => toggle("unchanged")}
                    />
                    {sections.unchanged && (
                      <div className="pt-1.5">
                        {unchanged.map((u) => (
                          <div
                            key={u.taskId}
                            className="flex items-center gap-2 py-1.5 px-1 mb-px"
                          >
                            <span className="text-[10px] w-3.5 text-center shrink-0" style={{ color: C.dim }}>—</span>
                            <span className="text-[13px] font-semibold flex-1 min-w-0 truncate" style={{ color: C.sec }}>
                              {u.title}
                            </span>
                            <div className="flex items-center gap-1.5 shrink-0">
                              {u.pinned && <Lock className="w-3 h-3" style={{ color: C.amber }} />}
                              <ZonePill zone={taskTypeToZoneLabel(u.zone)} />
                              <span className="text-xs font-extrabold font-mono" style={{ color: C.dim }}>
                                {u.score}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Footer */}
              <div
                className="shrink-0 px-5 py-3"
                style={{
                  borderTop: `1px solid ${C.border}`,
                  background: C.panel,
                }}
              >
                <div className="flex gap-2.5 mb-2.5">
                  {visibleDecisions.length > 0 && (
                    <>
                      <span className="text-[10px] font-semibold" style={{ color: C.amber }}>
                        {visibleDecisions.length} pending decision{visibleDecisions.length !== 1 ? "s" : ""}
                      </span>
                      <span className="text-[10px]" style={{ color: C.dim }}>·</span>
                    </>
                  )}
                  <span className="text-[10px] font-semibold" style={{ color: C.sec }}>
                    {cApproved}/{cTotal} changes
                  </span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => onOpenChange(false)}
                    className="flex-1 py-2.5 rounded-lg text-[11px] font-semibold cursor-pointer transition-colors hover:bg-white/5"
                    style={{
                      border: `1px solid ${C.border}`,
                      background: "transparent",
                      color: C.sec,
                    }}
                  >
                    Reject all
                  </button>
                  <button
                    disabled={visibleDecisions.length > 0 || applyChangesMutation.isPending}
                    onClick={handleApprove}
                    className="flex-2 py-2.5 rounded-lg border-none text-xs font-bold transition-all duration-200"
                    style={{
                      background: visibleDecisions.length === 0 ? C.green : `${C.dim}40`,
                      color: visibleDecisions.length === 0 ? "#0d1117" : C.dim,
                      cursor: visibleDecisions.length === 0 && !applyChangesMutation.isPending ? "pointer" : "not-allowed",
                      opacity: visibleDecisions.length === 0 ? 1 : 0.6,
                    }}
                  >
                    {applyChangesMutation.isPending
                      ? "Applying..."
                      : visibleDecisions.length > 0
                        ? `Resolve ${visibleDecisions.length} decision${visibleDecisions.length !== 1 ? "s" : ""} first`
                        : `Approve ${cApproved} Change${cApproved !== 1 ? "s" : ""} ✓`}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
