import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  applyReshuffleChanges,
  ApplyReshuffleChangesInput,
  ApplyReshuffleChangesResponse,
} from "@/services/reshuffle/applyReshuffleChanges";
import { ResponseDetailSuccess } from "@/services/_shared/types/ServiceResponse";

export const useApplyReshuffleChanges = () => {
  return useMutation<
    ResponseDetailSuccess<ApplyReshuffleChangesResponse>,
    Error,
    ApplyReshuffleChangesInput
  >({
    mutationFn: (data) => applyReshuffleChanges(data),
    onError: (err) => {
      toast.error(err.message || "Failed to apply reshuffle changes");
    },
  });
};
