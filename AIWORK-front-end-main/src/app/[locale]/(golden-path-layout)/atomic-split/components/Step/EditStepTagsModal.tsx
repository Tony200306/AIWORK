"use client";

import { useState, useRef } from "react";
import { X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tag } from "@/components/shared/ReactComponent/components/Tag/src/Tag";
import { v4 } from "uuid"; // ✅ Đúng
import { Tag as TagModel } from "@/models/Tag";
import { useCreateTag } from "@/hooks/shared/useCreateTag";
import { Spinner } from "@/components/ui/spinner";
import { useUpdateTag } from "@/hooks/shared/useUpdateTag";

interface EditStepsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tagsPop: TagModel[];
}

export function EditStepTagsModal({
  open,
  onOpenChange,
  tagsPop,
}: EditStepsModalProps) {
  const [tags, setTags] = useState<TagModel[]>(tagsPop);
  const [currentEdit, setCurrentEdit] = useState<TagModel>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const { mutateAsync: createTag, isPending: isCreating } = useCreateTag({
    setIsAdding,
  });
  const { mutateAsync: update, isPending: isUpdating } = useUpdateTag({
    setIsEditing,
  });
  const [fullLibTagView, setFullLibTagView] = useState(false);
  const libTagsRef = useRef<HTMLDivElement>(null);

  const handleShowLess = () => {
    setFullLibTagView(false);
    if (libTagsRef.current) {
      libTagsRef.current.scrollTop = 0;
    }
  };
  const handleRemoveTag = (id: string) => {
    setTags(tags?.filter((tag) => tag.id !== id));
  };

  const handleAddTag = () => {
    if (currentEdit?.name?.trim()) {
      createTag({
        name: currentEdit.name.trim(),
        color: currentEdit.color || "#52C41A",
      });
    }
    setCurrentEdit(null);
    setIsEditing(false);
  };

  const handleEdit = (id: string) => {
    if (currentEdit?.name.trim()) {
      const newTag: TagModel = {
        id: id,
        name: currentEdit.name.trim(),
        color: currentEdit.color || "#52C41A",
        type: "",
        priorityWeight: 0,
        createdAt: currentEdit.createdAt,
        updatedAt: currentEdit.updatedAt,
      };
      setTags(tags?.map((tag) => (tag.id === id ? newTag : tag)));
    }
    setCurrentEdit(null);
    setIsEditing(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleAddTag();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px] w-[520px] bg-[#1a1a1a] border-gray-800 text-white">
        <DialogHeader>
          <DialogTitle className="text-white">
            Tags for this deliverable
          </DialogTitle>
          <DialogDescription className="text-gray-400 text-xs">
            Optional. Helps Vantum estimate time per client / goal.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 w-[472px]">
          {/* Tags Display */}
          <div className="flex w-full gap-2 overflow-x-auto scrollbar-hide">
            {tags?.map((tag) => (
              <div
                key={tag.id || v4()}
                onClick={() => {
                  setCurrentEdit(tag);
                  setIsEditing(true);
                }}
                className="inline-flex items-center gap-1 bg-transparent"
              >
                <Tag
                  variant="pill"
                  dotColor={tag.color}
                  className="flex items-center gap-2 bg-gray-800/50 border-gray-700 text-white  px-2 py-1"
                  bordered
                >
                  <span className="mr-2"> {tag.name}</span>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveTag(tag.id);
                      setCurrentEdit(null);
                    }}
                    className="cursor-pointer text-gray-400 hover:text-white transition-colors "
                    aria-label={`Remove ${tag.name}`}
                  >
                    <X size={16} />
                  </button>
                </Tag>
              </div>
            ))}
          </div>

          {/* Input and Add Button */}
          <div className="flex items-center justify-between gap-2">
            <Input
              value={currentEdit?.name || ""}
              onChange={(e) =>
                setCurrentEdit((prev) => {
                  return {
                    ...prev,
                    name: e.target.value,
                  };
                })
              }
              classWrapper="flex-1"
              onKeyPress={handleKeyPress}
              placeholder="Add tag e.g., Client D, Q1 Goal, Ops"
              className="flex-1 bg-gray-900/50 border-gray-700 text-white placeholder:text-gray-500 text-sm"
            />
            <Input
              type="color"
              value={currentEdit?.color || "#52C41A"}
              onChange={(e) =>
                setCurrentEdit((prev) => {
                  return {
                    ...prev,
                    color: e.target.value,
                  };
                })
              }
              className="w-12! h-10 p-1 bg-transparent border-gray-700 rounded-lg cursor-pointer [&::-webkit-color-swatch-wrapper]:p-0 [&::-webkit-color-swatch]:rounded-md [&::-webkit-color-swatch]:border-0 [&::-moz-color-swatch]:rounded-md [&::-moz-color-swatch]:border-0"
            />
            {isEditing && currentEdit ? (
              <>
                {" "}
                <Button
                  onClick={() => handleEdit(currentEdit.id)}
                  className=" bg-teal-600 hover:bg-teal-700 text-white  rounded-lg"
                  size="sm"
                >
                  <span className="w-8">Save</span>
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  onClick={() => setCurrentEdit(null)}
                  className="p-2 rounded-xl"
                >
                  <X />
                </Button>
              </>
            ) : (
              <Button
                onClick={handleAddTag}
                className="bg-teal-600 hover:bg-teal-700 text-white  rounded-lg"
                size="sm"
                disabled={isCreating}
              >
                {isCreating && <Spinner />}
                <span className="w-8">Add</span>
              </Button>
            )}
          </div>

          {/* Helper Text */}
          <p className="text-xs text-center text-gray-500">
            We pre-tag when confident. You can fix anything here in seconds. No
            extra steps.
          </p>

          {/* Library Tags */}
          <div className="space-y-3 px-4 py-3 rounded-xl border border-border">
            <p className="text-sm text-gray-400">Library tags:</p>
            <div
              ref={libTagsRef}
              className={`flex flex-wrap gap-3 overflow-hidden transition-all ${
                fullLibTagView
                  ? "max-h-[195px] overflow-y-auto "
                  : "max-h-[88px]"
              }`}
            >
              {[
                { id: "lib-1", name: "Client D", color: "#3B82F6" },
                { id: "lib-2", name: "Relationships", color: "#EC4899" },
                { id: "lib-3", name: "Family", color: "#A855F7" },
                { id: "lib-4", name: "Company", color: "#10B981" },
                { id: "lib-5", name: "Intro", color: "#C084FC" },
                { id: "lib-6", name: "Sales", color: "#F59E0B" },
                { id: "lib-7", name: "Sales", color: "#F59E0B" },
                { id: "lib-8", name: "Sales", color: "#F59E0B" },
                { id: "lib-9", name: "Sales", color: "#F59E0B" },
                { id: "lib-10", name: "Sales", color: "#F59E0B" },
                { id: "lib-11", name: "Sales", color: "#F59E0B" },
                { id: "lib-12", name: "Sales", color: "#F59E0B" },
                { id: "lib-13", name: "Sales", color: "#F59E0B" },
              ]?.map((tag) => (
                <Tag
                  key={tag.id}
                  variant="pill"
                  className=" items-center  rounded-full px-4 py-2 transition-colors cursor-pointer"
                  classNameContent="  gap-2 flex"
                >
                  <span
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: tag.color }}
                  />
                  <span className="text-white text-sm">{tag.name}</span>
                  <X size={14} className="text-gray-400 hover:text-white" />
                </Tag>
              ))}
            </div>
            {!fullLibTagView ? (
              <div className="flex justify-end">
                <button
                  onClick={() => setFullLibTagView(true)}
                  className="text-sm text-gray-400 hover:text-white transition-colors cursor-pointer"
                >
                  See more...
                </button>
              </div>
            ) : (
              <div
                onClick={handleShowLess}
                className="text-right text-sm text-gray-400 hover:text-white transition-colors cursor-pointer"
              >
                Show less
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
