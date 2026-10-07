"use client";

import { useEffect, useId, useRef, useState } from "react";
import { AlertTriangle } from "lucide-react";
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
 * makes the intent explicit. Escape or the backdrop cancels.
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
  const inputRef = useRef<HTMLInputElement>(null);
  const titleId = useId();

  useEffect(() => {
    if (!open) return;
    setTyped("");
    inputRef.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onCancel();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onCancel]);

  if (!open) return null;
  const confirmed = matchesConfirmation(typed, phrase);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onCancel}
    >
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="w-full max-w-md rounded-xl border bg-white p-6 shadow-2xl dark:border-surface-700 dark:bg-surface-900"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start gap-3">
          <AlertTriangle size={20} className="mt-0.5 shrink-0 text-red-500" />
          <div className="min-w-0 space-y-2">
            <h2 id={titleId} className="text-sm font-semibold text-surface-900 dark:text-white">
              {title}
            </h2>
            <p className="text-xs text-surface-600 dark:text-surface-300">{description}</p>
          </div>
        </div>
        <form
          className="mt-4 space-y-3"
          onSubmit={(event) => {
            event.preventDefault();
            if (confirmed && !pending) onConfirm();
          }}
        >
          <label className="block text-xs text-surface-500">
            {t("confirm.typeToConfirm")}{" "}
            <code className="select-all break-all font-mono text-surface-900 dark:text-white">
              {phrase}
            </code>
          </label>
          <input
            ref={inputRef}
            value={typed}
            onChange={(event) => setTyped(event.target.value)}
            autoComplete="off"
            spellCheck={false}
            className="input-field w-full py-1.5 font-mono text-sm"
          />
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onCancel}
              className="rounded-lg border px-3 py-1.5 text-xs dark:border-surface-700"
            >
              {t("confirm.cancel")}
            </button>
            <button
              type="submit"
              disabled={!confirmed || pending}
              className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-40"
            >
              {confirmLabel}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
