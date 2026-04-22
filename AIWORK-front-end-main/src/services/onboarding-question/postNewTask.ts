import axios from "axios";
import {
    ResponseFailure
} from "~/services/_shared/types/ServiceResponse";
import { ServiceException } from "../_shared/utils/ServiceException";


export interface PostTaskTitleInput {
    query: string;
}


export interface PostTaskResponseData {
    id: string;
    title: string;
    est_time: number;
}
export const postNewTask = async (
    data: PostTaskTitleInput
) => {
    try {
        const response = await axios.post<
            PostTaskResponseData | ResponseFailure
        >(`${process.env.NEXT_PUBLIC_AI_SERVICE_URL}/onboarding/task-title`, data, {
            headers: {
                "Content-Type": "application/json",
                "X-API-Key": process.env.NEXT_PUBLIC_AI_SERVICE_API_KEY,
            },
        });

        if (ServiceException.isResponseError(response)) {
            throw new ServiceException(response.data.message, response.data);
        }

        return response.data as PostTaskResponseData;
    } catch (error: any) {
        if (error.response?.data) {
            throw new ServiceException(
                error.response.data.message || "Failed to select generated tasks",
                error.response.data
            );
        }
        throw error;
    }
};
