import { ResponseDetailSuccess } from "@/services/_shared/types/ServiceResponse";
import {
  createTag,
  CreateTagInput,
  TagResponseData,
} from "@/services/task/createTag";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

interface Props {
  setIsAdding: (value: boolean) => void;
}
export function useCreateTag({ setIsAdding }: Props) {
  return useMutation<
    ResponseDetailSuccess<TagResponseData>,
    Error,
    CreateTagInput
  >({
    mutationFn: createTag,
    onSuccess: (data) => {
      setIsAdding(false);
    },
  });
}
