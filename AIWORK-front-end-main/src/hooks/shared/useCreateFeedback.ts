import { useMutation } from "@tanstack/react-query";
import {
  createFeedback,
  CreateFeedbackInput,
} from "@/services/feedback/createFeedback";
import { toast } from "sonner";

export const useCreateFeedback = () => {
  return useMutation({
    mutationFn: (data: CreateFeedbackInput) => createFeedback(data),
    onError: (err: Error) => {
      toast.error(err.message || "Failed to send feedback");
    },
  });
};
