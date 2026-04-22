import axios from "axios";
import {
    OnboardingBraindumpResponseData,
    ResponseFailure
} from "~/services/_shared/types/ServiceResponse";
import { ServiceException } from "../_shared/utils/ServiceException";


export interface PostContextToBrainDumpInput {
    session_id: string;
    selected_tasks: string[];
    query: string;
    questions: Array<{
        question: string;
        answer: string;
    }>;
}

export interface BrainDumpResponseData {
    tasks: {
        id: string;
        text: string;
        est_time: number;
        kind: string;
        parent_id: string;
        relation_type: string
    }[];
}

export const postTheContextToBrainDump = async (
    data: PostContextToBrainDumpInput
) => {
    try {
        const response = await axios.post<
            OnboardingBraindumpResponseData | ResponseFailure
        >(`${process.env.NEXT_PUBLIC_AI_SERVICE_URL}/onboarding/braindump`, data, {
            headers: {
                "Content-Type": "application/json",
                "X-API-Key": process.env.NEXT_PUBLIC_AI_SERVICE_API_KEY,
            },
        });

        if (ServiceException.isResponseError(response)) {
            throw new ServiceException(response.data.message, response.data);
        }

        return response.data as OnboardingBraindumpResponseData;
    } catch (error: any) {
        if (error.response?.data) {
            throw new ServiceException(
                error.response.data.message || "Failed to post context to braindump",
                error.response.data
            );
        }
        throw error;
    }
};
