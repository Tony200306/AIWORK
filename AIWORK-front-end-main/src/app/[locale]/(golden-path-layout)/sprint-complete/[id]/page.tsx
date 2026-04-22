"use client";

import { useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { RouteConfig } from "@/constants/RouteConfig";
import { useGetSprint } from "@/hooks/shared/useGetSprint";
import { SprintItem } from "@/models/Sprint";
import { ActualVsPlannedBar } from "../components/ActualVsPlannedBar";
import { CommitmentCard } from "../components/CommitmentCard";
import { GoalAlignmentCard } from "../components/GoalAlignmentCard";
import { PriorityCard } from "../components/PriorityCard";
import { FeedbackSection } from "../components/FeedbackSection";
import { IncompletedTasksDialog } from "../components/IncompletedTasksDialog";

function getAllItems(items: {  TODO: SprintItem[]; DOING: SprintItem[]; DONE: SprintItem[] }): SprintItem[] {
  return [...items.TODO, ...items.DOING, ...items.DONE];
}

function computePlannedMinutes(allItems: SprintItem[]): number {
  return allItems.reduce((sum, item) => sum + (item.task.expectedTimeHours ?? 0) * 60, 0);
}

function computeActualMinutes(doneItems: SprintItem[]): number {
  return doneItems.reduce((sum, item) => sum + (item.plannedMinutes ?? 0), 0);
}

// TODO: Replace with real goal alignment data when API is ready
const MOCK_GOALS = [
  { label: "Business Goals", count: 7, percentage: 25, color: "#F59E0B" },
  { label: "Client A's Goals", count: 5, percentage: 17.8, color: "#F87171" },
  { label: "Weekly Goals", count: 6, percentage: 21.4, color: "#34D399" },
];

function getBadge(doneCount: number, totalCount: number): string | undefined {
  if (totalCount === 0) return undefined;
  const ratio = doneCount / totalCount;
  if (ratio >= 0.9) return "Sprint Legend";
  if (ratio >= 0.7) return "Great Sprint";
  if (ratio >= 0.5) return "Good Effort";
  return undefined;
}

export default function SprintCompletePage() {
  const params = useParams();
  const router = useRouter();
  const sprintId = params.id as string;
  const [showIncompletedDialog, setShowIncompletedDialog] = useState(false);

  const { data: sprintData, isLoading } = useGetSprint(sprintId);
  const sprint = sprintData?.data;

  const { allItems, doneItems, incompletedItems, totalItems, carriedForwards, plannedMinutes, actualMinutes, badge } = useMemo(() => {
    if (!sprint?.items) {
      return { allItems: [], doneItems: [], incompletedItems: [], totalItems: 0, carriedForwards: 0, plannedMinutes: 0, actualMinutes: 0, badge: undefined };
    }

    const all = getAllItems(sprint.items);
    const done = sprint.items.DONE ?? [];
    const notDone = [...(sprint.items.TODO ?? []), ...(sprint.items.DOING ?? [])];
    const planned = computePlannedMinutes(all);
    const actual = computeActualMinutes(done);
    const b = getBadge(done.length, all.length);

    return {
      allItems: all,
      doneItems: done,
      incompletedItems: notDone,
      totalItems: all.length,
      carriedForwards: notDone.length,
      plannedMinutes: planned,
      actualMinutes: actual,
      badge: b,
    };
  }, [sprint]);

  const handleStartNewSprint = () => {
    if (incompletedItems.length > 0) {
      setShowIncompletedDialog(true);
    } else {
      router.push(RouteConfig.BrainDumpPage.path);
    }
  };

  if (isLoading) {
    return (
      <div className="w-full max-w-5xl mx-auto px-4 py-10 md:py-16 space-y-10">
        <div className="text-center space-y-2">
          <Skeleton className="h-10 w-64 mx-auto" />
          <Skeleton className="h-5 w-96 mx-auto" />
        </div>
        <Skeleton className="h-20 w-full" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
        </div>
      </div>
    );
  }

  if (!sprint) {
    return (
      <div className="w-full max-w-5xl mx-auto px-4 py-20 text-center">
        <h1 className="h2 text-white mb-4">Sprint not found</h1>
        <Button variant="outline" onClick={() => router.push(RouteConfig.BackLog.path)}>
          Go to Backlog
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-10 md:py-16 space-y-10">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="h1 text-white">Sprint Complete!</h1>
        <p className="body text-muted-foreground">
          You kept your word. Nicely done. Here are your achievements:
        </p>
      </div>

      {/* Actual vs Planned */}
      <ActualVsPlannedBar
        plannedMinutes={plannedMinutes}
        capacityMinutes={sprint.capacityMinutes}
        actualMinutes={actualMinutes}
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <CommitmentCard
          completed={doneItems.length}
          total={totalItems}
          plannedAndDone={doneItems.length}
          addedMidSprint={0}
          carriedForwards={carriedForwards}
          badge={badge}
        />
        <GoalAlignmentCard goals={MOCK_GOALS} badge={badge} />
        <PriorityCard allItems={allItems} badge={badge} />
      </div>

      {/* Feedback */}
      <FeedbackSection />

      {/* Navigation */}
      <div className="text-center space-y-5">
        <h2 className="sub-header-semi-bold text-white">
         Ready to start new sprint?
        </h2>
        <div className="flex justify-center gap-4">
          <Button
            variant="outline"
            className="min-w-[780px]  h-10 text-base rounded-lg bg-sidebar-accent"
            onClick={handleStartNewSprint}
          >
            Start New Sprint
          </Button>
        </div>
      </div>

      <IncompletedTasksDialog
        open={showIncompletedDialog}
        onOpenChange={setShowIncompletedDialog}
        incompletedItems={incompletedItems}
        onComplete={(destination) => {
          setShowIncompletedDialog(false);
          if (destination === "NEXT_SPRINT") {
            router.push(RouteConfig.StartNewSprint.path);
          } else {
            router.push(RouteConfig.BrainDumpPage.path);
          }
        }}
      />
    </div>
  );
}
