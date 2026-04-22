"use client";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { RouteConfig } from "@/constants/RouteConfig";
import { useCreateExtBrainDump } from "@/hooks/shared/onboarding/useCreateExtBrainDump";
import { BrainCircuit, Paperclip, Sparkles } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { pendingBraindump } from "@/utils/pendingBraindump";
import AudioRecorder from "@/app/[locale]/(golden-path-layout)/brain-dump/components/AudioRecorder";
import FileItem from "@/app/[locale]/(golden-path-layout)/brain-dump/components/FileItem";
import UploadOverlay from "@/app/[locale]/(golden-path-layout)/brain-dump/components/UploadOverlay";
import { FileInfo } from "@/app/[locale]/(golden-path-layout)/brain-dump/type";

export default function ExtBrainDumpPage() {
  const searchParams = useSearchParams();
  const contextText = searchParams.get("text") || "";

  const [content, setContent] = useState(contextText);
  const [files, setFiles] = useState<FileInfo[]>([]);
  const [showUploadOverlay, setShowUploadOverlay] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const router = useRouter();
  const createExtBrainDump = useCreateExtBrainDump();

  const handleAddFile = (fileInfo: FileInfo) => {
    setFiles((prev) => [...prev, fileInfo]);
  };

  const handleRemoveFile = (fileId: string) => {
    setFiles((prev) => prev?.filter((f) => f.id !== fileId));
  };

  const handleSubmit = async () => {
    if (!content.trim() && files.length === 0) {
      toast.error("Please add some content or files before submitting");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await createExtBrainDump.mutateAsync({
        contextText: content,
        files: files?.map((file) => file.file),
      });

      // Save braindump ID to session for later linking with user account
      pendingBraindump.save(res.data.id);

      router.push(RouteConfig.ExtAtomicSplitPage.getPath(res.data.id));
    } catch (error: any) {
      toast.error(error?.message || "Failed to create brain dump");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="body-medium pt-10 md:pt-20 pb-16 flex-col body min-h-screen  flex items-center justify-center p-4 w-full">
      <div className="w-full flex-1 max-w-4xl space-y-6 md:space-y-8 flex flex-col">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="font-semibold text-[34px] md:text-5xl flex items-center justify-center gap-3">
            <BrainCircuit className="w-8 h-8 md:w-12 md:h-12" />
            Brain Dump
          </div>
          <p className="text-sm md:text-lg text-gray-400">
            <span className="md:hidden">Drop everything that&apos;s in your head. Vantum will turn it into manageable steps.</span>
            <span className="hidden md:inline">Good start. Add what you&apos;ve been putting off. Or say it out loud — we&apos;ll handle the rest</span>
          </p>
        </div>

        {/* Mobile Layout */}
        <div className="md:hidden flex-1 flex flex-col space-y-4">
          {/* Textarea with icons */}
          <div className="flex-1 flex flex-col">
            <div className="relative h-85 p-1 rounded-2xl border">
              <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Type or say anything you need to do, deliver, or remember for today - or the week ahead."
                className="h-[100%] flex-1 min-h-[200px] bg-card border-2 border-border rounded-2xl text-base text-gray-300 placeholder:text-gray-500 focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-gray-600 resize-none p-4 pb-14"
              />
              {/* Icons at bottom of textarea */}
              <div className="absolute bottom-4 left-4 right-4 flex justify-end items-center">
                <button
                  onClick={() => setShowUploadOverlay(true)}
                  className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
                  aria-label="Attach file"
                >
                  {/* <Paperclip className="w-5 h-5 text-gray-400" /> */}
                </button>
              </div>
                <div className="absolute flex justify-center mt-4 right-1/2 translate-x-1/2 -bottom-5">
              <AudioRecorder setInput={setContent} />
            </div>
              {showUploadOverlay && (
                <UploadOverlay
                  onFileSelect={handleAddFile}
                  onClose={() => setShowUploadOverlay(false)}
                />
              )}
            </div>

        
          </div>

          {/* Files list */}
          {files.length > 0 && (
            <div className="w-full min-w-0 overflow-x-auto flex flex-nowrap gap-2 pb-2 [&::-webkit-scrollbar]:hidden [scrollbar-width:none] [-webkit-overflow-scrolling:touch]">
              {files?.map((fileInfo) => (
                <FileItem
                  key={fileInfo.id}
                  fileInfo={fileInfo}
                  onRemove={handleRemoveFile}
                />
              ))}
            </div>
          )}

          {/* Submit button */}
          <div className="flex flex-col items-center space-y-3 pt-4">
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="rounded-full px-6 h-12 border-2 border-white/20 hover:bg-white/10"
            >
              {isSubmitting ? "Processing..." : "See the Breakdown"}
              <Sparkles className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </div>

        {/* Desktop Layout */}
        <div className="hidden md:flex flex-1 min-h-0 flex-col gap-4">
          <div className="flex-1 min-h-0 flex flex-col bg-[#262626] rounded-3xl py-10 px-8 border border-gray-800 shadow-2xl pb-4">
            {/* Textarea Container */}
            <div className="flex-1 min-h-0 flex flex-col">
              <div className="relative flex-1 flex flex-col">
                <Textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Type or say anything you need to  get done today or by end of week...."
                  className="flex-1 h-full bg-background border-2 border-gray-700 rounded-2xl text-base text-gray-300 placeholder:text-gray-500 focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-gray-600 resize-none p-6"
                />

                {showUploadOverlay && (
                  <UploadOverlay
                    onFileSelect={handleAddFile}
                    onClose={() => setShowUploadOverlay(false)}
                  />
                )}
              </div>

              {/* Files list */}
              {files.length > 0 && (
                <div className="w-full min-w-0 overflow-x-auto flex flex-nowrap gap-2 py-2 [&::-webkit-scrollbar]:hidden [scrollbar-width:none] [-webkit-overflow-scrolling:touch]">
                  {files?.map((fileInfo) => (
                    <FileItem
                      key={fileInfo.id}
                      fileInfo={fileInfo}
                      onRemove={handleRemoveFile}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Bottom bar: mic centered, paperclip right */}
            <div className="flex items-center justify-center relative mt-4">
              <AudioRecorder setInput={setContent} />
              <button
                onClick={() => setShowUploadOverlay(true)}
                className="absolute right-0 p-2 hover:bg-gray-800 rounded-lg transition-colors"
                aria-label="Attach file"
              >
                {/* <Paperclip className="w-5 h-5 text-gray-400 cursor-pointer" /> */}
              </button>
            </div>
          </div>

          {/* See the breakdown Button */}
          <div className="flex flex-col items-end mt-15">
            <Button onClick={handleSubmit} size="lg" disabled={isSubmitting}>
              {isSubmitting ? "Processing..." : "See the breakdown"}
              <Sparkles className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
