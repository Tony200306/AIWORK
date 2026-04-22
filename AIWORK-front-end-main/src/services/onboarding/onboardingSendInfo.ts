import {
  ResponseDetailSuccess,
  ResponseFailure,
} from "~/services/_shared/types/ServiceResponse";
import { fetchApi } from "~/utils/fetchApi";
import { ServiceException } from "../_shared/utils/ServiceException";

export interface OnboardingSendInfoInput {
  name: string;
  email: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  tags?: string[];
  tasks?: string[];
}

export interface OnboardingSendInfoResponse {
  message?: string;
  [key: string]: any;
}

export const onboardingSendInfo = async (data: OnboardingSendInfoInput) => {
  const payload = {
    name: data.name,
    email: data.email,
    utmSource: data.utmSource || "capacity_report",
    utmMedium: data.utmMedium || "web",
    utmCampaign: data.utmCampaign || "onboarding",
    tags: data.tags || ["BrainDump", "onboarding"],
    tasks: data.tasks || [],
  };

  const response = await fetchApi.request<
    ResponseDetailSuccess<OnboardingSendInfoResponse> | ResponseFailure
  >({
    url: "/newsletter/subscribe",
    method: "POST",
    data: payload,
    headers: {
      "Content-Type": "application/json",
    },
  }).axiosPromise;

  if (ServiceException.isResponseError(response)) {
    throw new ServiceException(response.data.message, response.data);
  }

  return response.data as ResponseDetailSuccess<OnboardingSendInfoResponse>;
};
