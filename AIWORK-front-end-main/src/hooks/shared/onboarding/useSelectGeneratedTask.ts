import { OnboardingBraindumpResponseData } from "@/services/_shared/types/ServiceResponse";
import {
  selectGeneratedTask,
  SelectGeneratedTaskInput,
} from "@/services/onboarding-question/selectGeneratedTask";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

export function useSelectGeneratedTask() {
  return useMutation<
    OnboardingBraindumpResponseData,
    Error,
    SelectGeneratedTaskInput
  >({
    mutationFn: selectGeneratedTask,
    onError: (error) => {
      toast.error(error.message || "Failed to generate tasks");
    },
  });
}
