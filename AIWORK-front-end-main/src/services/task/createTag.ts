import { UserInfo } from "~/models/UserInfo";
import {
  ResponseDetailSuccess,
  ResponseFailure,
} from "~/services/_shared/types/ServiceResponse";
import { fetchApi } from "~/utils/fetchApi";
import { ServiceException } from "../_shared/utils/ServiceException";
import { Tag } from "@/models/Tag";

export type TagResponseData = Tag;

export interface CreateTagInput {
  name: string;
  color: string;
  parentId?: string;
}

export const createTag = async (data: CreateTagInput) => {
  const response = await fetchApi.request<
    ResponseDetailSuccess<TagResponseData> | ResponseFailure
  >({
    url: `/tags`,
    method: "POST",
    data: data,
  }).axiosPromise;

  if (ServiceException.isResponseError(response)) {
    throw new ServiceException(response.data.message, response.data);
  }
  return response.data as ResponseDetailSuccess<TagResponseData>;
};
