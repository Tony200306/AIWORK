import { BrainDump, BrainDumpStatus, BrainDumpType } from "~/models/BrainDump";
import {
  ResponseFailure,
  ResponseListSuccess,
} from "~/services/_shared/types/ServiceResponse";
import { fetchApi } from "~/utils/fetchApi";
import { ServiceException } from "../_shared/utils/ServiceException";

// Interface cho query params (nếu bạn muốn filter trên URL, vd: /braindump?status=TODO)
export interface GetBrainDumpsParams {
  status?: BrainDumpStatus;
  type?: BrainDumpType;
}

// Hàm lấy danh sách BrainDump
export const getBrainDumps = async (
  params?: GetBrainDumpsParams
): Promise<ResponseListSuccess<BrainDump[]>> => {
  const response = await fetchApi.request<
    ResponseListSuccess<BrainDump[]> | ResponseFailure
  >({
    url: `/braindump`, // Endpoint
    method: "GET", // Met1hod GET
    params: params,
  }).axiosPromise;

  if (ServiceException.isResponseError(response)) {
    throw new ServiceException(response.data.message, response.data);
  }

  return response.data as ResponseListSuccess<BrainDump[]>;
};
