
"use client";

import { useState, useRef } from "react";
import { X, Upload, Link as LinkIcon, ClosedCaptionIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface UploadFileProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onFileSelect?: (files: File[]) => void;
  onUrlImport?: (url: string) => void;
  maxFiles?: number;
  maxSizeMB?: number;
}

export const UploadFile = ({
  open,
  onOpenChange,
  onFileSelect,
  onUrlImport,
  maxFiles = 6,
  maxSizeMB = 5,
}: UploadFileProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [fileUrl, setFileUrl] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

    const files = Array.from(e.dataTransfer.files).slice(0, maxFiles);
    if (files.length > 0) {
      setSelectedFiles(files);
      onFileSelect?.(files);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const fileArray = Array.from(files).slice(0, maxFiles);
      setSelectedFiles(fileArray);
      onFileSelect?.(fileArray);
      event.target.value = "";
    }
  };

  const handleImportUrl = () => {
    if (fileUrl.trim()) {
      onUrlImport?.(fileUrl);
      setFileUrl("");
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent  className="bg-[#1a1a1a] border-gray-800 text-white max-w-3xl p-8 [&>button]:hidden">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl font-semibold">
              Upload File
            </DialogTitle>
            <button
              onClick={() => onOpenChange(false)}
              className="p-1 hover:bg-gray-800 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>
        </DialogHeader>

        <div className="space-y-6 mt-6">
          {/* Drag & Drop Area */}
          <div
            onClick={handleClick}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-xl p-16 flex flex-col items-center justify-center cursor-pointer transition-all ${
              isDragging
                ? "border-gray-500 bg-gray-900/50"
                : "border-gray-700 hover:border-gray-600"
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              onChange={handleFileChange}
              accept="*"
              multiple
            />

            <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4">
              <Upload className="w-8 h-8 text-gray-400" />
            </div>

            <p className="text-white text-base font-medium mb-2">
              Drag & Drop or Choose File to upload
            </p>
            <p className="text-sm text-gray-500">
              Max {maxFiles} files • Up to {maxSizeMB}MB
            </p>
          </div>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-800"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-[#1a1a1a] text-gray-500">or</span>
            </div>
          </div>

          {/* Import from URL */}
          <div className="space-y-3">
            <label className="text-sm text-white font-medium">
              Import from URL
            </label>
            <div className="relative mt-2">
              <Input
                type="text"
                value={fileUrl}
                onChange={(e) => setFileUrl(e.target.value)}
                placeholder="Add file URL"
                className="w-full bg-[#2a2a2a] border border-gray-700 rounded-lg px-4 py-3 pr-12 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-gray-600"
              />
              <LinkIcon className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            </div>
          </div>

          {/* Import Button */}
          <div className="flex justify-end pt-2">
            <Button
              onClick={handleImportUrl}
              disabled={!fileUrl.trim()}
              className="bg-white hover:bg-gray-200 text-black font-medium px-8 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Import File
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
