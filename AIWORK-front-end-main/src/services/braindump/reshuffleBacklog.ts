import axios from "axios";
import { ServiceException } from "../_shared/utils/ServiceException";

export interface ReshuffleBacklogTaskInput {
  id: string;
  text: string;
  est_time: number;
  priority: number | null;
  priority_source: "ai" | "user";
  is_locked: boolean;
  last_user_moved_at: string | null;
  rank: number;
}

export interface ReshuffleBacklogInput {
  tasks: ReshuffleBacklogTaskInput[];
}

export interface ReshuffleBacklogTaskOutput {
  id: string;
  priority: number;
  is_locked: boolean;
  rank: number;
  [key: string]: any;
}

export interface ReshuffleBacklogResponse {
  tasks: ReshuffleBacklogTaskOutput[];
}

export const reshuffleBacklog = async (input: ReshuffleBacklogInput) => {
  try {
    const response = await axios.post<ReshuffleBacklogResponse>(
      `${process.env.NEXT_PUBLIC_AI_SERVICE_URL}/backlog/reshuffle`,
      input,
      {
        headers: {
          "Content-Type": "application/json",
          "X-API-Key": process.env.NEXT_PUBLIC_AI_SERVICE_API_KEY,
        },
      }
    );

    return response.data;
  } catch (error: any) {
    if (error.response?.data) {
      throw new ServiceException(
        error.response.data.message || "Failed to reshuffle backlog",
        error.response.data
      );
    }
    throw error;
  }
};
