import { StatusCodeMappingToString } from "../constants/StringMappingToStatusCode";

export interface ResponseListSuccess<T> {
  success: boolean;
  statusCode: number;
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
  };
  message: string;
}

export interface ResponseDetailSuccess<T> {
  statusCode: number;
  success: boolean;
  message: string;
  data: T;
}
export interface OnboardingBraindumpResponseData {
  tasks: {
    id: string;
    text: string;
    est_time: number;
    kind: string;
    parent_id: string;
    relation_type: string
  }[];
}

export interface ResponseFailure {
  statusCode: keyof typeof StatusCodeMappingToString;
  timestamp: string;
  path: string;
  message: string;
  errors: any[];
}
