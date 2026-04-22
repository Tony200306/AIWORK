"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { useUpdateTask } from "@/hooks/shared/useUpdateTask";
import { zodResolver } from "@hookform/resolvers/zod";
import { Check, X } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import * as z from "zod";

// Schema validation
const taskEditSchema = z.object({
  name: z.string().min(1, "Task name is required"),
  timeValue: z.number().min(0, "Time must be positive"),
  unit: z.enum(["minutes", "hours", "seconds"]),
});

type TaskEditFormData = z.infer<typeof taskEditSchema>;

interface TaskEditInputProps {
  taskName: string;
  estimatedTime: number;
  onCancel: () => void;
  taskId: string;
}

export const TaskEditInput = ({
  taskName,
  estimatedTime,
  onCancel,
  taskId,
}: TaskEditInputProps) => {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<TaskEditFormData>({
    resolver: zodResolver(taskEditSchema),
    defaultValues: {
      name: taskName,
      timeValue: estimatedTime || 0,
      unit: "minutes",
    },
  });
  const { mutate: updateTask, isPending } = useUpdateTask({ onCancel });
  const onSubmit = (data: TaskEditFormData) => {
    updateTask({
      expectedTimeHours: data.timeValue,
      taskId: taskId,
      title: data.name,
    });
  };
  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="gap-2 justify-between item-center group flex items-center"
    >
      <div className="flex-1">
        <Input
          disabled={isPending}
          autoFocus
          {...register("name")}
          className="flex-1"
          placeholder="Task name"
        />
        {errors.name && (
          <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>
        )}
      </div>

      <div className="flex gap-2">
        <Input
          disabled={isPending}
          {...register("timeValue", { valueAsNumber: true })}
          className="w-20 focus:w-32 transition-all duration-200"
          type="number"
          min="0"
          placeholder="Time"
        />

        <Controller
          name="unit"
          control={control}
          render={({ field }) => (
            <Select
              disabled={isPending}
              value={field.value}
              onValueChange={field.onChange}
            >
              <SelectTrigger className="w-16 transition-all duration-200">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="text-white">
                <SelectItem value="minutes">m</SelectItem>
                <SelectItem value="hours">h</SelectItem>
                <SelectItem value="seconds">s</SelectItem>
              </SelectContent>
            </Select>
          )}
        />
      </div>
      <div className="flex gap-2">
        {isPending ? (
          <Spinner className={`size-4`} />
        ) : (
          <>
            {" "}
            <Button
              type="button"
              size="sm"
              variant="secondary"
              onClick={onCancel}
              className="p-2 rounded-xl"
            >
              <X />
            </Button>
            <Button
              type="submit"
              size="sm"
              variant="secondary"
              className="p-2 rounded-xl"
            >
              <Check />
            </Button>
          </>
        )}{" "}
      </div>
    </form>
  );
};
