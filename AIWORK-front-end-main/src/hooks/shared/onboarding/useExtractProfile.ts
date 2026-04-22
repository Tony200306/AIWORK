import {
  extractProfile,
  ExtractProfileInput,
  ExtractProfileResponse,
} from "@/services/onboarding/extractProfile";
import { useMutation } from "@tanstack/react-query";

export function useExtractProfile() {
  return useMutation<ExtractProfileResponse, Error, ExtractProfileInput>({
    mutationFn: extractProfile,
  });
}
