"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ImagePlus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { AuthGate } from "@features/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LoadingState } from "@/components/ui/loading-state";
import { PageContainer } from "@/components/ui/page-container";
import { Spinner } from "@/components/ui/spinner";
import { useCommunityNavigation, useNoticeActions } from "../hooks";
import { useNotice } from "../queries";
import { NoticeImage } from "./notice/notice-image";

export interface AddEditNoticePageProps {
  /** Present in edit mode (the route `/notices/edit/{id}`). */
  id?: string;
}

/**
 * AddEditNoticePage — the notice create/edit form (the web replacement of
 * `AddNewNoticePage` in `lib/community/add_notice_page.dart`).
 *
 * COMPOSES ONLY existing pieces — no mutation/upload/validation/navigation
 * logic is re-implemented here beyond the field-level form state:
 *   - `AuthGate` — PROTECTED (signed-in only);
 *   - `useNotice(id)` — loads the notice being edited (seeded into the form
 *     via the render-phase state-adjustment pattern — no setState in effects);
 *   - `useNoticeActions` — `createNotice` / `updateNotice`, and
 *     `uploadNoticeImage` (which delegates to the SHARED `UploadService`
 *     through `NoticeService`, exposing progress) — the create/edit uploads a
 *     new image first (if chosen), then saves the notice with the returned URL;
 *   - `useCommunityNavigation` — `openNotice` (deep link after save).
 * The `isPublished` switch + `expiresAt` date picker mirror the Flutter form.
 */
export function AddEditNoticePage({ id }: AddEditNoticePageProps) {
  const router = useRouter();
  const isEdit = Boolean(id);

  const { data: existing, isLoading: loadingExisting } = useNotice(
    isEdit ? id : undefined,
  );
  const actions = useNoticeActions();
  const { openNotice } = useCommunityNavigation();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isPublished, setIsPublished] = useState(false);
  const [expiresAt, setExpiresAt] = useState<string | undefined>(undefined);
  const [imageUrl, setImageUrl] = useState<string | undefined>(undefined);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [fieldErrors, setFieldErrors] = useState<{
    title?: string;
    description?: string;
  }>({});
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Seed the form from the loaded notice (edit mode) via the render-phase
  // state-adjustment pattern — no setState in an effect.
  const [seededId, setSeededId] = useState<string | null>(null);
  if (existing && existing.id !== seededId) {
    setSeededId(existing.id);
    setTitle(existing.title);
    setDescription(existing.description ?? "");
    setIsPublished(existing.isPublished);
    setExpiresAt(existing.expiresAt);
    setImageUrl(existing.imageUrl);
  }

  const busy = saving || actions.isUploading;

  const goBack = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else {
      router.replace("/notices");
    }
  };

  const pickImage = (file: File | null) => {
    setImageFile(file);
    // A new file replaces any existing image.
    if (file) setImageUrl(undefined);
  };

  const removeImage = () => {
    setImageFile(null);
    setImageUrl(undefined);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSave = async () => {
    if (busy) return;
    const nextErrors: typeof fieldErrors = {};
    const trimmedTitle = title.trim();
    const trimmedDescription = description.trim();
    if (!trimmedTitle) nextErrors.title = "Please enter a title";
    if (!trimmedDescription)
      nextErrors.description = "Please write a description";
    setFieldErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSaving(true);
    try {
      // Upload a newly-picked image first (SHARED UploadService via the hook).
      let finalImageUrl = imageUrl;
      if (imageFile) {
        setUploadProgress(0);
        finalImageUrl = await actions.uploadNoticeImage(
          imageFile,
          imageFile.name,
          (progress) => setUploadProgress(progress),
        );
      }
      const input = {
        title: trimmedTitle,
        description: trimmedDescription,
        imageUrl: finalImageUrl,
        isPublished,
        expiresAt,
      };
      if (isEdit && id) {
        await actions.updateNotice({ ...input, id });
        toast.success("Notice updated successfully.");
        openNotice(id);
      } else {
        const created = await actions.createNotice(input);
        toast.success(
          isPublished ? "Notice published." : "Notice saved as a draft.",
        );
        openNotice(created.id);
      }
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : isEdit
            ? "Unable to update notice."
            : "Unable to add notice.",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <AuthGate>
      <div className="min-h-dvh bg-background text-foreground">
        <header className="sticky top-0 z-30 border-b bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/75">
          <div className="mx-auto flex w-full max-w-3xl items-center gap-3 px-4 py-3">
            <Button type="button" variant="ghost" size="icon" onClick={goBack} aria-label="Back">
              <ArrowLeft className="size-5" aria-hidden />
            </Button>
            <h1 className="text-xl font-bold">
              {isEdit ? "Edit Notice" : "New Notice"}
            </h1>
          </div>
        </header>

        <PageContainer maxWidth="3xl" className="py-6 pb-16">
          {isEdit && loadingExisting ? (
            <LoadingState label="Loading notice…" />
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>{isEdit ? "Edit Notice" : "New Notice"}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="notice-title">Title</Label>
                  <Input
                    id="notice-title"
                    value={title}
                    onChange={(event) => setTitle(event.target.value)}
                    disabled={busy}
                    aria-invalid={Boolean(fieldErrors.title)}
                  />
                  {fieldErrors.title ? (
                    <p className="text-xs text-destructive">{fieldErrors.title}</p>
                  ) : null}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notice-description">Description</Label>
                  <textarea
                    id="notice-description"
                    value={description}
                    onChange={(event) => setDescription(event.target.value)}
                    rows={5}
                    disabled={busy}
                    aria-invalid={Boolean(fieldErrors.description)}
                    className="w-full resize-y rounded-lg border border-input bg-background px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
                  />
                  {fieldErrors.description ? (
                    <p className="text-xs text-destructive">{fieldErrors.description}</p>
                  ) : null}
                </div>

                <div className="space-y-2">
                  <Label>Image</Label>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    aria-label="Choose notice image"
                    onChange={(event) => pickImage(event.target.files?.[0] ?? null)}
                  />
                  {imageUrl ? (
                    <div className="space-y-2">
                      <NoticeImage src={imageUrl} alt={title || "Notice image"} />
                      <div className="flex items-center gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => fileInputRef.current?.click()}
                          disabled={busy}
                        >
                          <ImagePlus className="size-4" aria-hidden />
                          Change
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                          onClick={removeImage}
                          disabled={busy}
                        >
                          <Trash2 className="size-4" aria-hidden />
                          Remove
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={busy}
                    >
                      <ImagePlus className="size-4" aria-hidden />
                      {imageFile ? "Change image" : "Choose image"}
                    </Button>
                  )}
                  {imageFile ? (
                    <p className="text-xs text-muted-foreground">
                      Selected: {imageFile.name}
                    </p>
                  ) : null}
                  {actions.isUploading ? (
                    <div className="flex items-center gap-3 text-sm">
                      <span className="text-muted-foreground">Uploading…</span>
                      <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full bg-primary transition-all"
                          style={{ width: `${Math.round(uploadProgress * 100)}%` }}
                        />
                      </div>
                      <span className="font-bold text-primary tabular-nums">
                        {Math.round(uploadProgress * 100)}%
                      </span>
                    </div>
                  ) : null}
                </div>

                <div className="flex flex-wrap items-center gap-6">
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={isPublished}
                      onChange={(event) => setIsPublished(event.target.checked)}
                      disabled={busy}
                      className="size-4 accent-primary"
                    />
                    <span>Published</span>
                  </label>

                  <label className="flex items-center gap-2 text-sm">
                    <span className="text-muted-foreground">Expires on</span>
                    <input
                      type="date"
                      value={expiresAt ? expiresAt.slice(0, 10) : ""}
                      onChange={(event) =>
                        setExpiresAt(
                          event.target.value ? `${event.target.value}T00:00:00Z` : undefined,
                        )
                      }
                      disabled={busy}
                      className="rounded-lg border border-input bg-background px-3 py-1.5 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
                      aria-label="Expiry date"
                    />
                  </label>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <Button type="button" variant="outline" onClick={goBack} disabled={busy}>
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    onClick={() => void handleSave()}
                    disabled={busy}
                  >
                    {busy ? <Spinner className="size-4 text-primary-foreground" /> : null}
                    {isEdit ? "Save Changes" : "Add Notice"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </PageContainer>
      </div>
    </AuthGate>
  );
}
