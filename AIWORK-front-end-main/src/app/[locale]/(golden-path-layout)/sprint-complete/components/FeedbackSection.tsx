"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useParams } from "next/navigation";
import { useCreateFeedback } from "@/hooks/shared/useCreateFeedback";
import { FeedbackDifficulty } from "@/services/feedback/createFeedback";
import { toast } from "sonner";

type Difficulty = "EASY" | "NORMAL" | "HARD";

const DIFFICULTY_COLORS: Record<Difficulty, { border: string; text: string; bg: string }> = {
  EASY: { border: "border-emerald-400", text: "text-emerald-400", bg: "bg-emerald-400/10" },
  NORMAL: { border: "border-amber-400", text: "text-amber-400", bg: "bg-amber-400/10" },
  HARD: { border: "border-red-400", text: "text-red-400", bg: "bg-red-400/10" },
};

const DIFFICULTY_OPTIONS: { value: Difficulty; label: string }[] = [
  { value: "EASY", label: "Easy" },
  { value: "NORMAL", label: "Normal" },
  { value: "HARD", label: "Hard" },
];

export function FeedbackSection() {
  const params = useParams();
  const sprintId = params.id as string;

  const [difficulty, setDifficulty] = useState<Difficulty | null>(null);
  const [slowdown, setSlowdown] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const { mutate: submitFeedback, isPending } = useCreateFeedback();

  const handleSubmit = () => {
    if (!difficulty) {
      toast.error("Please select a difficulty level");
      return;
    }

    submitFeedback(
      {
        sprintId,
        difficulty: difficulty as FeedbackDifficulty,
        slowdown,
      },
      {
        onSuccess: () => {
          setSubmitted(true);
        },
      }
    );
  };

  return (
    <div className="bg-card border border-border rounded-xl p-6 space-y-5">
      <p className="body text-muted-foreground">
        Leave some feedback. It helps Vantum match your real pace
      </p>

      {/* Difficulty selection */}
      <div className="space-y-3">
        <p className="body-medium text-white">How hard was this sprint for you?</p>
        <div className="grid grid-cols-3 gap-3">
          {DIFFICULTY_OPTIONS?.map((option) => (
            <button
              key={option.value}
              disabled={submitted}
              onClick={() => setDifficulty(option.value)}
              className={cn(
                "py-3 rounded-lg border text-sm font-medium transition-all bg-accent",
                difficulty === option.value
                  ? `${DIFFICULTY_COLORS[option.value].border} ${DIFFICULTY_COLORS[option.value].text} ${DIFFICULTY_COLORS[option.value].bg}`
                  : "border-border text-muted-foreground hover:border-white/20 hover:text-white",
                submitted ? "opacity-60 cursor-not-allowed" : "cursor-pointer"
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Text feedback */}
      <div className="space-y-3">
        <p className="body-medium text-white">Anything slow you down?</p>
        <input
          type="text"
          value={slowdown}
          disabled={submitted}
          onChange={(e) => setSlowdown(e.target.value)}
          placeholder="e.g., missing access, unclear event names"
          className={cn(
            "w-full h-12 rounded-lg border border-input bg-input/30 px-4 text-sm text-white placeholder:text-muted-foreground outline-none focus:border-ring",
            submitted && "opacity-60 cursor-not-allowed"
          )}
        />
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-2">
        {submitted ? (
          <span className="text-sm text-emerald-400 font-medium">
            Thank you for your feedback!
          </span>
        ) : (
          <div />
        )}
        <Button
          onClick={handleSubmit}
          disabled={isPending || submitted}
          size="sm"
          className="px-6 bg-teal-800/20 border border-teal-400/30 text-white hover:bg-teal-800/40 rounded-lg"
        >
          {isPending ? "Sending..." : "Send Feedback"}
        </Button>
      </div>
    </div>
  );
}
