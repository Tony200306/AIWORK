import React from "react";
import { cn } from "@/lib/utils";
import { Block } from "@/models/Block";

interface CalendarBlockProps {
  data: Block;
  className :string;
  onClick?: () => void;
}

export const CalendarBlock: React.FC<CalendarBlockProps> = ({
  data,
  className,
  onClick,
}) => {
  return (
    <div
      className={cn(
        "rounded-2xl px-4 py-3 cursor-pointer transition-all hover:opacity-90",
        "bg-gradient-to-br from-amber-800/80 to-amber-900/80",
        "text-white font-medium",
        className
      )}
      onClick={onClick}
    >
      <div className="flex items-center gap-2">
        <span className="text-base">{data.title}</span>
        <span className="text-sm">•</span>
        <span className="text-sm">
          {data.startAt}-{data.endAt}
        </span>
      </div>
    </div>
  );
};

export default CalendarBlock;
