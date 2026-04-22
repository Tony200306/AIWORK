import { ResponseDetailSuccess } from "@/services/_shared/types/ServiceResponse";
import {
  TagResponseData
} from "@/services/task/createTag";
import { updateTag, UpdateTagInput } from "@/services/task/updateTag";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface Props {
  setIsEditing: (value: boolean) => void;
}
export function useUpdateTag({ setIsEditing }: Props) {
  const queryClient = useQueryClient();
  return useMutation<
    ResponseDetailSuccess<TagResponseData>,
    Error,
    UpdateTagInput
  >({
    mutationFn: updateTag,
    onSuccess: (data) => {
      setIsEditing(false);
    },
  });
}
