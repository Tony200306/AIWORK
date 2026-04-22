import { OnboardingBraindumpResponseData, ResponseDetailSuccess } from "@/services/_shared/types/ServiceResponse";
import {
  postTheContextToBrainDump,
  PostContextToBrainDumpInput,
  BrainDumpResponseData,
} from "@/services/onboarding-question/postTheContextToBrainDump";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

export function usePostTheContextToBrainDump() {
  return useMutation<
    OnboardingBraindumpResponseData,
    Error,
    PostContextToBrainDumpInput
  >({
    mutationFn: postTheContextToBrainDump,
    onSuccess: (data) => {
    },
    onError: (error) => {
      toast.error(error.message || "Failed to post context to braindump");
    },
  });
}
