import { BrainDump } from "~/models/BrainDump";
import {
  ResponseDetailSuccess,
  ResponseFailure,
} from "~/services/_shared/types/ServiceResponse";
import { fetchApi } from "~/utils/fetchApi";
import { ServiceException } from "../_shared/utils/ServiceException";

export interface CreateExtBrainDumpInput {
  contextText: string;
  files?: any[];
}

export type CreateExtBrainDumpResponse = BrainDump;

export const createExtBrainDump = async (data: CreateExtBrainDumpInput) => {
  const formData = new FormData();
  formData.append("contextText", data.contextText);

  if (data.files) {
    data.files.forEach((file) => {
      formData.append("attachments", file);
    });
  }

  const response = await fetchApi.request<
    ResponseDetailSuccess<CreateExtBrainDumpResponse> | ResponseFailure
  >({
    url: "/ext-braindump",
    method: "POST",
    data: formData,
    headers: {
      "Content-Type": "application/json",
    },
  }).axiosPromise;

  if (ServiceException.isResponseError(response)) {
    throw new ServiceException(response.data.message, response.data);
  }

  return response.data as ResponseDetailSuccess<CreateExtBrainDumpResponse>;
};
