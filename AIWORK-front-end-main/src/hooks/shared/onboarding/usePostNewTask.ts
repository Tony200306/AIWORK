import { postNewTask, PostTaskResponseData, PostTaskTitleInput } from "@/services/onboarding-question/postNewTask";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

export function usePostNewTask() {
  return useMutation<
    PostTaskResponseData,
    Error,
    PostTaskTitleInput
  >({
    mutationFn: postNewTask,
    onSuccess: (data) => {
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create task");
    },
  });
}
