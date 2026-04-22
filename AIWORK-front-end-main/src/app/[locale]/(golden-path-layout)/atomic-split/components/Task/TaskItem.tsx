import { Tag } from "@/components/shared/ReactComponent/components/Tag/src/Tag";
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { useCreateStep } from "@/hooks/shared/useCreateStep";
import { useUpdateStep } from "@/hooks/shared/useUpdateStep";
import classNames from "classnames";
import { Check, ChevronUp, PenLine, Plus } from "lucide-react";
import { useState } from "react";
import { useParams } from "next/navigation";
import { Task, Step } from "../../../../../../models/Task";
import { TagOptionIcon } from "@/components/icon/TagOptionIcon";

interface Props {
  task: Task;
  variant?: "dark" | "light";
  onClick?: (taskId: string) => void;
  onEditTags?: (taskId: string) => void;
  isSelected?: boolean;
  className?: string;
  isStreaming?: boolean;
}

const formatEstimate = (hours: number | null | undefined): string => {
  if (!hours) return "Est. N/A";

  const totalMinutes = hours * 60;
  const wholeHours = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;

  if (wholeHours > 0 && mins > 0) {
    return `Est. ${wholeHours}h ${Math.round(mins)}m`;
  } else if (wholeHours > 0) {
    return `Est. ${wholeHours}h`;
  } else {
    // If less than 1 minute, round to 2 decimal places
    if (mins < 1) {
      const rounded = parseFloat(mins.toFixed(2));
      return `Est. ${rounded}m`;
    }
    return `Est. ${Math.round(mins)}m`;
  }
};

const formatStepMinutes = (minutes: number | null | undefined): string => {
  if (!minutes) return "N/A";
  if (minutes >= 60) {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${Math.round(mins)}m` : `${hours}h`;
  }
  // If less than 1 minute, round to 2 decimal places
  if (minutes < 1) {
    const rounded = parseFloat(minutes.toFixed(2));
    return `${rounded}m`;
  }
  return `${Math.round(minutes)}m`;
};

export default function TaskItem({
  className,
  task,
  onClick,
  onEditTags,
  isSelected = false,
  isStreaming = false,
}: Props) {
  const params = useParams();
  const [isEditing, setIsEditing] = useState(false);
  const [isAddingStep, setIsAddingStep] = useState(false);
  const [editingStepId, setEditingStepId] = useState<string | null>(null);
  const [editStepTitle, setEditStepTitle] = useState("");
  const [editStepMinutes, setEditStepMinutes] = useState("");
  const [newStepTitle, setNewStepTitle] = useState("");
  const [newStepMinutes, setNewStepMinutes] = useState("");

  const createStepMutation = useCreateStep({
    setIsAdding: setIsAddingStep,
    brainDumpId: params.id as string
  });
  const updateStepMutation = useUpdateStep({
    setIsEditing: () => setEditingStepId(null),
    brainDumpId: params.id as string
  });

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditing(true);
  };

  const handleConfirm = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditing(false);
    setIsAddingStep(false);
    setEditingStepId(null);
    setNewStepTitle("");
    setNewStepMinutes("");
  };

  const handleCancel = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditing(false);
    setIsAddingStep(false);
    setEditingStepId(null);
    setNewStepTitle("");
    setNewStepMinutes("");
  };

  const handleAddStepClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingStepId(null); // Cancel editing if adding
    setIsAddingStep(true);
  };

  const handleSaveNewStep = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!newStepTitle.trim()) return;

    const minutes = parseInt(newStepMinutes) || 10;
    const orderIndex = (task?.steps?.length || 0) + 1;

    createStepMutation.mutate({
      taskId: task.id,
      title: newStepTitle.trim(),
      description: "",
      orderIndex,
      userEstMinutes: minutes,
    });

    setNewStepTitle("");
    setNewStepMinutes("");
  };

  const handleStepClick = (e: React.MouseEvent, step: Step) => {
    e.stopPropagation();
    if (!isEditing) return;

    setIsAddingStep(false); // Cancel adding if editing
    setEditingStepId(step.id);
    setEditStepTitle(step.title);
    setEditStepMinutes((step.userEstMinutes || step.sysEstMinutes || 0).toString());
  };

  const handleSaveEditStep = (e: React.MouseEvent, step: Step) => {
    e.stopPropagation();
    if (!editStepTitle.trim()) return;

    updateStepMutation.mutate({
      taskId: task.id,
      stepId: step.id,
      title: editStepTitle.trim(),
      description: editStepTitle.trim(),
      orderIndex: step.orderIndex || 0,
      userEstMinutes: parseInt(editStepMinutes) || 10,
    });
  };

  // Handle desktop click - select task
  const handleDesktopClick = (e: React.MouseEvent) => {
    // Only trigger on desktop (not mobile)
    if (window.innerWidth >= 768) {
      e.preventDefault(); // Prevent accordion toggle on desktop
      onClick?.(task.id);
    }
  };

  // Handle mobile press - select task
  const handleMobilePress = (e: React.MouseEvent) => {
    if (window.innerWidth < 768) {
      e.preventDefault(); // Prevent accordion trigger
      e.stopPropagation();
      onClick?.(task.id); // Select this task
    }
  };

  return (
    <AccordionItem
      value={task.id}
      onClick={(e) => {
        handleMobilePress(e);
        handleDesktopClick(e);
      }}
      className={classNames(
        "border-2 rounded-2xl p-4 cursor-pointer transition-all hover:scale-[1.02] bg-secondary border-border",
        isSelected && "border-white md:bg-card-foreground md:border-card-foreground",
        className
      )}
    >
      {/* Content row - outside AccordionTrigger */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-2 md:gap-4 flex-1">
          {/* Title row */}
          <div className="flex items-center justify-between md:flex-1">
            <span
              className={`transition-all duration-200 ease-in-out text-sm md:text-lg font-semibold leading-tight text-left
              text-secondary-foreground
              ${isSelected ? "md:text-secondary" : "md:text-secondary-foreground"}`}
            >
              {task.title}
            </span>
          </div>

          {/* Steps & estimate */}
          <div className="flex md:items-start gap-3">
            <div className="flex flex-col md:items-end shrink-0">
              <span
                className={`text-[13px] md:text-sm text-muted-foreground ${
                  isSelected ? "md:text-secondary/70" : ""
                }`}
              >
                {task?.steps?.length} steps
              </span>
              <span
                className={`text-[13px] md:text-sm text-muted-foreground ${
                  isSelected ? "md:text-secondary/70" : ""
                }`}
              >
                {formatEstimate(task.expectedTimeHours)}
              </span>
            </div>
            {isStreaming ? null : (
              <PenLine
                size={16}
                onClick={(e) => {
                  e.stopPropagation();
                  if (!isStreaming) {
                    onEditTags?.(task.id);
                  }
                }}
                className={`hidden md:block shrink-0 cursor-pointer ${
                  isSelected ? "text-black" : "text-secondary-foreground"
                }`}
              />
            )}
          </div>
        </div>

        {/* AccordionTrigger - only contains ChevronUp */}
        <AccordionTrigger
          className="p-0 hover:no-underline md:hidden flex-none group"
          onClick={(e) => e.stopPropagation()}
          icon={
            <ChevronUp
              size={20}
              className="shrink-0 transition-transform duration-200 text-muted-foreground rotate-180 group-data-[state=open]:rotate-0"
            />
          }
        />
      </div>

      <div className="flex justify-between items-center mt-2">
        {/* Tags - always visible */}
        <div className="flex flex-wrap gap-1">
          {(task?.tags || [])?.map((tag) => (
            <Tag
              key={tag.id}
              variant="pill"
              dotColor={tag.color ?? null}
              bordered={false}
              className="text-[13px]! h-7 md:text-xs! md:h-auto text-foreground!"
            >
              {tag.name}
            </Tag>
          ))}
        </div>
      </div>

      {/* Mobile accordion content - steps list */}
      <AccordionContent className="md:hidden pt-4 pb-0">
        {/* Divider */}
        <div className="border-t border-border mb-4" />

        {/* Steps list */}
        <div className="flex flex-col gap-3">
          {(task?.steps || [])
            .sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0))
            ?.map((step) => (
              <div key={step.id}>
                {isEditing && editingStepId === step.id ? (
                  /* Edit mode for this step */
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground leading-none">•</span>
                    <Input
                      autoFocus
                      value={editStepTitle}
                      onChange={(e) => setEditStepTitle(e.target.value)}
                      placeholder="Step title"
                      className="flex-1 h-8 text-sm bg-transparent border-border"
                      onClick={(e) => e.stopPropagation()}
                      onKeyDown={(e) => e.stopPropagation()}
                    />
                    <Input
                      value={editStepMinutes}
                      onChange={(e) => setEditStepMinutes(e.target.value)}
                      placeholder="10"
                      type="number"
                      className="w-14 h-8 text-sm bg-transparent border-border text-center px-1"
                      onClick={(e) => e.stopPropagation()}
                      onKeyDown={(e) => e.stopPropagation()}
                    />m
                    <button
                      onClick={(e) => handleSaveEditStep(e, step)}
                      disabled={!editStepTitle.trim() || updateStepMutation.isPending}
                      className="p-1.5 rounded-full bg-accent text-white disabled:opacity-50"
                    >
                      <Check size={14} />
                    </button>
                  </div>
                ) : (
                  /* Normal display */
                  <div
                    className={`flex items-start justify-between gap-4 ${isEditing ? "cursor-pointer" : ""}`}
                    onClick={(e) => handleStepClick(e, step)}
                  >
                    <div className="flex items-start gap-2">
                      <span className="text-muted-foreground leading-none">•</span>
                      <span className="text-sm text-secondary-foreground">
                        {step.title}
                      </span>
                    </div>
                    <span className="text-[13px] text-muted-foreground shrink-0">
                      {formatStepMinutes(step.sysEstMinutes || step.userEstMinutes)}
                    </span>
                  </div>
                )}
              </div>
            ))}

          {/* Add step input row */}
          {isEditing && isAddingStep && (
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground leading-none">•</span>
              <Input
                autoFocus
                value={newStepTitle}
                onChange={(e) => setNewStepTitle(e.target.value)}
                placeholder="Step title"
                className="flex-1 h-8 text-sm bg-transparent border-border"
                onClick={(e) => e.stopPropagation()}
                onKeyDown={(e) => e.stopPropagation()}
              />
              <Input
                value={newStepMinutes}
                onChange={(e) => setNewStepMinutes(e.target.value)}
                placeholder="10"
                type="number"
                className="w-14 h-8 text-sm bg-transparent border-border text-center px-1"
                onClick={(e) => e.stopPropagation()}
                onKeyDown={(e) => e.stopPropagation()}
              />m
              <button
                onClick={handleSaveNewStep}
                disabled={!newStepTitle.trim() || createStepMutation.isPending}
                className="p-1.5 rounded-full bg-accent text-white disabled:opacity-50"
              >
                <Check size={14} />
              </button>
            </div>
          )}

          {/* Add step button */}
          {isEditing && !isAddingStep && (
            <button
              onClick={handleAddStepClick}
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-secondary-foreground mt-2"
            >
              <Plus size={16} />
              Add step
            </button>
          )}
        </div>

        {/* Edit mode buttons */}
        {isEditing ? (
          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center gap-2">
              <button
                onClick={handleConfirm}
                className="rounded-lg bg-accent-foreground flex items-center gap-1 h-8 px-3 text-sm text-secondary"
              >
                <Check size={14} />
                Confirm
              </button>
              <button
                onClick={handleCancel}
                className="h-8 px-4 text-sm bg-[#d8d2d3] text-secondary rounded-lg"
              >
                Cancel
              </button>
            </div>
            <PenLine
              size={16}
              className="text-muted-foreground"
            />
          </div>
        ) : (
          /* Edit icon at bottom - click to enter edit mode */
          !isStreaming && (
            <div className="flex justify-end mt-4">
              <PenLine
                size={16}
                onClick={handleEditClick}
                className="text-muted-foreground cursor-pointer"
              />
            </div>
          )
        )}
      </AccordionContent>
    </AccordionItem>
  );
}
