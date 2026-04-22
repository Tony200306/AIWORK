"use client";

import {
  PenLine,
  Square,
  SquareCheckBig,
  Star,
} from "lucide-react";
import { Task } from "@/models/Task";

interface MobileKanBanItemProps {
  item: Task;
  title: string;
  timeEstimate: string;
  isStarred?: boolean;
  isSelected?: boolean;
  isDefering?: boolean;
  isLoading?: boolean;
  onEdit?: () => void;
  onStarClick?: (e: React.MouseEvent) => void;
  onClick?: () => void;
  setSelectedTasks?: React.Dispatch<React.SetStateAction<string[]>>;
}

export function MobileKanBanItem({
  item,
  title,
  timeEstimate,
  isStarred = false,
  onEdit,
  onStarClick,
  onClick,
  isSelected = false,
  isDefering = false,
  isLoading = false,
  setSelectedTasks,
}: MobileKanBanItemProps) {
  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit?.();
  };

  return (
    <div
      onClick={onClick}
      className="bg-[#2a2a2a] border-border border rounded-xl p-3 hover:bg-[#333333] transition-colors group"
    >
      <div className="flex items-start justify-between gap-2">
        <button
          onClick={onStarClick}
          className="text-gray-400 hover:text-yellow-400 transition-colors shrink-0 mt-0.5"
          aria-label={isStarred ? "Unstar" : "Star"}
          disabled={isLoading}
        >
          {isDefering && item.priority === "LOW" ? (
            isSelected ? (
              <SquareCheckBig
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedTasks?.((prev) => prev?.filter((id) => id !== item.id));
                }}
                className="w-4 h-4 cursor-pointer"
              />
            ) : (
              <Square
                className="w-4 h-4 cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedTasks?.((prev) => [...prev, item.id]);
                }}
              />
            )
          ) : (
            <Star
              className={`w-4 h-4 cursor-pointer ${
                isStarred ? "fill-yellow-400 text-yellow-400" : ""
              }`}
            />
          )}
        </button>
        <div className="flex-1 min-w-0">
          <h3 className="text-white font-medium text-sm leading-snug line-clamp-2">
            {title}
          </h3>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-gray-400 text-xs">{timeEstimate}</span>
          <button
            onClick={handleEditClick}
            className="cursor-pointer text-gray-400 hover:text-white transition-colors"
            aria-label="Edit"
          >
            <PenLine className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
