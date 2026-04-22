"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { ReactElement } from "react";

interface MobileSortableKanbanItemProps {
  id: string | number;
  children: ReactElement;
  className?: string;
}

export function MobileSortableKanbanItem({
  id,
  children,
  className,
}: MobileSortableKanbanItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    touchAction: "none", // Important for mobile touch DnD
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={className}
    >
      {children}
    </div>
  );
}
