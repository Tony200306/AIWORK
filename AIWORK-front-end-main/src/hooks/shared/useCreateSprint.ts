import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createSprint,
  CreateSprintInput,
} from "@/services/sprint/createSprint";
import { toast } from "sonner";

export const useCreateSprint = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateSprintInput) => createSprint(data),
    onMutate: async (newSprint) => {
      console.log("Creating new sprint:", newSprint);
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to create sprint");
    },
    onSuccess: (data) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ["sprints"] });
      queryClient.invalidateQueries({ queryKey: ["task-list"] });
    },
  });
};
