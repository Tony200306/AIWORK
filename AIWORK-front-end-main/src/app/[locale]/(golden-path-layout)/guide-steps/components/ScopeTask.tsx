"use client";

import { useState } from "react";
import { Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";

export const ScopeTask = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [content, setContent] = useState(
    `Objective & Desired Outcomes
Setup Meta Pixel Setup so that events fire and are validated.

User Story
As a high-performance operator I want Meta Pixel Setup done, so that tracking is reliable.

MVP:
🟢 Required
• Confirm access + admin rights
• Create pixel + verify domain
• Install base event + test helper
• Validate firing on key flows

Actions:
• Follow guided steps`
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
    <div className="space-y-4 overflow-auto flex-1 min-h-0 flex flex-col">
      <h3 className="text-sm text-gray-400">
        Vantum Execution Mode - Scope Document
      </h3>

      <div
        className={`rounded-lg border border-gray-800 p-6 transition-colors flex flex-col overflow-auto flex-1 min-h-0  max-h-full ${
          isEditing ? "bg-gray-950" : "bg-card"
        }`}
      >
        {isEditing ? (
          <textarea
            value={editedContent}
            onChange={(e) => setEditedContent(e.target.value)}
            className=" flex-1 min-h-0 w-full bg-transparent text-white resize-none focus:outline-none font-mono text-sm leading-relaxed"
            autoFocus
          />
        ) : (
          <div className="flex-1 min-h-0 whitespace-pre-wrap font-mono text-sm leading-relaxed text-white">
            {content}
          </div>
        )}
      </div>

      <div className={`flex gap-3 ${isEditing ? "justify-between" : ""}`}>
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
          <Button
            variant="outline"
            onClick={() => setIsEditing(true)}
            className="rounded-lg"
          >
            <Pencil className="w-4 h-4 mr-2" />
            Edit Scope
          </Button>
        )}
      </div>
    </div>
  );
};
