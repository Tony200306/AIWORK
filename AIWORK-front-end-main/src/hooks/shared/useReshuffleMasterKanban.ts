import { ResponseDetailSuccess } from "@/services/_shared/types/ServiceResponse";
import {
  reshuffleMasterKanban,
  ReshuffleMasterKanbanResult,
} from "@/services/reshuffle/reshuffleMasterKanban";
import { useMutation } from "@tanstack/react-query";

export const useReshuffleMasterKanban = () => {
  return useMutation<
    ResponseDetailSuccess<ReshuffleMasterKanbanResult>,
    Error,
    string
  >({
    mutationFn: (sprintId: string) => reshuffleMasterKanban(sprintId),
  });
};
