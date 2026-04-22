"use client";

import { PieChart, Pie, Cell } from "recharts";

interface GoalItem {
  label: string;
  count: number;
  percentage: number;
  color: string;
}

interface GoalAlignmentCardProps {
  goals: GoalItem[];
  badge?: string;
}

export function GoalAlignmentCard({ goals, badge }: GoalAlignmentCardProps) {
  return (
    <div className="bg-card border border-border rounded-xl p-6 flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="body-semi-bold text-white">Goal Alignment</h3>
        {badge && (
          <span className="text-xs font-medium text-emerald-400 bg-emerald-400/15 rounded-full px-3 py-1">
            {badge}
          </span>
        )}
      </div>

      {/* Donut charts row */}
      <div className="flex items-center justify-center min-h-[120px]">
        {goals?.map((goal, i) => {
          const filled = [{ value: goal.percentage }, { value: 100 - goal.percentage }];
          const track = [{ value: 1 }];
          return (
            <div key={i} className="relative w-[100px] h-[100px]">
              <PieChart width={100} height={100}>
                {/* Background track */}
                <Pie
                  data={track}
                  cx="50%"
                  cy="50%"
                  innerRadius={30}
                  outerRadius={45}
                  dataKey="value"
                  stroke="none"
                  isAnimationActive={false}
                >
                  <Cell fill="rgba(255,255,255,0.12)" />
                </Pie>
                {/* Filled arc */}
                <Pie
                  data={filled}
                  cx="50%"
                  cy="50%"
                  innerRadius={30}
                  outerRadius={45}
                  dataKey="value"
                  startAngle={0}
                  endAngle={-360}
                  stroke="none"
                >
                  <Cell fill={goal.color} />
                  <Cell fill="transparent" />
                </Pie>
              </PieChart>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-sm font-semibold text-white">
                  {Math.round(goal.percentage)}%
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="space-y-3 border-t border-border pt-4">
        {goals?.map((goal, i) => (
          <div key={i} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div
                className="w-2 h-2 rounded-full shrink-0"
                style={{ backgroundColor: goal.color }}
              />
              <span className="detail text-muted-foreground">{goal.label}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="body-semi-bold w-6 text-right" style={{ color: goal.color }}>{goal.count}</span>
              <span className="detail w-12 text-right" style={{ color: goal.color }}>{goal.percentage}%</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
