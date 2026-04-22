import { ModelBase } from "./ModelBase";
import { Priority, Task, TaskStatus } from "./Task";

export enum SprintWindowType {
  TODAY = "TODAY",
  THREEDAYS = "THREEDAYS",
  WEEK = "WEEK",
}

export interface Sprint extends ModelBase {
  title: string;
  windowType: SprintWindowType;
  startDate: string;
  endDate: string;
  capacityMinutes: number;
  taskIds: string[];
}

// --- Sprint Response Types ---

export enum SprintLane {
  LOW = "LOW",
  MEDIUM = "MEDIUM",
  HIGH = "HIGH",
  HIGHEST = "HIGHEST",
  LOWEST = "LOWEST",
}


export interface SprintItem {
  id: string;
  taskId: string;
  task: Task;
  lane: SprintLane;
  rank: number;
  plannedMinutes: number | null;
  isStarred: boolean;
  startNext: boolean;
  completedAt: string | null;
}

export interface SprintItems {
  TODO: SprintItem[] | [];
  DOING: SprintItem[] | [];
  DONE: SprintItem[] | [];
}

export interface SprintResponse {
  id: string;
  title: string;
  windowType: SprintWindowType;
  startDate: string;
  endDate: string;
  capacityMinutes: number;
  isActive: boolean;
  items: SprintItems;
}

export interface LastSprintResponse {
  id: string;
  isActive: boolean;
}
