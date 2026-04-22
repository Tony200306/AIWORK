import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  deleteBulkTasks,
  DeleteBulkTasksInput,
} from "@/services/task/deleteBulkTasks";
import { toast } from "sonner";

export const useDeleteBulkTasks = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: DeleteBulkTasksInput) => deleteBulkTasks(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["task-list"] });
      queryClient.invalidateQueries({ queryKey: ["sprint"] });
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to delete tasks");
      queryClient.invalidateQueries({ queryKey: ["task-list"] });
      queryClient.invalidateQueries({ queryKey: ["sprint"] });
    },
  });
};
