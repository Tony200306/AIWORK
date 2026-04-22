import axios from "axios";
import { ServiceException } from "../_shared/utils/ServiceException";

// Priority mapping: internal enum ↔ API integer (P1-P4)
const PRIORITY_TO_INT: Record<string, number> = {
  HIGHEST: 1,
  HIGH: 2,
  MEDIUM: 3,
  LOW: 4,
};

const INT_TO_PRIORITY: Record<number, string> = {
  1: "HIGHEST",
  2: "HIGH",
  3: "MEDIUM",
  4: "LOW",
};

export interface ReshuffleTaskInput {
  id: string;
  text: string;
  est_time: number;
  priority: number | null;
  priority_source: "ai" | "user";
  is_locked: boolean;
  last_user_moved_at: string | null;
}

export interface ReshuffleInput {
  tasks: ReshuffleTaskInput[];
  mode?: "unlocked_only" | "everything";
}

export interface ReshuffleTaskOutput {
  id: string;
  priority: number;
  is_locked: boolean;
  [key: string]: any;
}

export interface ReshufflePrioritiesResponse {
  tasks: ReshuffleTaskOutput[];
}

/**
 * Map internal task to AI service reshuffle input format.
 * is_locked = true when task is starred (HIGHEST priority).
 */
export const mapTaskToReshuffleInput = (task: {
  id: string;
  title: string;
  expectedTimeHours?: number | null;
  priority: string;
}): ReshuffleTaskInput => ({
  id: task.id,
  text: task.title,
  est_time: task.expectedTimeHours || 0,
  priority: PRIORITY_TO_INT[task.priority] ?? null,
  priority_source: task.priority === "HIGHEST" ? "user" : "ai",
  is_locked: task.priority === "HIGHEST",
  last_user_moved_at: null,
});

/**
 * Map API priority integer (1-4) back to internal Priority enum string.
 */
export const mapPriorityFromInt = (priority: number): string =>
  INT_TO_PRIORITY[priority] || "LOW";

export const reshufflePriorities = async (input: ReshuffleInput) => {
  try {
    const response = await axios.post<ReshufflePrioritiesResponse>(
      `${process.env.NEXT_PUBLIC_AI_SERVICE_URL}/capacitykanban/priority/reshuffle`,
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
        error.response.data.message || "Failed to reshuffle priorities",
        error.response.data
      );
    }
    throw error;
  }
};
