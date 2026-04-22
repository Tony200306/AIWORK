import { useMutation } from "@tanstack/react-query";
import {
  reshuffleBacklog,
  ReshuffleBacklogInput,
  ReshuffleBacklogResponse,
} from "@/services/braindump/reshuffleBacklog";
import { toast } from "sonner";

export const useReshuffleBacklog = () => {
  return useMutation<ReshuffleBacklogResponse, Error, ReshuffleBacklogInput>({
    mutationFn: (input) => reshuffleBacklog(input),
    onError: (err: Error) => {
      toast.error(err.message || "Failed to reshuffle backlog");
    },
  });
};
