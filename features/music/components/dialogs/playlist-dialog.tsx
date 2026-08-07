"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { DialogPanel } from "./dialog-panel";

export type PlaylistDialogMode = "create" | "edit";

export interface PlaylistDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: PlaylistDialogMode;
  initialName?: string;
  initialDescription?: string;
  /** Submit the form (the parent composes `usePlaylistActions`). */
  onSubmit: (input: { name: string; description?: string }) => void;
  /** Shows a spinner + disables actions while an async action runs. */
  loading?: boolean;
  className?: string;
}

/**
 * PlaylistDialog — the create/edit playlist form (the web equivalent of
 * `new_playlist_dialog.dart`, which Flutter reuses for both create and edit).
 * Presentational: form state is local; submit is delegated to the parent.
 *
 * The form lives in an inner component rendered only while the dialog is open
 * (`DialogPanel` mounts its children conditionally), so it remounts with fresh
 * initial values on every open — no imperative reset needed.
 */
export function PlaylistDialog({
  open,
  onOpenChange,
  mode,
  initialName,
  initialDescription,
  onSubmit,
  loading,
  className,
}: PlaylistDialogProps) {
  return (
    <DialogPanel
      open={open}
      onOpenChange={onOpenChange}
      title={mode === "create" ? "Create playlist" : "Edit playlist"}
      description="Name your collection and add an optional description."
      className={className}
    >
      <PlaylistDialogForm
        mode={mode}
        initialName={initialName}
        initialDescription={initialDescription}
        onSubmit={onSubmit}
        loading={loading}
        onCancel={() => onOpenChange(false)}
      />
    </DialogPanel>
  );
}

interface PlaylistDialogFormProps {
  mode: PlaylistDialogMode;
  initialName?: string;
  initialDescription?: string;
  onSubmit: (input: { name: string; description?: string }) => void;
  loading?: boolean;
  onCancel: () => void;
}

function PlaylistDialogForm({
  mode,
  initialName,
  initialDescription,
  onSubmit,
  loading,
  onCancel,
}: PlaylistDialogFormProps) {
  const [name, setName] = React.useState(initialName ?? "");
  const [description, setDescription] = React.useState(
    initialDescription ?? "",
  );

  const trimmedName = name.trim();
  const canSubmit = trimmedName.length >= 2 && !loading;

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!canSubmit) return;
    onSubmit({
      name: trimmedName,
      description: description.trim() ? description.trim() : undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="playlist-name">Playlist name</Label>
        <Input
          id="playlist-name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Enter a name…"
          disabled={loading}
          autoFocus
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="playlist-description">Description</Label>
        <Input
          id="playlist-description"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          placeholder="Optional…"
          disabled={loading}
        />
      </div>
      <div className="flex justify-end gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={loading}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={!canSubmit}>
          {loading ? <Spinner className="size-4" /> : null}
          {mode === "create" ? "Create" : "Save"}
        </Button>
      </div>
    </form>
  );
}
