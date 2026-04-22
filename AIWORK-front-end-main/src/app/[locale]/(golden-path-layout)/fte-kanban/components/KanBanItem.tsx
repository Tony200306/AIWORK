"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  PenLine,
  Square,
  SquareCheckBig,
  Star,
} from "lucide-react";
import { Priority , Task } from "../../../../../models/Task";
import { useUpdateBulkPriorities } from "@/hooks/shared/useUpdateBulkPriorities";

interface KanBanItemProps {
  item: Task;
  title: string;
  timeEstimate: string;
  isStarred?: boolean;
  isSelected?: boolean;
  isDefering?: boolean;
  isLoading?: boolean;
  onEdit?: () => void;
  onToggleStar?: () => void;
  onClick?: () => void;
  setSelectedTasks?: React.Dispatch<React.SetStateAction<string[]>>;
  onPriorityChange?: (taskId: string, newPriority: string) => void;
}

export function KanBanItem({
  item,
  title,
  timeEstimate,
  isStarred = false,
  onEdit,
  onToggleStar,
  onClick,
  isSelected = false,
  isDefering = false,
  isLoading = false,
  setSelectedTasks,
  onPriorityChange,
}: KanBanItemProps) {
  const { mutate: updateBulkPriorities, isPending: isUpdatingPriority } =
    useUpdateBulkPriorities();

  const handleStarClick = (e: React.MouseEvent) => {
    e.stopPropagation();

    const newPriority = isStarred ? Priority.Low : Priority.Highest;

    // Optimistic update ngay lập tức
    onPriorityChange?.(item.id, newPriority);

    updateBulkPriorities({
      tasks: [
        {
          taskId: item.id,
          priority: newPriority,
        },
      ],
    }, {
      onSuccess: () => {
        onToggleStar?.();
      }
    });
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit?.();
  };

  return (
    <div
      onClick={onClick}
      className="bg-[#2a2a2a]  border-border border rounded-lg p-3  hover:bg-[#333333] transition-colors group"
    >


      <Accordion type="single" collapsible>
        {" "}
        <AccordionItem value="item-1">
          <div className=" flex items-start justify-between gap-3">
            <button
              onClick={handleStarClick}
              className="text-gray-400 hover:text-yellow-400 transition-colors shrink-0 mt-0.5"
              aria-label={isStarred ? "Unstar" : "Star"}
              disabled={isLoading || isUpdatingPriority}
            >
              {isDefering && item.priority === "LOW" ? (
                isSelected ? (
                  <SquareCheckBig
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedTasks?.((prev) => {
                        return prev?.filter((id) => id !== item.id);
                      });
                    }}
                    className="w-5 h-5 cursor-pointer"
                  />
                ) : (
                  <Square
                    className="w-5 h-5 cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedTasks?.((prev) => {
                        return [...prev, item.id];
                      });
                    }}
                  />
                )
              ) : (
                <Star
                  className={`w-5 h-5 cursor-pointer ${
                    isStarred ? "fill-yellow-400 text-yellow-400" : ""
                  }`}
                />
              )}
            </button>
            <div className="flex-1 min-w-0">
              <h3 className="text-white font-medium text-base leading-snug mb-2">
                {title}
              </h3>
              <p className="text-gray-400 text-sm">{timeEstimate}</p>
            </div>
            <div className="flex flex-col justify-between items-center gap-2 shrink-0 self-stretch">
              <div className="flex items-center gap-1">
                <button
                  onClick={handleEditClick}
                  className="cursor-pointer text-gray-400 hover:text-white transition-colors opacity-0 group-hover:opacity-100"
                  aria-label="Edit"
                >
                  <PenLine className="w-4 h-4" />
                </button>
              </div>
              <AccordionTrigger
                className="mb-0.5 flex flex-row-reverse  cursor-pointer p-0  hover:no-underline"
              ></AccordionTrigger>
            </div>
          </div>
          <div>
            <AccordionContent>
              <div className="mt-4 space-y-2 p-4 border border-border rounded-xl">
                {item.steps?.map((step) => (
                  <div key={step.id} className="flex items-baseline gap-2">
                    <div className="pb-[0.1rem]">
                      <div className=" w-1.5 h-1.5 rounded-full bg-muted-foreground shrink-0" />
                    </div>
                    <span className="text-base text-card-foreground">
                      {step.title}
                    </span>
                  </div>
                ))}
              </div>
            </AccordionContent>
          </div>{" "}
        </AccordionItem>
      </Accordion>
    </div>
  );
}
