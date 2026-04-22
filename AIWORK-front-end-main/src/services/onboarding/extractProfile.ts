import {
  ResponseDetailSuccess,
  ResponseFailure,
} from "~/services/_shared/types/ServiceResponse";
import { ServiceException } from "../_shared/utils/ServiceException";
import { fetchApi } from "@/utils/fetchApi";

// Enum mappings
export const VALUE_ENUM_MAP: Record<string, string> = {
  client_trust: "CLIENT_TRUST",
  deep_work: "DEEP_WORK",
  family: "FAMILY",
  health: "HEALTH",
  financial_independence: "FINANCIAL_INDEPENDENCE",
  strategic_impact: "STRATEGIC_IMPACT",
  autonomy: "AUTONOMY",
  craft: "CRAFT",
};

export const REVENUE_ENUM_MAP: Record<string, string> = {
  "under_3k": "UNDER_3K",
  "3k_7k": "K3_TO_7K",
  "7k_12k": "K7_TO_12K",
  "12k_plus": "K12_PLUS",
};

export const RELATIONSHIP_ENUM_MAP: Record<string, string> = {
  thriving: "THRIVING",
  stable: "STABLE",
  under_pressure: "UNDER_PRESSURE",
  at_risk: "AT_RISK",
};

export interface ExtractProfileInput {
  questions: Array<{ question: string; answer: string }>;
  client: {
    name: string;
    revenueRange: string;
    relationshipState: string;
  };
  values: string[];
}

export interface ExtractProfileResponse {
  [key: string]: any;
}

export const extractProfile = async (data: ExtractProfileInput) => {
  const response = await fetchApi.request<
    ResponseDetailSuccess<ExtractProfileResponse> | ResponseFailure
  >({
    url: "/onboarding/extract-profile",
    method: "POST",
    data,
  }).axiosPromise;

  if (ServiceException.isResponseError(response)) {
    throw new ServiceException(response.data.message, response.data);
  }

  return response.data;
};
