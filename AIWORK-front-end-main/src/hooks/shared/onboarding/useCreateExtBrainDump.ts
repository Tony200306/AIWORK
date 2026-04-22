import { useMutation } from "@tanstack/react-query";
import {
  createExtBrainDump,
  CreateExtBrainDumpInput,
  CreateExtBrainDumpResponse,
} from "@/services/braindump/createExtBrainDump";
import { ResponseDetailSuccess } from "@/services/_shared/types/ServiceResponse";

export const useCreateExtBrainDump = () => {
  return useMutation<
    ResponseDetailSuccess<CreateExtBrainDumpResponse>,
    Error,
    CreateExtBrainDumpInput
  >({
    mutationFn: (data) => createExtBrainDump(data),
  });
};
