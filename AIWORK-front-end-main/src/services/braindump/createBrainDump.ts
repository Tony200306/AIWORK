import { BrainDump, BrainDumpType, BrainDumpStatus } from "~/models/BrainDump"; // Import model bạn vừa tạo
import {
  ResponseDetailSuccess,
  ResponseFailure,
} from "~/services/_shared/types/ServiceResponse";
import { fetchApi } from "~/utils/fetchApi";
import { ServiceException } from "../_shared/utils/ServiceException";

export interface CreateBrainDumpInput {
  contextText: string;
  files: any[];
}

export type CreateBrainDumpResponse = BrainDump;

export const createBrainDump = async (data: CreateBrainDumpInput) => {
  const formData = new FormData();
  formData.append("contextText", data.contextText);

  data.files.forEach((file) => {
    formData.append("attachments", file);
  });
  const response = await fetchApi.request<
    ResponseDetailSuccess<CreateBrainDumpResponse> | ResponseFailure
  >({
    url: "/braindump",
    method: "POST",
    data: formData,
    headers: {
      "Content-Type": "multipart/form-data",
    },
  }).axiosPromise;

  if (ServiceException.isResponseError(response)) {
    throw new ServiceException(response.data.message, response.data);
  }

  return response.data as ResponseDetailSuccess<CreateBrainDumpResponse>;
};
