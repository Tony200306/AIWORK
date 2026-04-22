"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import classNames from "classnames";
import React from "react";

interface SortableItemProps {
  id: string | number;
  children: React.ReactNode;
  className?: string;
  isStreaming?: boolean;
}

export function SortableItem({
  id,
  children,
  className,
  isStreaming = false,
}: SortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id,
    disabled: isStreaming,
  });

  const style = {
    // transform helps move element smoothly
    transform: CSS.Transform.toString(transform),
    transition,
    // Add style when dragging
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 999 : "auto",
  };

  const isDisabled = isStreaming;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={classNames(
        "px-6 py-4 bg-secondary border border-border rounded-2xl cursor-pointer hover:bg-accent transition-colors flex items-center gap-4 p-4 mb-2 shadow-sm group",
        isDragging && "shadow-lg",
        isDisabled && "opacity-50 cursor-not-allowed",
        className
      )}
      {...(!isDisabled ? attributes : {})}
      {...(!isDisabled ? listeners : {})}
    >
      {/* Main content */}
      <div className="flex-1">{children}</div>
    </div>
  );
}
