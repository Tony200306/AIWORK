import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { RouteConfig } from "@/constants/RouteConfig";
import { useRouter } from "next/navigation";
import { formatTimeFromMinutes as formatDuration } from "@/utils/formatTimeDisplay";

interface ConfirmModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tasksCount?: number;
  plannedTime?: string;
  totalPlannedMinutes?: number;
  totalCapacityMinutes?: number;
  sprintDuration?: string;
  onStartSprint?: () => void;
  onAdjustPlan?: () => void;
  isLoading?: boolean;
}

export function ConfirmModal({
  open,
  onOpenChange,
  tasksCount,
  plannedTime,
  totalPlannedMinutes = 0,
  totalCapacityMinutes = 480,
  sprintDuration,
  onStartSprint,
  onAdjustPlan,
  isLoading = false,
}: ConfirmModalProps) {
  const router = useRouter();
  const isOverCapacity = totalPlannedMinutes > totalCapacityMinutes;
  const overByMinutes = totalPlannedMinutes - totalCapacityMinutes;

  // Over capacity state
  if (isOverCapacity) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[400px] md:max-w-[560px] bg-[#1a1a1a] border-border">
          <DialogHeader>
            <div className="flex justify-around mb-6 mt-4">
              <div className="flex flex-col items-center gap-2">
                <div className="w-20 h-20 rounded-full border-2 border-red-500 flex items-center justify-center">
                  <span className="text-2xl font-bold text-white">
                    {tasksCount}
                  </span>
                </div>
                <span className="text-xs text-gray-400 uppercase">Tasks</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <div className="w-20 h-20 rounded-full border-2 border-red-500 flex items-center justify-center">
                  <span className="text-lg font-bold text-center text-white">
                    {plannedTime?.split(" ")[0]}
                  </span>
                </div>
                <span className="text-xs text-gray-400 uppercase">Planned</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <div className="w-20 h-20 rounded-full border-2 border-red-500 flex items-center justify-center">
                  <span className="text-lg font-bold text-white">
                    {sprintDuration === "Today" ? "1-Day" : sprintDuration}
                  </span>
                </div>
                <span className="text-xs text-gray-400 uppercase">Sprint</span>
              </div>
            </div>

            <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-2 mb-2">
              <p className="text-center text-sm text-red-400">
                This sprint is still over capacity.
              </p>
            </div>
            <p className="text-center text-sm text-red-400 mb-4">
              Over by {formatDuration(overByMinutes)}
            </p>

            <DialogTitle className="text-center text-xl text-white">
              Almost there. Let&apos;s make this sprint real.
            </DialogTitle>
            <DialogDescription className="text-center text-gray-400">
              Trim a few low-impact tasks so you can commit without scrambling.
            </DialogDescription>

            <h3 className="text-center text-lg font-semibold text-white mt-4">
              Ready to start?
            </h3>
          </DialogHeader>

          <div className="flex flex-col gap-3 mt-4">
            <Button
              onClick={() => {
                if (onStartSprint) {
                  onStartSprint();
                } 
              }}
              disabled={true}
              className="rounded-md w-full bg-white/50 hover:bg-gray-200 text-black/50 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Start my sprint
            </Button>
            <Button
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
              className="rounded-md bg-white text-sm text-black font-medium hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              You&apos;re overcommitted - Change Sprint Window
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // Under capacity state (fits)
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px] bg-[#1a1a1a] border-border">
        <DialogHeader>
          <div className="flex justify-around mb-6 mt-4">
            <div className="flex flex-col items-center gap-2">
              <div className="w-20 h-20 rounded-full border-2 border-green-500 flex items-center justify-center">
                <span className="text-2xl font-bold text-white">
                  {tasksCount}
                </span>
              </div>
              <span className="text-xs text-gray-400 uppercase">Tasks</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="w-20 h-20 rounded-full border-2 border-green-500 flex items-center justify-center">
                <span className="text-lg font-bold text-center text-white">
                  {plannedTime?.split(" ")[0]}
                </span>
              </div>
              <span className="text-xs text-gray-400 uppercase">Planned</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="w-20 h-20 rounded-full border-2 border-green-500 flex items-center justify-center">
                <span className="text-lg font-bold text-white">
                  {sprintDuration}
                </span>
              </div>
              <span className="text-xs text-gray-400 uppercase">Sprint</span>
            </div>
          </div>

          <div className="bg-green-500/20 border border-green-500/50 rounded-lg p-2 mb-4">
            <p className="text-center text-sm text-green-400">
              This sprint fits your real week.
            </p>
          </div>

          <DialogTitle className="text-center text-xl text-white">
            Nice - this sprint fits.
          </DialogTitle>
          <DialogDescription className="text-center text-gray-400">
            You&apos;ve got a plan you can actually follow through on. Ready to
            start?
          </DialogDescription>

          <h3 className="text-center text-lg font-semibold text-white mt-4">
            Ready to start?
          </h3>
        </DialogHeader>

        <div className="flex flex-col gap-3 mt-4">
          <Button
            onClick={() => {
              if (onStartSprint) {
                onStartSprint();
              } else {
                router.push(RouteConfig.MasterKanBan.path);
              }
            }}
            disabled={isLoading || !tasksCount || tasksCount === 0}
            className="rounded-md w-full bg-white hover:bg-gray-200 text-black font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Creating Sprint..." : "Start my sprint"}
          </Button>
          <Button
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
            className="rounded-md bg-secondary text-sm text-white hover:bg-sidebar-border/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Not yet - adjust plan
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
