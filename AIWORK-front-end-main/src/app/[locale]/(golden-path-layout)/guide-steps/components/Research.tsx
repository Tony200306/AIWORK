"use client";

import { useState } from "react";
import { Pencil, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Research = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [content, setContent] = useState(
    `Deep research for: Objective & Desired Outcomes

• Key concepts pulled from scope
• Likely tools / docs to check
• Known traps
• Known traps
• Known traps
• Known traps
• Known traps
• Known traps
• Known traps
• Known traps
• Known traps
• Known traps
• Known traps





Links (demo):
• https://business.facebook.com/
• https://developers.facebook.com/docs/meta-pixel/`
  );
  const [editedContent, setEditedContent] = useState(content);

  const handleSave = () => {
    setContent(editedContent);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedContent(content);
    setIsEditing(false);
  };

  return (
    <div className="space-y-4 flex-1 flex flex-col min-h-0">
  

      <div
        className={`flex-1 min-h-0 overflow-auto rounded-lg border border-gray-800 p-6 transition-colors  ${
          isEditing ? "bg-gray-950" : "bg-card"
        }`}
      >
        {isEditing ? (
          <textarea
            value={editedContent}
            onChange={(e) => setEditedContent(e.target.value)}
            className="w-full h-full min-h-[400px] bg-transparent text-white resize-none focus:outline-none font-mono text-sm leading-relaxed"
            autoFocus
          />
        ) : (
          <div className="whitespace-pre-wrap font-mono text-sm leading-relaxed text-white">
            {content}
          </div>
        )}
      </div>

      <div className="flex items-center justify-between">
        <div
          className={`flex gap-3 ${isEditing ? "justify-between flex-1" : ""}`}
        >
          {isEditing ? (
            <>
              <Button
                variant="outline"
                onClick={handleCancel}
                className="rounded-lg"
              >
                Cancel Edit
              </Button>
              <Button
                onClick={handleSave}
                className="rounded-lg bg-white text-black hover:bg-gray-200"
              >
                Update & Refresh
              </Button>
            </>
          ) : (
            <></>
          )}
        </div>

        {!isEditing && (
          <div className="flex items-center gap-2">
            <Button size="icon" className="border-0! bg-0 text-primary">
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button className="rounded-2xl">Mark step done</Button>
            <Button size="icon" className="border-0! bg-0 text-primary">
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
