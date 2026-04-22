import { ModelBase } from "./ModelBase";
import { Tag } from "./Tag";

// --- Scope Types ---

export interface Scope {
  objective: string;
  why_now: string | string[];
  definition_of_done: string[];
  out_of_scope: string[];
  constraints?: string[];
  risk_if_ignored?: string[];
}

// --- Enums ---

export enum TaskStatus {
  TODO = "TODO",
  DOING = "DOING",
  DONE = "DONE",
}
export enum TaskType {
  BACKLOG = "BACKLOG",
  STAGING = "STAGING",
  ACTIVE = "ACTIVE",
  NEWSPRINT = "NEWSPRINT",
}

export enum Priority {
  Highest = "HIGHEST",
  High = "HIGH",
  Medium = "MEDIUM",
  Low = "LOW",
  Lowest = "LOWEST",
}



export function sprintStatusToLabelMapping(): Record<TaskType, string> {
  return {
    [TaskType.ACTIVE]: "Active Sprint",
    [TaskType.STAGING]: "Staging",
    [TaskType.BACKLOG]: "Backlog",
    [TaskType.NEWSPRINT]: "New Sprint",
  };
}

// --- Helper Functions (Label Mapping) ---

export function taskStatusToLabelMapping(): Record<TaskStatus, string> {
  return {
    [TaskStatus.TODO]: "To Do",
    [TaskStatus.DOING]: "Doing",
    [TaskStatus.DONE]: "Done",
  };
}

export function priorityToLabelMapping(): Record<Priority, string> {
  return {
    [Priority.Low]: "Low",
    [Priority.Medium]: "Medium",
    [Priority.High]: "High",
    [Priority.Highest]: "Highest",
    [Priority.Lowest]: "Lowest",
  };
}

export function priorityToColorMapping(): Record<Priority, string> {
  return {
    [Priority.Low]: "gray",
    [Priority.Medium]: "blue",
    [Priority.High]: "orange",
    [Priority.Highest]: "darkred",
    [Priority.Lowest]: "lightgray",
  };
}

export function statusToColorMapping(): Record<TaskStatus, string> {
  return {
    [TaskStatus.TODO]: "#5166A0",
    [TaskStatus.DOING]: "#1447E6",
    [TaskStatus.DONE]: "#029866",
  };
}

export function statusToLabelMapping(): Record<TaskStatus, string> {
  return {
    [TaskStatus.TODO]: "To Do",
    [TaskStatus.DOING]: "Doing",
    [TaskStatus.DONE]: "Done",
  };
}

// --- Interfaces ---

/**
 * Interface cho Step (vì Task thường đi kèm Steps)
 */
export interface Step extends ModelBase {
  taskId: string;
  planVersionId?: string | null;
  orderIndex?: number | null;
  title: string;
  description?: string | null;

  // Estimation
  sysEstMinutes?: number | null;
  userEstMinutes?: number | null;
  expectedTimeHours?: number | null; // Legacy field support

  difficulty?: number | null;
  isDone: boolean;
  extraProp?: Record<string, any> | null;
}

/**
 * Interface chính cho Task
 */
export interface Task extends ModelBase {
  title: string;
  description: string;

  // Estimation & Properties
  expectedTimeHours?: number | null;
  extraProp?: Record<string, any> | null; // JSON Type
  totalEstimatedMinutes?: number | null;
  scope?: Scope | null; // JSON Type

  // Status & Priority
  status: TaskStatus;
  priority: Priority;
  taskType?: TaskType;
  rank?: number;

  // Dates
  dueAt?: string | null; // ISO Date String
  archivedAt?: string | null;

  // Foreign Keys
  clientId?: string | null;
  goalId?: string | null;
  userId?: string | null;
  tagId?: string | null; // Primary legacy tag
  activePlanVersionId?: string | null;

  // Composite scoring fields
  goalAlignment?: number | null; // 0-1.0
  clientWeightVal?: number | null; // 0-1.0
  timeSensitivity?: number | null; // 0-1.0
  valuesAlignment?: number | null; // -0.3 to 1.0
  compositeScore?: number | null; // 0-100
  pinned?: boolean;

  // Relations (Optional - depend on API query include)
  steps?: Step[];
  tags?: Tag[];
  goal?: {
    id: string;
    tier: string;
    rank: number;
    title: string;
  } | null;
}

export type { Tag };
