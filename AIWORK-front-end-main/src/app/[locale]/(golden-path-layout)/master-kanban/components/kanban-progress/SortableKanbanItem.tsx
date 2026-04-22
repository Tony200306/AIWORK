// components/SortableItem.tsx
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Card, CardContent } from "@/components/ui/card";
import classNames from "classnames";
import { cloneElement, ReactElement } from "react";

interface SortableKanbanItemProps {
  id: string | number;
  children: ReactElement;
  className?: string;
}

export function SortableKanbanItem({
  id,
  children,
  className,
}: SortableKanbanItemProps) {
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
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={classNames("mb-2", className)}
    >
      {children}
    </div>
  );
}
