"use client";

import { useState } from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/utils/cn";

export interface PrayerReplyComposerProps {
  onSend: (text: string) => void;
  isSending?: boolean;
  placeholder?: string;
  className?: string;
}

/**
 * PrayerReplyComposer — the reply input (the web equivalent of the
 * `_buildReplyInput` in `PrayerDetailsSheet`: a multiline field + a send
 * button). Presentational; the page wires `onSend` to the behavior-hook reply
 * action. Enter sends (Shift+Enter for a new line).
 */
export function PrayerReplyComposer({
  onSend,
  isSending = false,
  placeholder = "Write a reply...",
  className,
}: PrayerReplyComposerProps) {
  const [text, setText] = useState("");

  const send = () => {
    const value = text.trim();
    if (!value || isSending) return;
    onSend(value);
    setText("");
  };

  return (
    <div className={cn("flex items-end gap-2", className)}>
      <textarea
        value={text}
        onChange={(event) => setText(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
            send();
          }
        }}
        rows={2}
        placeholder={placeholder}
        disabled={isSending}
        aria-label="Write a reply"
        className="min-h-[2.5rem] w-full resize-y rounded-lg border border-input bg-background px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
      />
      <Button
        type="button"
        size="icon"
        onClick={send}
        disabled={isSending || !text.trim()}
        aria-label="Send reply"
      >
        {isSending ? (
          <Spinner className="size-4 text-primary-foreground" />
        ) : (
          <Send className="size-4" aria-hidden />
        )}
      </Button>
    </div>
  );
}
