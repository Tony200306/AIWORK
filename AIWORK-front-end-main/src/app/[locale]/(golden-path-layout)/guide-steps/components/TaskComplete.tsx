"use client";

import { useState } from "react";
import { X, Link as LinkIcon, File, StickyNote } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { UploadFile } from "./UploadFile";

interface TaskCompleteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  stepTitle: string;
  plannedTime?: string;
  actualTime?: string;
  onComplete: (data: {
    whatShipped: string;
    difficulty: "Easy" | "Normal" | "Hard";
    blockers?: string;
  }) => void;
}

export const TaskComplete = ({
  open,
  onOpenChange,
  stepTitle,
  plannedTime = "60m",
  actualTime = "3m",
  onComplete,
}: TaskCompleteProps) => {
  const [whatShipped, setWhatShipped] = useState("");
  const [difficulty, setDifficulty] = useState<
    "Easy" | "Normal" | "Hard" | null
  >(null);
  const [blockers, setBlockers] = useState("");
  const [isUploadOpen, setIsUploadOpen] = useState(false);

  const handleMarkComplete = () => {
    if (whatShipped && difficulty) {
      onComplete({
        whatShipped,
        difficulty,
        blockers,
      });
      // Reset form
      setWhatShipped("");
      setDifficulty(null);
      setBlockers("");
      onOpenChange(false);
    }
  };

  const handleKeepWorking = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-popover-foreground border-gray-800 text-white max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-semibold">
            Task Complete.
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 mt-2">
          {/* Time info */}
          <div className="flex items-center gap-3 text-sm text-gray-400">
            <span>Planned {plannedTime}</span>
            <span>•</span>
            <span>Actual {actualTime}</span>
          </div>
          <p className="text-sm text-gray-400">
            Takes ~ 30 seconds. Helps Vantum match your real pace.
          </p>

          {/* What did you ship? */}
          <div className="space-y-2">
            <label className="text-sm text-gray-300 ">
              What did you ship?
            </label>
            <input
              type="text"
              value={whatShipped}
              onChange={(e) => setWhatShipped(e.target.value)}
              placeholder="One line. Example: Pixel firing on signup + IDs logged."
              className="mt-2 w-full bg-[#0f0f0f] border border-gray-800 rounded-lg px-4 py-3 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-gray-700"
            />
          </div>

          {/* How hard was this for you? */}
          <div className="space-y-3">
            <label className="text-sm text-gray-300">
              How hard was this for you?
            </label>
            <div className="grid grid-cols-3 gap-3 mt-2">
              <button
                onClick={() => setDifficulty("Easy")}
                className={`cursor-pointer py-auto rounded-lg border transition-colors h-10 ${
                  difficulty === "Easy"
                    ? "bg-accent border-gray-600"
                    : "bg-accent hover:border-gray-700"
                }`}
              >
                Easy
              </button>
              <button
                onClick={() => setDifficulty("Normal")}
                className={`cursor-pointer py-auto rounded-lg border transition-colors h-10 ${
                  difficulty === "Normal"
                    ? "bg-accent border-gray-600"
                    : "bg-accent hover:border-gray-700"
                }`}
              >
                Normal
              </button>
              <button
                onClick={() => setDifficulty("Hard")}
                className={`cursor-pointer py-auto rounded-lg border transition-colors h-10 ${
                  difficulty === "Hard"
                    ? "bg-accent border-gray-600"
                    : "bg-accent hover:border-gray-700"
                }`}
              >
                Hard
              </button>
            </div>
          </div>

          {/* Anything slow you down? */}
          <div className="space-y-2">
            <label className="text-sm text-gray-300 ">
              Anything slow you down?{" "}
              <span className="text-gray-500">(optional)</span>
            </label>
            <textarea
              value={blockers}
              onChange={(e) => setBlockers(e.target.value)}
              placeholder="Example: access missing, unclear event names."
              className="mt-2 w-full bg-[#0f0f0f] border border-gray-800 rounded-lg px-4 py-3 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-gray-700 resize-none"
              rows={3}
            />
          </div>

          {/* Attach proof */}
          <div className="space-y-3 border border-gray-800 rounded-lg p-4 bg-accent">
            <label className="text-sm text-gray-400">
              Attach proof{" "}
              <span className="text-muted-foreground">(optional)</span>
            </label>
            <div className="flex gap-3 mt-2">
              <button className="flex items-center gap-2 px-4 py-2 bg-[#0f0f0f] border border-gray-800 rounded-lg hover:border-gray-700 transition-colors">
                <LinkIcon className="w-4 h-4" />
                <span className="text-sm">Link</span>
              </button>
              <button 
                onClick={() => setIsUploadOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-[#0f0f0f] border border-gray-800 rounded-lg hover:border-gray-700 transition-colors"
              >
                <File className="w-4 h-4" />
                <span className="text-sm">File</span>
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-[#0f0f0f] border border-gray-800 rounded-lg hover:border-gray-700 transition-colors">
                <StickyNote className="w-4 h-4" />
                <span className="text-sm">Note</span>
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-between pt-4">
            <Button
              variant="outline"
              onClick={handleKeepWorking}
              className="bg-accent border-gray-800 hover:bg-gray-900 text-secondary-foreground rounded-lg"
            >
              Keep working
            </Button>
            <Button
              onClick={handleMarkComplete}
              disabled={!whatShipped || !difficulty}
              className="bg-chart-2/20 hover:bg-green-600 text-secondary-foreground disabled:opacity-50 disabled:cursor-not-allowed rounded-lg"
            >
              Mark Complete
            </Button>
          </div>
        </div>
      </DialogContent>

      <UploadFile
        open={isUploadOpen}
        onOpenChange={setIsUploadOpen}
        onFileSelect={(files) => {
          console.log("Files selected:", files);
          // Handle file upload here
        }}
        onUrlImport={(url) => {
          console.log("URL imported:", url);
          // Handle URL import here
        }}
      />
    </Dialog>
  );
};
