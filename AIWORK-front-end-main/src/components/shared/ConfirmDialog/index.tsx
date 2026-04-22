"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import React from "react";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description?: React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  open,
  title,
  description,
  confirmText = "Yes",
  cancelText = "No",
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onCancel()}>
      <DialogContent
        showCloseButton={false}
        className="max-w-md gap-6 rounded-2xl border-none bg-popover-foreground p-8"
      >
        <DialogHeader className="items-center gap-3">
          <DialogTitle className="text-2xl font-bold text-white">
            {title}
          </DialogTitle>
          {description && (
            <DialogDescription asChild className="text-center text-sm text-[#a0a0a0]">
              <div>{description}</div>
            </DialogDescription>
          )}
        </DialogHeader>

        <DialogFooter className="flex-row justify-end gap-3 sm:justify-end">
          <Button
            variant="secondary"
            onClick={onCancel}
            className="min-w-[80px] rounded-lg bg-[#4a4a4a] text-white hover:bg-[#5a5a5a]"
          >
            {cancelText}
          </Button>
          <Button
            onClick={onConfirm}
            className="min-w-[80px] rounded-lg bg-white text-black hover:bg-white/90"
          >
            {confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
