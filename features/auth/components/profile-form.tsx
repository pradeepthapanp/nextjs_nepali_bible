"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { AUTH_NAME_MAX_LENGTH, AUTH_NAME_MIN_LENGTH, AUTH_PHONE_COUNTRY_CODE, AUTH_PHONE_DIGIT_LENGTH } from "../constants";
import { formatNepalPhone, isValidNepalPhone } from "../utils";
import type { Profile } from "@/types/profile";

export interface ProfileFormProps {
  profile: Profile;
  /** True while a profile/account mutation is running. */
  saving?: boolean;
  /** Save the full name (the page calls `useProfileEditor.updateProfile`). */
  onSaveName?: (fullName: string) => void;
  /** Save the phone (the page calls `useProfileEditor.updateProfile`). */
  onSavePhone?: (phone: string) => void;
}

/**
 * ProfileForm — the editable full-name + phone fields with a read-only email
 * (the web equivalent of the fields card in `profile_page.dart`). PRESENTATIONAL:
 * the page wires `onSaveName`/`onSavePhone` to `useProfileEditor.updateProfile`
 * (the SHARED `ProfileService.updateProfile` — the single profiles-table
 * write). Validators mirror Flutter `_saveUserName` (4–32) / `_savePhone`
 * (+977 10 digits). No Supabase, no duplicated profile logic.
 */
export function ProfileForm({
  profile,
  saving = false,
  onSaveName,
  onSavePhone,
}: ProfileFormProps) {
  const [fullName, setFullName] = useState(profile.fullName ?? "");
  const [phoneDigits, setPhoneDigits] = useState(
    profile.phone?.startsWith("+977") ? profile.phone.slice(4) : "",
  );
  const [nameError, setNameError] = useState<string | null>(null);
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const t = useTranslations("auth");

  const handleSaveName = () => {
    const name = fullName.trim();
    if (!name) {
      setNameError(t("validationNameEmpty"));
      return;
    }
    if (name.length < AUTH_NAME_MIN_LENGTH) {
      setNameError(t("validationNameLengthMin", { min: AUTH_NAME_MIN_LENGTH }));
      return;
    }
    if (name.length > AUTH_NAME_MAX_LENGTH) {
      setNameError(t("validationNameLengthMax", { max: AUTH_NAME_MAX_LENGTH }));
      return;
    }
    setNameError(null);
    onSaveName?.(name);
  };

  const handleSavePhone = () => {
    if (!phoneDigits.trim()) {
      setPhoneError(t("validationPhoneRequired"));
      return;
    }
    if (phoneDigits.trim().length !== AUTH_PHONE_DIGIT_LENGTH) {
      setPhoneError(t("validationPhoneLength"));
      return;
    }
    if (!isValidNepalPhone(phoneDigits)) {
      setPhoneError(t("validationPhoneNepal"));
      return;
    }
    setPhoneError(null);
    onSavePhone?.(formatNepalPhone(phoneDigits));
  };

  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="profile-name">{t("fullNameLabel")}</Label>
        <Input
          id="profile-name"
          autoComplete="name"
          value={fullName}
          onChange={(event) => setFullName(event.target.value)}
          onBlur={handleSaveName}
          disabled={saving}
          aria-invalid={Boolean(nameError)}
        />
        {nameError ? (
          <p className="text-xs text-destructive">{nameError}</p>
        ) : (
          <p className="text-xs text-muted-foreground">
            {t("profileNameHint", {
              min: AUTH_NAME_MIN_LENGTH,
              max: AUTH_NAME_MAX_LENGTH,
            })}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="profile-email">{t("emailLabel")}</Label>
        <Input
          id="profile-email"
          type="email"
          value={profile.email ?? ""}
          disabled
          readOnly
        />
        <p className="text-xs text-muted-foreground">
          {t("profileEmailReadonly")}
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="profile-phone">{t("phoneLabel")}</Label>
        <div className="flex items-stretch">
          <span className="inline-flex items-center rounded-l-lg border border-r-0 border-input bg-muted px-3 text-sm text-muted-foreground">
            {AUTH_PHONE_COUNTRY_CODE}
          </span>
          <Input
            id="profile-phone"
            type="tel"
            inputMode="numeric"
            autoComplete="tel-national"
            placeholder="98XXXXXXXX"
            maxLength={AUTH_PHONE_DIGIT_LENGTH}
            value={phoneDigits}
            onChange={(event) =>
              setPhoneDigits(event.target.value.replace(/\D/g, ""))
            }
            onBlur={handleSavePhone}
            disabled={saving}
            aria-invalid={Boolean(phoneError)}
            className="rounded-l-none"
          />
        </div>
        {phoneError ? (
          <p className="text-xs text-destructive">{phoneError}</p>
        ) : (
          <p className="text-xs text-muted-foreground">{t("profilePhoneHint")}</p>
        )}
      </div>

      <Button type="button" variant="secondary" onClick={handleSaveName} disabled={saving}>
        {saving ? <Spinner className="size-4" /> : null}
        {t("saveChanges")}
      </Button>
    </div>
  );
}
