import { ResponseDetailSuccess } from "@/services/_shared/types/ServiceResponse";
import {
  onboardingSendInfo,
  OnboardingSendInfoInput,
  OnboardingSendInfoResponse,
} from "@/services/onboarding/onboardingSendInfo";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

export function useOnboardingSendInfo() {
  return useMutation<
    ResponseDetailSuccess<OnboardingSendInfoResponse>,
    Error,
    OnboardingSendInfoInput
  >({
    mutationFn: onboardingSendInfo,
    onSuccess: (data) => {
    },
    onError: (error) => {
      toast.error(error.message || "Failed to send onboarding info");
    },
  });
}
