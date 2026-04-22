"use client";

import * as React from "react";
import * as SwitchPrimitive from "@radix-ui/react-switch";

import { cn } from "@/lib/utils";
import { Moon, Sun } from "lucide-react";

function Switch({
  className,
  isDayNightMode = false,
  thumbClassName,
  ...props
}: React.ComponentProps<typeof SwitchPrimitive.Root> & {
  isDayNightMode?: boolean;
  thumbClassName?: string;
}) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      className={cn(
        "group peer data-[state=checked]:bg-primary data-[state=unchecked]:bg-black focus-visible:border-ring focus-visible:ring-ring/50 dark:data-[state=unchecked]:bg-input/80 inline-flex h-[1.15rem] w-8 shrink-0 items-center rounded-full border border-transparent shadow-xs transition-all outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        children={
          isDayNightMode ? (
            <>
              {" "}
              <span className="absolute inset-0 flex items-center justify-center text-xs group-data-[state=checked]:opacity-0 group-data-[state=unchecked]:opacity-100">
                <Sun />
              </span>
              <span className="absolute inset-0 flex items-center justify-center text-xs group-data-[state=checked]:opacity-100 group-data-[state=unchecked]:opacity-0">
                <Moon />
              </span>
            </>
          ) : null
        }
        data-slot="switch-thumb"
        className={cn(
          "flex  justify-center items-center bg-background dark:data-[state=unchecked]:bg-foreground dark:data-[state=checked]:bg-primary-foreground pointer-events-none  size-4 rounded-full ring-0 transition-transform data-[state=checked]:translate-x-[calc(100%-2px)] data-[state=unchecked]:translate-x-0",
          thumbClassName
        )}
      />
    </SwitchPrimitive.Root>
  );
}

export { Switch };
