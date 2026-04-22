"use client";

import { useOnboardingContext } from "@/hooks/context/OnboardingProvider";
import { useStepTracking } from "@/hooks/useStepTracking";
import { useEffect, useRef, useState } from "react";
import { Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import Image from "next/image";

// --- Data ---
type ToolOption = {
  id: string;
  title: string;
  description: string;
  image?: string;
  isSomethingElse?: boolean;
};

const QUESTION = "Where do your tasks live today?";
const SUBTITLE = "Select everything you use to track work, reminders, and commitments. Even sticky notes count. We'll build a bridge.";

const TOOLS: ToolOption[] = [
  { id: "notion", title: "Notion", description: "Docs, databases, wikis", image: "/image/onbdimages/notion.png" },
  { id: "asana", title: "Asana", description: "Projects & tasks", image: "/image/onbdimages/asana.png" },
  { id: "clickup", title: "Click Up", description: "All-in-one PM", image: "/image/onbdimages/clickup.png" },
  { id: "trello", title: "Trello", description: "Boards & cards", image: "/image/onbdimages/trello.png" },
  { id: "spreadsheet", title: "Spreadsheet", description: "Google Sheets, Excel", image: "/image/onbdimages/sheet.png" },
  { id: "monday", title: "Monday", description: "Work OS", image: "/image/onbdimages/monday.png" },
  { id: "slack", title: "Slack", description: "Messages & reminders", image: "/image/onbdimages/slack.png" },
  { id: "email", title: "Email / Gmail", description: "Tasks buried in inbox", image: "/image/onbdimages/email.png" },
  { id: "notes", title: "Notes & Lists", description: "Apple Notes, sticky notes, paper", image: "/image/onbdimages/notes.png" },
  { id: "something_else", title: "Something else", description: "Tell us what", isSomethingElse: true },
];

// --- Component ---
export default function TaskSourcesPage() {
  const [selected, setSelected] = useState<string[]>([]);
  const [customValue, setCustomValue] = useState<string>("");
  const { trackLandingViewed } = useStepTracking();
  const { setHandleNext, setCurrentQuestion, setCurrentAnswer, trackStepCompleted } = useOnboardingContext();
  const slug = "task_sources";

  const stateRef = useRef({ selected, customValue, slug, trackStepCompleted });

  useEffect(() => {
    stateRef.current = { selected, customValue, slug, trackStepCompleted };
  }, [selected, customValue, slug, trackStepCompleted]);

  const toggleOption = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  // Track landing view
  useEffect(() => {
    trackLandingViewed({ landing_variant: slug, message_type: "diagnostic" });
  }, [slug, trackLandingViewed]);

  // Set currentQuestion
  useEffect(() => {
    setCurrentQuestion(QUESTION);
    return () => setCurrentQuestion("");
  }, [setCurrentQuestion]);

  // Set currentAnswer
  useEffect(() => {
    const labels = selected.map((id) => {
      if (id === "something_else" && customValue) return `Something else: ${customValue}`;
      return TOOLS.find((t) => t.id === id)?.title || id;
    });
    setCurrentAnswer(labels.join(", "));
  }, [selected, customValue, setCurrentAnswer]);

  // Validation & handleNext
  useEffect(() => {
    const hasSomethingElse = selected.includes("something_else");
    const isSomethingElseValid = hasSomethingElse ? customValue.trim() !== "" : true;
    const isValid = selected.length > 0 && isSomethingElseValid;

    if (!isValid) {
      setHandleNext(null);
      return;
    }

    const handler = async () => {
      const current = stateRef.current;
      if (current.selected.length === 0) return;
      const values = current.selected.map((id) => {
        if (id === "something_else" && current.customValue) return current.customValue;
        return id;
      });
      current.trackStepCompleted(current.slug, 4, values);
    };
    setHandleNext(() => handler);
    return () => setHandleNext(null);
  }, [selected, customValue, setHandleNext]);

  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
      <h1 className="text-[28px] sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-2 sm:mb-4">
        {QUESTION}
      </h1>
      <p className="text-sm text-secondary-foreground mb-6 sm:mb-8">{SUBTITLE}</p>

      <div className="overflow-auto min-h-0 flex-1 scrollbar-hide">
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 sm:gap-4 justify-items-center">
          {TOOLS.map((tool) => {
            const isSelected = selected.includes(tool.id);

            return (
              <div
                key={tool.id}
                onClick={() => toggleOption(tool.id)}
                className={`w-full max-w-[250px] h-[220px] relative bg-card border-2 rounded-2xl p-4 sm:p-6 transition-colors cursor-pointer flex flex-col items-center justify-center text-center gap-3 ${
                  isSelected
                    ? "border-chart-2"
                    : "border-border hover:border-chart-2/50"
                }`}
              >
                {/* Checkbox */}
                <div className="absolute top-3 right-3">
                  <div
                    className={`w-4 h-4 sm:w-5 sm:h-5 rounded border-2 flex items-center justify-center transition-colors ${
                      isSelected
                        ? "border-chart-2 bg-chart-2"
                        : "border-muted-foreground"
                    }`}
                  >
                    {isSelected && (
                      <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                        <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </div>
                </div>

                {/* Icon */}
                <div className="w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center">
                  {tool.isSomethingElse ? (
                    <Plus className="w-8 h-8 sm:w-10 sm:h-10 text-muted-foreground" />
                  ) : tool.image ? (
                    <Image
                      src={tool.image}
                      alt={tool.title}
                      width={64}
                      height={64}
                      className="w-12 h-12 sm:w-16 sm:h-16 object-contain"
                    />
                  ) : null}
                </div>

                {/* Label */}
                <div>
                  <p className="text-xs sm:text-sm font-medium">{tool.title}</p>
                  <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5">
                    {tool.description}
                  </p>
                </div>

                {/* Custom input for "Something else" - inside card */}
                {tool.isSomethingElse && isSelected && (
                  <div onClick={(e) => e.stopPropagation()}>
                    <Input
                      type="text"
                      placeholder="Tell us what you use"
                      value={customValue}
                      onChange={(e) => setCustomValue(e.target.value)}
                      className="bg-background h-9 text-sm text-center"
                      autoFocus
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Selection counter */}
      {selected.length > 0 && (
        <div className="text-center text-sm text-muted-foreground pt-4">
          <span className="text-chart-2 font-semibold">{selected.length}</span>
          {" selected \u2022 Select all that apply - this tells us where to build bridges first"}
        </div>
      )}
    </div>
  );
}
