import { useMutation } from "@tanstack/react-query";
import {
  reshufflePriorities,
  ReshuffleInput,
  ReshufflePrioritiesResponse,
} from "@/services/braindump/reshufflePriorities";
import { toast } from "sonner";

export const useReshufflePriorities = () => {
  return useMutation<ReshufflePrioritiesResponse, Error, ReshuffleInput>({
    mutationFn: (input) => reshufflePriorities(input),
    onError: (err: Error) => {
      toast.error(err.message || "Failed to reshuffle priorities");
    },
  });
};
