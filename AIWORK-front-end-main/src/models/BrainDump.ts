import { ModelBase } from "./ModelBase";
import { Task } from "./Task";


export enum BrainDumpType {
  Todo = "TODO",
}

export enum BrainDumpStatus {
  Todo = "TODO",
  Pending = "PENDING",
  Processing = "PROCESSING",
  Completed = "COMPLETED",
}

export enum AssetType {
  Attachment = "ATTACHMENT",
  Voice = "VOICE",
}

export enum AssetContext {
  Todo = "TODO",
}


export function brainDumpStatusToLabelMapping(): Record<
  BrainDumpStatus,
  string
> {
  return {
    [BrainDumpStatus.Todo]: "To Do",
    [BrainDumpStatus.Pending]: "Pending",
    [BrainDumpStatus.Processing]: "Processing",
    [BrainDumpStatus.Completed]: "Processed",
  };
}

export function assetTypeToLabelMapping(): Record<AssetType, string> {
  return {
    [AssetType.Attachment]: "File Attachment",
    [AssetType.Voice]: "Voice Memo",
  };
}


export interface Asset extends ModelBase {
  userId: string;
  type: AssetType;
  storagePath?: string;
  title?: string;
  metadataJson?: Record<string, any>; // JSON Type
}


export interface BrainDumpAsset {
  brainDumpId: string;
  assetId: string;
  context: AssetContext;
  createdAt: Date;

  asset?: Asset;
}

export interface BrainDump extends ModelBase {
  userId: string;
  type: BrainDumpType;
  contextText?: string;
  status: BrainDumpStatus;

  convertedTaskId?: string;

  attachments?: BrainDumpAsset[];

  convertedTask?: Task;
}
