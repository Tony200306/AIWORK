import * as React from "react";
import { cn } from "@/lib/utils";

function Input({
  className,
  classWrapper,
  type,
  icon,
  ...props
}: React.ComponentProps<"input"> & {
  icon?: React.ReactNode;
  classWrapper?: string;
}) {
  return (
    <div className={cn(" ", classWrapper)}>
      <input
        type={type}
        data-slot="input"
        className={cn(
          "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input h-12 w-full min-w-0 rounded-lg! border bg-transparent px-6 pr-14 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
          "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
          className
        )}
        {...props}
      />
      {icon && (
        <div className="absolute right-2 top-1/2 -translate-y-1/2">{icon}</div>
      )}
    </div>
  );
}

export { Input };
