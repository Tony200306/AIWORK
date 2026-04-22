import { FileIconType } from "../type";

/**
 * Map MIME type sang icon type
 * @param mimeType - MIME type của file (e.g., "audio/mpeg", "video/mp4")
 * @returns Icon type tương ứng
 */
export const getFileIconType = (mimeType: string): FileIconType => {
  // Audio files
  if (
    mimeType.startsWith("audio/") ||
    ["audio/mpeg", "audio/mp3", "audio/wav", "audio/ogg", "audio/aac"].includes(
      mimeType
    )
  ) {
    return "audio";
  }

  // Video files
  if (
    mimeType.startsWith("video/") ||
    [
      "video/mp4",
      "video/mpeg",
      "video/quicktime",
      "video/x-msvideo",
      "video/webm",
    ].includes(mimeType)
  ) {
    return "video";
  }

  // Image files
  if (
    mimeType.startsWith("image/") ||
    [
      "image/jpeg",
      "image/png",
      "image/gif",
      "image/webp",
      "image/svg+xml",
      "image/bmp",
    ].includes(mimeType)
  ) {
    return "image";
  }

  // PDF
  if (mimeType === "application/pdf") {
    return "pdf";
  }

  // Archive files
  if (
    [
      "application/zip",
      "application/x-zip-compressed",
      "application/x-rar-compressed",
      "application/x-7z-compressed",
      "application/x-tar",
      "application/gzip",
    ].includes(mimeType)
  ) {
    return "archive";
  }

  // Code files
  if (
    [
      "text/javascript",
      "text/typescript",
      "application/javascript",
      "application/typescript",
      "text/html",
      "text/css",
      "application/json",
      "text/xml",
      "application/xml",
    ].includes(mimeType) ||
    mimeType.includes("text/x-")
  ) {
    return "code";
  }

  // Document files
  if (
    [
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-powerpoint",
      "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      "text/plain",
      "text/csv",
    ].includes(mimeType)
  ) {
    return "document";
  }

  return "unknown";
};

/**
 * Format file size từ bytes sang định dạng dễ đọc
 * @param bytes - Kích thước file tính bằng bytes
 * @returns String formatted (e.g., "1.5 MB", "350 KB")
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 B";

  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
};

