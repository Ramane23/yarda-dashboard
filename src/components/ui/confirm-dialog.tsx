"use client";

import { useEffect, useId, useRef, useState } from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input, Label } from "@/components/ui/form-controls";
import { useT } from "@/lib/useT";

/**
 * Whether `typed` confirms `phrase`: exact match, ignoring surrounding spaces.
 *
 * Case matters on purpose: key ids and e-mail addresses are compared as
 * the user sees them, so a confirmation is never accepted by accident.
 */
export function matchesConfirmation(typed: string, phrase: string): boolean {
  return phrase.length > 0 && typed.trim() === phrase;
}

export interface ConfirmDialogProps {
  /** Whether the dialog is shown. */
  open: boolean;
  /** Short title, e.g. "Revoke API key". */
  title: string;
  /** What will happen, in one or two sentences. */
  description: string;
  /** Value the user must type to enable the action (a key id, an e-mail). */
  phrase: string;
  /** Label of the destructive button. */
  confirmLabel: string;
  /** Disables the buttons while the action runs. */
  pending?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * Confirmation for destructive actions (plan item SEC-30).
 *
 * `window.confirm` is one click away from a mistake and can be dismissed by
 * habit. This dialog names the exact target and requires typing it, which
 * makes the intent explicit. Built on the Radix dialog: focus is trapped,
 * Escape and the backdrop cancel, and focus returns to the trigger.
 */
export function ConfirmDialog({
  open,
  title,
  description,
  phrase,
  confirmLabel,
  pending = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const t = useT();
  const [typed, setTyped] = useState("");
  const inputId = useId();
  const confirmed = matchesConfirmation(typed, phrase);
  // Opened programmatically (no Radix trigger), so remember what had focus
  // and give it back on close; otherwise keyboard users land on <body>.
  const returnFocusTo = useRef<HTMLElement | null>(null);
  useEffect(() => {
    if (open) returnFocusTo.current = document.activeElement as HTMLElement | null;
  }, [open]);

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) onCancel();
        setTyped("");
      }}
    >
      <DialogContent
        role="alertdialog"
        onCloseAutoFocus={(event) => {
          event.preventDefault();
          returnFocusTo.current?.focus();
        }}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="size-4 text-destructive" aria-hidden />
            {title}
          </DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <form
          className="grid gap-4"
          onSubmit={(event) => {
            event.preventDefault();
            if (confirmed && !pending) onConfirm();
          }}
        >
          <div className="grid gap-1.5">
            <Label htmlFor={inputId} className="font-normal text-muted-foreground">
              {t("confirm.typeToConfirm")}{" "}
              <code className="select-all break-all rounded bg-muted px-1 py-0.5 font-mono text-foreground">
                {phrase}
              </code>
            </Label>
            <Input
              id={inputId}
              value={typed}
              onChange={(event) => setTyped(event.target.value)}
              autoComplete="off"
              spellCheck={false}
              autoFocus
              className="font-mono"
            />
          </div>
          <DialogFooter>
            <Button variant="secondary" onClick={onCancel}>
              {t("confirm.cancel")}
            </Button>
            <Button type="submit" variant="danger" disabled={!confirmed} loading={pending}>
              {confirmLabel}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
