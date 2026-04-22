"use client";

interface CommitmentCardProps {
  completed: number;
  total: number;
  plannedAndDone: number;
  addedMidSprint: number;
  carriedForwards: number;
  badge?: string;
}

export function CommitmentCard({
  completed,
  total,
  plannedAndDone,
  addedMidSprint,
  carriedForwards,
  badge,
}: CommitmentCardProps) {
  return (
    <div className="bg-card border border-border rounded-xl p-6 flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="body-semi-bold text-white">Commitment</h3>
        {badge && (
          <span className="text-xs font-medium text-emerald-400 bg-emerald-400/15 rounded-full px-3 py-1">
            {badge}
          </span>
        )}
      </div>

      {/* Main stat */}
      <div className="text-center min-h-[120px] flex flex-col items-center justify-center">
        <div className="flex items-baseline justify-center gap-1">
          <span className="text-4xl font-bold text-emerald-400">{completed}</span>
          <span className="text-xl text-muted-foreground">/ {total}</span>
        </div>
        <p className="text-sm text-muted-foreground mt-1">Tasks Completed</p>
      </div>

      {/* Breakdown */}
      <div className="space-y-3 border-t border-border pt-4">
        <div className="flex items-center justify-between">
          <span className="detail text-muted-foreground">Planned & Done</span>
          <span className="body-semi-bold text-emerald-400">{plannedAndDone}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="detail text-muted-foreground">Added Mid-Sprint</span>
          <span className="body-semi-bold text-emerald-400">+{addedMidSprint}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="detail text-muted-foreground">Carried forwards</span>
          <span className="body-semi-bold text-white">{carriedForwards}</span>
        </div>
      </div>
    </div>
  );
}
