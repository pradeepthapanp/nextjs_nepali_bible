"use client";

import { useRef } from "react";
import { Pencil } from "lucide-react";
import { useTranslations } from "next-intl";
import { Avatar } from "@/components/ui/avatar";
import { Spinner } from "@/components/ui/spinner";
import type { Profile } from "@/types/profile";

export interface ProfileAvatarProps {
  profile: Profile | null;
  /** True while the avatar upload mutation is running. */
  uploading?: boolean;
  /** Called with the picked image file (the page uploads via useProfileEditor). */
  onSelect?: (file: File) => void;
  disabled?: boolean;
  className?: string;
}

/**
 * ProfileAvatar — the profile picture with an edit affordance (the web
 * equivalent of the `CircleAvatar` + edit badge in `profile_page.dart`).
 * PRESENTATIONAL: the page passes `onSelect(file)` which calls
 * `useProfileEditor.uploadAvatar` — that upload goes through the SHARED
 * `UploadService` (via `AuthService.uploadAvatar`), so the picker itself never
 * touches storage/Supabase. The hidden file input keeps the control
 * keyboard/screen-reader accessible (a labelled button opening a picker).
 */
export function ProfileAvatar({
  profile,
  uploading = false,
  onSelect,
  disabled = false,
  className,
}: ProfileAvatarProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const t = useTranslations("auth");

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    // Allow re-selecting the same file later.
    event.target.value = "";
    if (file && onSelect) onSelect(file);
  };

  return (
    <div className={className}>
      <button
        type="button"
        className="group relative block rounded-full"
        onClick={() => inputRef.current?.click()}
        disabled={disabled || uploading}
        aria-label={t("changeProfilePicture")}
      >
        <Avatar
          src={profile?.avatarUrl}
          name={profile?.fullName}
          size="xl"
          alt={profile?.fullName ? `${profile.fullName}'s avatar` : "Avatar"}
          className="ring-2 ring-border transition group-hover:ring-primary"
        />
        <span className="absolute bottom-0 right-0 grid size-8 place-items-center rounded-full bg-primary text-primary-foreground shadow transition group-hover:bg-primary/90">
          {uploading ? (
            <Spinner className="size-4 text-primary-foreground" />
          ) : (
            <Pencil className="size-4" aria-hidden />
          )}
        </span>
      </button>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="sr-only"
        onChange={handleChange}
        disabled={disabled || uploading}
        aria-hidden
        tabIndex={-1}
      />
    </div>
  );
}
