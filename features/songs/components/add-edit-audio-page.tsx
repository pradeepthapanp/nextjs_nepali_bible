"use client";

import { useRef, useState, type ReactNode } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Image as ImageIcon,
  Music as MusicIcon,
  ShieldAlert,
  UploadCloud,
} from "lucide-react";
import { toast } from "sonner";
import { useSupabase } from "@/providers/supabase-provider";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LoadingState } from "@/components/ui/loading-state";
import { Spinner } from "@/components/ui/spinner";
import { useAudioUpload } from "../hooks";
import { useAudio, useCreateAudio, useCurrentProfile, useUpdateAudio } from "../queries";
import type { Audio } from "../types";
import { fileBaseName, fileExtension } from "@/utils/content-type";
import { cn } from "@/utils/cn";

/**
 * AddEditAudioPage — the admin create/edit form (the web replacement of
 * `AddEditNewAudioPage` in `lib/audios/add_new_audio_page.dart`).
 *
 *   - create mode: text fields + optional cover upload + required audio upload
 *     (via the shared `UploadService` edge functions), then `createAudio`;
 *   - edit mode: text-only update (Flutter hides the file pickers when editing);
 *   - validation mirrors the Flutter validators (title/artist/category/
 *     description required, audio file required on create);
 *   - admin-only gate (admin/editor role from `useCurrentProfile`).
 *
 * The upload progress card mirrors `UploadNotifier` consumption. All data
 * changes go through React Query mutations — no direct Supabase here.
 */
export function AddEditAudioPage() {
  const router = useRouter();
  const params = useParams<{ id?: string }>();
  const editId = params?.id;
  const isEdit = Boolean(editId);

  const { session } = useSupabase();
  const userId = session?.user?.id;
  const { data: existing, isLoading: loadingAudio } = useAudio(editId);
  const { canManage, isLoading: loadingProfile } = useCurrentProfile();
  const createAudio = useCreateAudio();
  const updateAudio = useUpdateAudio();
  const { state: upload, uploadCover, uploadAudio } = useAudioUpload();

  const [title, setTitle] = useState("");
  const [artist, setArtist] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const coverInputRef = useRef<HTMLInputElement | null>(null);
  const audioInputRef = useRef<HTMLInputElement | null>(null);

  // Seed the form from the loaded audio (edit mode) via the render-phase
  // state-adjustment pattern — no setState in an effect.
  const [seededId, setSeededId] = useState<string | null>(null);
  if (existing && existing.id !== seededId) {
    setSeededId(existing.id);
    setTitle(existing.title);
    setArtist(existing.artist ?? "");
    setCategory(existing.category ?? "");
    setDescription(existing.description ?? "");
  }

  const busy = saving || upload.isUploading;

  const handleSave = async (event: React.FormEvent) => {
    event.preventDefault();
    const nextErrors: Record<string, string> = {};
    if (!title.trim()) nextErrors.title = "Required";
    if (!artist.trim()) nextErrors.artist = "Please add artist";
    if (!category.trim()) nextErrors.category = "Add category";
    if (!description.trim()) nextErrors.description = "Add short description";
    if (!isEdit && !audioFile) nextErrors.audio = "Please select audio file";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;
    if (!userId) {
      toast.error("User not signed in");
      return;
    }

    setSaving(true);
    try {
      if (isEdit && existing) {
        await updateAudio.mutateAsync({
          ...existing,
          title: title.trim(),
          artist: artist.trim(),
          category: category.trim(),
          description: description.trim(),
        });
        toast.success("Audio updated successfully.");
        router.push("/songs");
        return;
      }

      // Create: upload the optional cover then the required audio.
      let artUrl: string | undefined;
      if (coverFile) {
        artUrl = await uploadCover(
          coverFile,
          buildFileName(coverFile.name),
          coverFile.name,
        );
      }
      if (!audioFile) throw new Error("Audio file missing");
      const audioUrl = await uploadAudio(
        audioFile,
        buildFileName(audioFile.name),
        audioFile.name,
      );
      const now = new Date().toISOString();
      const audio: Audio = {
        id: crypto.randomUUID(),
        title: title.trim(),
        artist: artist.trim(),
        category: category.trim(),
        description: description.trim(),
        audioUrl,
        artUrl,
        playCount: 0,
        uploadedBy: userId,
        createdAt: now,
        updatedAt: now,
      };
      await createAudio.mutateAsync(audio);
      toast.success("Audio uploaded successfully.");
      router.push("/songs");
    } catch (error) {
      console.error("Error saving audio", error);
      toast.error("Error saving audio");
    } finally {
      setSaving(false);
    }
  };

  // Loading the edited audio.
  if (isEdit && loadingAudio) {
    return (
      <PageShell>
        <LoadingState label="Loading audio…" />
      </PageShell>
    );
  }
  if (isEdit && !existing) {
    return (
      <PageShell>
        <ErrorState
          title="Audio not found"
          description="This audio may have been removed."
          onRetry={() => router.push("/songs")}
        />
      </PageShell>
    );
  }
  // Admin gate.
  if (!loadingProfile && !canManage) {
    return (
      <PageShell>
        <EmptyState
          icon={ShieldAlert}
          title="Admin only"
          description="You need an admin or editor account to manage audios."
        />
      </PageShell>
    );
  }

  return (
    <div className="min-h-dvh bg-background text-foreground">
      <header className="sticky top-0 z-30 border-b bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/75">
        <div className="mx-auto flex w-full max-w-2xl items-center gap-3 px-4 py-3">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label="Back to audio library"
            onClick={() => router.push("/songs")}
          >
            <ArrowLeft aria-hidden />
          </Button>
          <h1 className="text-xl font-bold">{isEdit ? "Edit Audio" : "Add Audio"}</h1>
        </div>
      </header>

      <div className="mx-auto w-full max-w-2xl px-4 py-6 pb-16">
        {upload.isUploading ? (
          <div className="mb-4 rounded-xl border bg-card p-4">
            <div className="flex items-center justify-between gap-2 text-sm">
              <span className="truncate font-medium">
                {upload.uploading ?? "Uploading…"}
              </span>
              <span className="font-bold text-primary tabular-nums">
                {Math.round(upload.progress * 100)}%
              </span>
            </div>
            <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary transition-[width]"
                style={{ width: `${Math.min(100, Math.max(0, upload.progress * 100))}%` }}
              />
            </div>
          </div>
        ) : null}

        <form onSubmit={handleSave} className="space-y-4" noValidate>
          <Field label="Title" error={errors.title}>
            <Input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Enter a title"
              disabled={busy}
              aria-invalid={Boolean(errors.title)}
            />
          </Field>
          <Field label="Artist" error={errors.artist}>
            <Input
              value={artist}
              onChange={(event) => setArtist(event.target.value)}
              placeholder="Enter the artist"
              disabled={busy}
              aria-invalid={Boolean(errors.artist)}
            />
          </Field>
          <Field label="Category" error={errors.category}>
            <Input
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              placeholder="e.g. Worship, Gospel, Kids…"
              disabled={busy}
              aria-invalid={Boolean(errors.category)}
            />
          </Field>
          <Field label="Description" error={errors.description}>
            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Add a short description"
              disabled={busy}
              aria-invalid={Boolean(errors.description)}
              className="flex min-h-24 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50"
            />
          </Field>

          {!isEdit ? (
            <>
              <FilePicker
                icon={ImageIcon}
                label="Cover Art"
                fileName={coverFile?.name}
                onPick={() => coverInputRef.current?.click()}
                disabled={busy}
              />
              <FilePicker
                icon={MusicIcon}
                label="Audio File"
                fileName={audioFile?.name}
                required
                error={errors.audio}
                onPick={() => audioInputRef.current?.click()}
                disabled={busy}
              />
            </>
          ) : null}

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/songs")}
              disabled={busy}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={busy || !canManage}>
              {busy ? <Spinner className="size-4" /> : <UploadCloud aria-hidden />}
              {busy
                ? isEdit
                  ? "Updating…"
                  : "Uploading…"
                : isEdit
                  ? "Save Audio"
                  : "Upload Audio"}
            </Button>
          </div>
        </form>

        <input
          ref={coverInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(event) => setCoverFile(event.target.files?.[0] ?? null)}
        />
        <input
          ref={audioInputRef}
          type="file"
          accept="audio/*,.mp3,.m4a,.wav,.aac"
          className="hidden"
          onChange={(event) => setAudioFile(event.target.files?.[0] ?? null)}
        />
      </div>
    </div>
  );
}

/** Header shell for the loading/empty/gate states. */
function PageShell({ children }: { children: ReactNode }) {
  return <div className="min-h-dvh bg-background text-foreground">{children}</div>;
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      {children}
      {error ? (
        <p role="alert" className="text-xs font-medium text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  );
}

function FilePicker({
  icon: Icon,
  label,
  fileName,
  required,
  error,
  onPick,
  disabled,
}: {
  icon: typeof ImageIcon;
  label: string;
  fileName?: string;
  required?: boolean;
  error?: string;
  onPick: () => void;
  disabled?: boolean;
}) {
  const hasFile = Boolean(fileName);
  return (
    <div className="space-y-1.5">
      <button
        type="button"
        onClick={onPick}
        disabled={disabled}
        className={cn(
          "flex w-full items-center gap-3 rounded-xl border p-4 text-left transition-colors",
          hasFile
            ? "border-primary/50 bg-primary/5"
            : "border-border hover:bg-accent/50",
          disabled && "cursor-not-allowed opacity-50",
        )}
      >
        <span className="grid size-11 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
          <Icon className="size-5" aria-hidden />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-semibold text-foreground">
            {label}
            {required ? (
              <span className="ml-0.5 text-destructive">*</span>
            ) : null}
          </span>
          {hasFile ? (
            <span className="block truncate text-xs text-muted-foreground">
              {fileName}
            </span>
          ) : null}
        </span>
        <span className="shrink-0 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
          {hasFile ? "Change" : "Browse"}
        </span>
      </button>
      {error ? (
        <p role="alert" className="text-xs font-medium text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  );
}

/** Builds a unique upload file name (mirrors the Flutter `Uuid().v4()_base.ext`). */
function buildFileName(name: string): string {
  return `${crypto.randomUUID()}_${fileBaseName(name)}.${fileExtension(name)}`;
}
