import {
  X,
  FileText,
  FileAudio,
  FileVideo,
  FileImage,
  FileArchive,
  FileCode,
  File as FileIcon,
} from "lucide-react";
import { FileInfo } from "../type";
import {  getFileIconType } from "../utils/helper";
import { formatDuration } from "@/utils/formatDuration";

interface Props {
  fileInfo: FileInfo;
  onRemove: (fileId: string) => void;
}

export default function FileItem({ fileInfo, onRemove }: Props) {
  // Chọn icon phù hợp với loại file dựa vào MIME type
  const getFileIcon = () => {
    const iconType = getFileIconType(fileInfo.type);
    const iconClass = "w-4 h-4";

    switch (iconType) {
      case "audio":
        return <FileAudio className={iconClass} />;
      case "video":
        return <FileVideo className={iconClass} />;
      case "image":
        return <FileImage className={iconClass} />;
      case "pdf":
        return <FileText className={iconClass} />;
      case "document":
        return <FileText className={iconClass} />;
      case "archive":
        return <FileArchive className={iconClass} />;
      case "code":
        return <FileCode className={iconClass} />;
      default:
        return <FileIcon className={iconClass} />;
    }
  };

  return (
    <div className="inline-flex flex-shrink-0 items-center gap-2 bg-black border border-gray-700 rounded-full px-3 py-1.5 text-sm text-white">
      {/* Icon */}
      <span className="text-gray-400">{getFileIcon()}</span>

      {/* File name */}
      <span className="max-w-[150px] truncate">{fileInfo.name}</span>

      {/* Duration (nếu có) */}
      {fileInfo.duration && (
        <span className="text-gray-400">
          {formatDuration(fileInfo.duration)}
        </span>
      )}

      {/* Remove button */}
      <button
        onClick={() => onRemove(fileInfo.id!)}
        className="hover:bg-gray-800 rounded-full p-0.5 transition-colors cursor-pointer"
        aria-label="Remove file"
      >
        <X className="w-3.5 h-3.5 " />
      </button>
    </div>
  );
}
