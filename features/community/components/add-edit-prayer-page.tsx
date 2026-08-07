"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { AuthGate } from "@features/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LoadingState } from "@/components/ui/loading-state";
import { PageContainer } from "@/components/ui/page-container";
import { Spinner } from "@/components/ui/spinner";
import {
  PRAYER_DETAILS_MAX_LENGTH,
  PRAYER_DETAILS_MIN_LENGTH,
  PRAYER_TITLE_MAX_LENGTH,
  PRAYER_TITLE_MIN_LENGTH,
} from "../constants";
import { useCommunityNavigation, usePrayerActions } from "../hooks";
import { usePrayer } from "../queries";

export interface AddEditPrayerPageProps {
  /** Present in edit mode (the route `/prayers/edit/{id}`). */
  id?: string;
}

/**
 * AddEditPrayerPage — the prayer create/edit form (the web replacement of
 * `AddEditPrayerSheet` in `lib/community/edit_prayer_sheet.dart`).
 *
 * COMPOSES ONLY existing pieces — no validation/upload/mutation/navigation
 * logic is re-implemented here beyond the field-level form state:
 *   - `AuthGate` — PROTECTED (signed-in only);
 *   - `usePrayer(id)` — loads the prayer being edited (seeded into the form
 *     via the render-phase state-adjustment pattern — no setState in effects);
 *   - `usePrayerActions` — `createPrayer` / `updatePrayer` (React Query);
 *   - `useCommunityNavigation` — `openPrayer` (deep link after save);
 *   - the `PRAYER_*` validators (shared constants).
 * The `isAnonymous` toggle is the Flutter `_isAnonymous` switch.
 */
export function AddEditPrayerPage({ id }: AddEditPrayerPageProps) {
  const router = useRouter();
  const isEdit = Boolean(id);

  const { data: existing, isLoading: loadingExisting } = usePrayer(
    isEdit ? id : undefined,
  );
  const actions = usePrayerActions();
  const { openPrayer } = useCommunityNavigation();

  const [title, setTitle] = useState("");
  const [details, setDetails] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{
    title?: string;
    details?: string;
  }>({});
  const [saving, setSaving] = useState(false);

  // Seed the form from the loaded prayer (edit mode) via the render-phase
  // state-adjustment pattern — no setState in an effect.
  const [seededId, setSeededId] = useState<string | null>(null);
  if (existing && existing.id !== seededId) {
    setSeededId(existing.id);
    setTitle(existing.title);
    setDetails(existing.details);
    setIsAnonymous(existing.isAnonymous);
  }

  const goBack = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else {
      router.replace("/prayers");
    }
  };

  const handleSave = async () => {
    if (saving) return;
    const nextErrors: typeof fieldErrors = {};
    const trimmedTitle = title.trim();
    const trimmedDetails = details.trim();
    if (!trimmedTitle) {
      nextErrors.title = "Please enter a title";
    } else if (trimmedTitle.length < PRAYER_TITLE_MIN_LENGTH) {
      nextErrors.title = `Title must be at least ${PRAYER_TITLE_MIN_LENGTH} characters`;
    }
    if (!trimmedDetails) {
      nextErrors.details = "Please write your prayer request";
    } else if (trimmedDetails.length < PRAYER_DETAILS_MIN_LENGTH) {
      nextErrors.details = `Please write a little more (minimum ${PRAYER_DETAILS_MIN_LENGTH} characters)`;
    }
    setFieldErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSaving(true);
    try {
      const input = {
        title: trimmedTitle,
        details: trimmedDetails,
        isAnonymous,
      };
      if (isEdit && id) {
        await actions.updatePrayer(id, input);
        toast.success("Prayer updated successfully.");
        openPrayer(id);
      } else {
        const created = await actions.createPrayer(input);
        toast.success("Prayer added successfully.");
        openPrayer(created.id);
      }
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : isEdit
            ? "Unable to update prayer."
            : "Unable to add prayer.",
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
              {isEdit ? "Edit Prayer" : "Add Prayer"}
            </h1>
          </div>
        </header>

        <PageContainer maxWidth="3xl" className="py-6 pb-16">
          {isEdit && loadingExisting ? (
            <LoadingState label="Loading prayer…" />
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>{isEdit ? "Edit Prayer" : "Add Prayer"}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="prayer-title">Title</Label>
                  <Input
                    id="prayer-title"
                    value={title}
                    onChange={(event) => setTitle(event.target.value)}
                    maxLength={PRAYER_TITLE_MAX_LENGTH}
                    disabled={saving}
                    aria-invalid={Boolean(fieldErrors.title)}
                  />
                  {fieldErrors.title ? (
                    <p className="text-xs text-destructive">{fieldErrors.title}</p>
                  ) : null}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="prayer-details">Prayer Request</Label>
                  <textarea
                    id="prayer-details"
                    value={details}
                    onChange={(event) => setDetails(event.target.value)}
                    rows={6}
                    maxLength={PRAYER_DETAILS_MAX_LENGTH}
                    disabled={saving}
                    aria-invalid={Boolean(fieldErrors.details)}
                    className="w-full resize-y rounded-lg border border-input bg-background px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
                  />
                  {fieldErrors.details ? (
                    <p className="text-xs text-destructive">{fieldErrors.details}</p>
                  ) : null}
                </div>

                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={isAnonymous}
                    onChange={(event) => setIsAnonymous(event.target.checked)}
                    disabled={saving}
                    className="size-4 accent-primary"
                  />
                  <span>Post anonymously</span>
                  <span className="text-muted-foreground">
                    (your name will not be shown)
                  </span>
                </label>

                <div className="flex justify-end gap-2 pt-2">
                  <Button type="button" variant="outline" onClick={goBack} disabled={saving}>
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    onClick={() => void handleSave()}
                    disabled={saving}
                  >
                    {saving ? <Spinner className="size-4 text-primary-foreground" /> : null}
                    {isEdit ? "Save Changes" : "Add Prayer"}
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
