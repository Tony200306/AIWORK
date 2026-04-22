"use client";

import { PieChart, Pie, Cell } from "recharts";
import { SprintItem } from "@/models/Sprint";
import { Priority, priorityToLabelMapping } from "@/models/Task";

const PRIORITY_COLORS: Record<Priority, string> = {
  [Priority.Lowest]: "#6B7280",
  [Priority.Low]: "#00ED9E",
  [Priority.Medium]: "#3B82F6",
  [Priority.High]: "#F97316",
  [Priority.Highest]: "#EF4444",
};

const PRIORITY_ORDER: Priority[] = [
  Priority.Lowest,
  Priority.Low,
  Priority.Medium,
  Priority.High,
  Priority.Highest,
];

interface PriorityCardProps {
  allItems: SprintItem[];
  badge?: string;
}

export function PriorityCard({ allItems, badge }: PriorityCardProps) {
  const labels = priorityToLabelMapping();

  const priorityCounts = PRIORITY_ORDER?.map((priority) => {
    const count = allItems?.filter((item) => item.task.priority === priority).length;
    return {
      priority,
      label: labels[priority] + " Priority",
      count,
      color: PRIORITY_COLORS[priority],
    };
  })?.filter((item) => item.count > 0);

  const totalTasks = allItems.length;

  const chartData = priorityCounts?.map((item) => ({
    name: item.label,
    value: item.count,
  }));

  return (
    <div className="bg-card border border-border rounded-xl p-6 flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="body-semi-bold text-white">By Priority</h3>
        {badge && (
          <span className="text-xs font-medium text-emerald-400 bg-emerald-400/15 rounded-full px-3 py-1">
            {badge}
          </span>
        )}
      </div>

      {/* Donut chart */}
      <div className="flex justify-center items-center min-h-[120px]">
        <div className="relative w-[120px] h-[120px]">
          <PieChart width={120} height={120}>
            {/* Background track */}
            <Pie
              data={[{ value: 1 }]}
              cx="50%"
              cy="50%"
              innerRadius={38}
              outerRadius={55}
              dataKey="value"
              stroke="none"
              isAnimationActive={false}
            >
              <Cell fill="rgba(255,255,255,0.12)" />
            </Pie>
            {/* Filled segments */}
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={38}
              outerRadius={55}
              dataKey="value"
              startAngle={0}
              endAngle={-360}
              stroke="none"
            >
              {priorityCounts?.map((item, i) => (
                <Cell key={i} fill={item.color} />
              ))}
            </Pie>
          </PieChart>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-lg font-bold text-white">{totalTasks}</span>
            <span className="text-[9px] text-muted-foreground">Total Tasks</span>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="space-y-3 border-t border-border pt-4">
        {priorityCounts?.map((item, i) => (
          <div key={i} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div
                className="w-2 h-2 rounded-full shrink-0"
                style={{ backgroundColor: item.color }}
              />
              <span className="detail text-muted-foreground">{item.label}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="body-semi-bold w-6 text-right" style={{ color: item.color }}>{item.count}</span>
              <span className="detail w-12 text-right" style={{ color: item.color }}>
                {totalTasks > 0 ? ((item.count / totalTasks) * 100).toFixed(1) : 0}%
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
