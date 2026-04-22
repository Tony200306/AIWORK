import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Trash2,
  Layers,
  Shuffle,
  BarChart3,
  CheckCheck,
} from "lucide-react";

interface MasterKanbanToolBarProps {
  hasSelection?: boolean;
  isAllSelected?: boolean;
  onDelete?: () => void;
  onBacklog?: () => void;
  onShuffle?: () => void;
  onDashboard?: () => void;
  onSelectAll?: () => void;
}

export default function MasterKanbanToolBar({
  hasSelection = false,
  isAllSelected = false,
  onDelete,
  onBacklog,
  onShuffle,
  onDashboard,
  onSelectAll,
}: MasterKanbanToolBarProps) {
  const dimmed = !hasSelection;

  const actionBtnClass = cn(
    "rounded-lg px-6 py-2 border-border bg-secondary-card/70 text-foreground",
    dimmed
      ? "opacity-40 pointer-events-none"
      : "hover:bg-secondary-card",
  );

  const alwaysActiveBtnClass =
    "rounded-lg px-6 py-2 border-border bg-secondary-card text-foreground hover:bg-secondary-card/80";

  const shuffleBtnClass =
    "rounded-full w-9 h-9 border-none bg-white text-black hover:bg-gray-100 cursor-pointer";

  return (
    <div className="inline-flex items-center justify-center gap-3 p-2 px-4 bg-sidebar rounded-lg">
      <Button variant="outline" className={actionBtnClass} onClick={onDelete} disabled={dimmed}>
        <Trash2 className="w-5 h-5 mr-2" />
        Delete
      </Button>

      <Button variant="outline" className={alwaysActiveBtnClass} onClick={onBacklog}>
        <Layers className="w-5 h-5 mr-2" />
        Backlog
      </Button>

      <Button variant="secondary" size="icon" className={shuffleBtnClass} onClick={onShuffle}>
        <Shuffle className="w-6 h-6" />
      </Button>

      <Button variant="outline" className={alwaysActiveBtnClass} onClick={onDashboard}>
        <BarChart3 className="w-5 h-5 mr-2" />
        Dashboard
      </Button>
      <Button
        variant="outline"
        className="rounded-lg px-6 py-2 bg-secondary-card/70 border-border hover:bg-secondary-card text-foreground"
        onClick={onSelectAll}
      >
        <CheckCheck className="w-5 h-5 mr-2" />
        {isAllSelected ? "Deselect All" : "Select All"}
      </Button>
    </div>
  );
}
