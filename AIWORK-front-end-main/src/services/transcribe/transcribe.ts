import { localFetchApi } from "~/utils/fetchApi";
import { ServiceException } from "../_shared/utils/ServiceException";

export interface TranscribeResponseData {
  text: string;
}

export interface TranscribePayload {
  file: File;
}

export const transcribe = async (
  payload: TranscribePayload
): Promise<TranscribeResponseData> => {
  const formData = new FormData();
  formData.append("file", payload.file);

  const response = await localFetchApi.request<TranscribeResponseData>({
    url: "/api/transcribe",
    method: "POST",
    data: formData,
  }).axiosPromise;

  if (ServiceException.isResponseError(response)) {
    throw new ServiceException(response.data.message, response.data);
  }

  return response.data;
};
