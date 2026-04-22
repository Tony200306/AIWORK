"use client";

import { useState, useRef } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { CircleDashed, Layers, Mic, Minimize, SlidersHorizontal } from "lucide-react";
import { toast } from "sonner";
import { transcribe } from "@/services/transcribe/transcribe";
import { createBrainDump } from "~/services/braindump/createBrainDump";
import { TaskType } from "@/models/Task";

interface AddTaskDialogProps {
  open: boolean;
  onClose: () => void;
  onTaskCreated?: (braindumpId: string, taskType: TaskType) => void;
}

export default function AddTaskDialog({
  open,
  onClose,
  onTaskCreated,
}: AddTaskDialogProps) {
  const [content, setContent] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      chunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        const res = await transcribe({ file: blob as File });
        setContent((prev) => prev + " " + res.text);
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Microphone access error:", err);
      toast.error("Please allow microphone access to record audio");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleMicClick = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const handleSubmit = async (taskType: TaskType) => {
    if (!content.trim()) {
      toast.error("Please add some content before submitting");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await createBrainDump({
        contextText: content,
        files: [],
      });

      onTaskCreated?.(res.data.id, taskType);
      setContent("");
      onClose();
    } catch (error: any) {
      toast.error(error?.message || "Failed to create task");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (isRecording) {
      stopRecording();
    }
    setContent("");
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent
        showCloseButton={false}
        className="sm:max-w-2xl bg-[#1a1a1a] border-gray-800 p-6 gap-0"
      >
        <DialogTitle className="sr-only">Add Task</DialogTitle>
        {/* Header with Close */}
        <div className="flex justify-end mb-4">
          <button
            onClick={handleClose}
            className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-white transition-colors"
          >
           <Minimize/>
            Close
          </button>
        </div>

        {/* Textarea with mic */}
        <div className="relative">
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Type or say anything you need to do."
            className="min-h-[250px] bg-transparent border border-gray-700 rounded-xl text-base text-gray-300 placeholder:text-gray-500 focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-gray-600 resize-none p-5 pr-14"
          />
          <button
            onClick={handleMicClick}
            className="absolute bottom-4 right-4 p-2 hover:bg-gray-800 rounded-lg transition-colors"
            aria-label={isRecording ? "Stop recording" : "Start recording"}
          >
            <Mic
              className={`w-5 h-5 ${
                isRecording ? "text-red-500 animate-pulse" : "text-gray-400"
              }`}
            />
          </button>
        </div>

        {/* Action buttons */}
        <div className="flex gap-3 mt-6">
          <Button
            onClick={() => handleSubmit(TaskType.ACTIVE)}
            disabled={isSubmitting || !content.trim()}
            variant="outline"
            className="flex items-center gap-2 border-gray-700 text-white hover:bg-gray-800 px-5 py-2.5"
          >
            <CircleDashed/> 
            {isSubmitting ? "Adding..." : "Add to Active Sprint"}
          </Button>
          <Button
            onClick={() => handleSubmit(TaskType.BACKLOG)}
            disabled={isSubmitting || !content.trim()}
            variant="outline"
            className="flex items-center gap-2 border-gray-700 text-white hover:bg-gray-800 px-5 py-2.5"
          >
            <Layers/>
            {isSubmitting ? "Adding..." : "Add to Backlog"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
