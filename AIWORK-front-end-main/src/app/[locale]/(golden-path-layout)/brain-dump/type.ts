export type FileInfo = {
  id?: string;
  file: File;
  name: string;
  size: number;
  type: string;
  duration?: number;
  width?: number;
  height?: number;
  preview?: string;
  uploadStatus?: "pending" | "uploading" | "completed" | "error";
  uploadProgress?: number;
};

export type FileIconType =
  | "audio"
  | "video"
  | "image"
  | "pdf"
  | "document"
  | "archive"
  | "code"
  | "unknown";

