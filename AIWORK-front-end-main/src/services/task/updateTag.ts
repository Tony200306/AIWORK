import { Tag } from '@/models/Tag';
import { ResponseDetailSuccess, ResponseFailure } from '~/services/_shared/types/ServiceResponse';
import { fetchApi } from '~/utils/fetchApi';
import { ServiceException } from '../_shared/utils/ServiceException';

export type TagResponseData = Tag;

export interface UpdateTagInput {
  tagId: string;
  name: string;
  color: string;
  parentId?: string;
}

export const updateTag = async (data: UpdateTagInput) => {
  const { tagId, ...payload } = data;
  const response = await fetchApi.request<
    ResponseDetailSuccess<TagResponseData> | ResponseFailure
  >({
    url: `/tasks/${tagId}`,
    method: "PATCH",
    data: payload,
  }).axiosPromise;

  if (ServiceException.isResponseError(response)) {
    throw new ServiceException(response.data.message, response.data);
  }
  return response.data as ResponseDetailSuccess<TagResponseData>;
};
