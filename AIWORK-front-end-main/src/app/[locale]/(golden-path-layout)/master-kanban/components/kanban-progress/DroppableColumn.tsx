import { useDroppable } from "@dnd-kit/core";
import { ReactNode } from "react";

interface DroppableColumnProps {
  id: string;
  children: ReactNode;
  className?: string;
}

export function DroppableColumn({
  id,
  children,
  className,
}: DroppableColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <div
      ref={setNodeRef}
      className={`${className} ${
        isOver
          ? "bg-white/5 border-2 border-dashed border-teal-500/50 rounded-lg"
          : ""
      } transition-all duration-200`}
    >
      {children}
    </div>
  );
}
