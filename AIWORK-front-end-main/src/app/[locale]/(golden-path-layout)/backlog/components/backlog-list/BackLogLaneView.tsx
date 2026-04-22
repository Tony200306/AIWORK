"use client";

import { Button } from "@/components/ui/button";
import {
  Task,
  TaskStatus,
  statusToLabelMapping,
} from "../../../../../../models/Task";
import BackLogItem from "./BackLogItem";

interface BackLogLaneViewProps {
  tasks: Task[];
  breadcrumbs: Record<string, string[]>;
}

export default function BackLogLaneView({
  tasks,
  breadcrumbs,
}: BackLogLaneViewProps) {
  const tasksByStatus = tasks.reduce((acc, task) => {
    const status = task.status || TaskStatus.TODO;
    if (!acc[status]) {
      acc[status] = [];
    }
    acc[status].push(task);
    return acc;
  }, {} as Record<TaskStatus, Task[]>);

  const statusColors: Record<TaskStatus, string> = {
    [TaskStatus.TODO]: "bg-orange-500",
    [TaskStatus.DOING]: "bg-blue-500",
    [TaskStatus.DONE]: "bg-green-500",
  };

  const statusLabels = statusToLabelMapping();

  const orderedStatuses = [
    TaskStatus.TODO,
    TaskStatus.DOING,
    TaskStatus.DONE,
  ];

  return (
    <div className="space-y-6">
      {orderedStatuses?.map((status) => {
        const tasksInStatus = tasksByStatus[status] || [];
        if (tasksInStatus.length === 0) return null;

        return (
          <div key={status} className=" border border-border rounded-xl">
            <div
              className={`${statusColors[status]} flex justify-between px-6 rounded-t-xl py-3`}
            >
              <h2 className="text-white font-semibold text-base">
                {statusLabels[status]}
              </h2>
              <div className="flex gap-2 items-center">
                <Button>Bulk move to {statusToLabelMapping()[status]} </Button>
                <span>{tasksByStatus[status].length + " tasks"}</span>
              </div>
            </div>
            <div className="p-4 flex flex-col gap-2">
              {tasksInStatus?.map((task) => (
                <BackLogItem
                  key={task.id}
                  item={task}
                  breadcrumb={breadcrumbs[task.id] || []}
                  onShowClick={() => console.log("Show clicked:", task.id)}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
