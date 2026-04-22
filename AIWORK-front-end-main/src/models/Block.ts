import { ModelBase } from "./ModelBase";

export enum BlockStatus {
  Scheduled = "SCHEDULED",
  InProgress = "IN_PROGRESS",
  Completed = "COMPLETED",
  Cancelled = "CANCELLED",
}

export interface BlockTemplate {
  id: string;
  title?: string;
  description?: string;
  color?: string;
  durationMinutes?: number;
}

export interface Block extends ModelBase {
  templateId?: string;
  template?: BlockTemplate;
  userId: string;
  date: string;
  startAt?: string;
  endAt?: string;
  durationMinutes: number;
  status: BlockStatus;
  title?: string;
  description?: string;
  color?: string;
}

export function blockStatusToLabelMapping(): Record<BlockStatus, string> {
  return {
    [BlockStatus.Scheduled]: "Scheduled",
    [BlockStatus.InProgress]: "In Progress",
    [BlockStatus.Completed]: "Completed",
    [BlockStatus.Cancelled]: "Cancelled",
  };
}
