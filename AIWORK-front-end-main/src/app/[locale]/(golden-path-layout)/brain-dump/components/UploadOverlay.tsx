"use client";

import { useState, useRef } from "react";
import { Paperclip, Upload } from "lucide-react";
import { getMediaDuration } from "@/utils/functions/getMediaDuration ";
import { FileInfo } from "../type";

interface UploadOverlayProps {
  onFileSelect: (fileInfo: FileInfo) => void;
  onClose: () => void;
}

export default function UploadOverlay({
  onFileSelect,
  onClose,
}: UploadOverlayProps) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = async (file: File) => {
    const fileInfo: FileInfo = {
      id: `${Date.now()}-${Math.random()}`,
      file: file,
      name: file.name,
      size: file.size,
      type: file.type,
      uploadStatus: "pending",
    };

    if (file.type.startsWith("audio/") || file.type.startsWith("video/")) {
      try {
        fileInfo.duration = await getMediaDuration(file);
      } catch (error) {
        console.error("Error getting duration:", error);
      }
    }

    onFileSelect(fileInfo);
    onClose();
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      await processFile(file);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      await processFile(file);
      event.target.value = "";
    }
  };

  return (
    <div className="absolute inset-0 z-10 bg-black/95 rounded-2xl border-2 border-dashed border-gray-600 flex flex-col items-center justify-center backdrop-blur-sm">
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        onChange={handleFileChange}
        accept="*"
      />

      <button
        onClick={onClose}
        className="absolute top-4 right-4 p-2 hover:bg-gray-800 rounded-lg transition-colors"
        aria-label="Close"
      >
        {/* <Paperclip className="w-5 h-5 text-gray-400" /> */}
      </button>

      <div
        onClick={handleClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`w-full h-full flex flex-col items-center justify-center cursor-pointer transition-colors ${
          isDragging ? "bg-gray-800/50" : ""
        }`}
      >
        <Upload className="w-12 h-12 text-gray-400 mb-4" />
        <p className="text-white text-lg font-medium mb-2">Drop a file here</p>
        <p className="text-gray-400 text-sm">or click to upload</p>
      </div>
    </div>
  );
}
