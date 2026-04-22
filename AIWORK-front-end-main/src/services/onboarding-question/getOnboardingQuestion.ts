import { OnboardingQuestion } from "~/models/OnboardingQuestion";
import {
    ResponseFailure,
    ResponseDetailSuccess,
} from "~/services/_shared/types/ServiceResponse";
import { fetchApi } from "~/utils/fetchApi";
import { ServiceException } from "../_shared/utils/ServiceException";

/**
 * Get onboarding question by slug
 * @param slug - The slug of the question card
 * @returns Promise with the onboarding question data
 */
export const getOnboardingQuestion = async (
    slug: string
): Promise<ResponseDetailSuccess<OnboardingQuestion>> => {
    const response = await fetchApi.request<
        ResponseDetailSuccess<OnboardingQuestion> | ResponseFailure
    >({
        url: `/onboarding-questions/${slug.replaceAll("-", "_")}`,
        method: "GET",
    }).axiosPromise;

    if (ServiceException.isResponseError(response)) {
        throw new ServiceException(response.data.message, response.data);
    }
    return response.data as ResponseDetailSuccess<OnboardingQuestion>;
};
