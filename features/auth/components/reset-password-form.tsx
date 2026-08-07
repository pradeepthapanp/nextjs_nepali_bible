"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { useAuthActions } from "../hooks";
import { getAuthErrorMessage, isValidPassword } from "../utils";

/**
 * ResetPasswordForm — the recovery-link "set a new password" form (WEB-FIRST).
 * The user lands on `/reset-password` with the Supabase recovery token in the
 * URL hash; the provider's `getSession()` recovers that session, and this form
 * submits the new password via the existing `useAuthActions.resetPassword`
 * (`AuthService.updatePassword` — the same mutation as the signed-in change).
 * After success, `useAuthActions` redirects to `?next=`/`/profile`.
 * No Supabase, no duplicated auth logic.
 */
export function ResetPasswordForm() {
  const { resetPassword, isPending } = useAuthActions();
  const t = useTranslations("auth");

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{
    password?: string;
    confirm?: string;
  }>({});
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const nextErrors: typeof fieldErrors = {};
    if (!password) nextErrors.password = t("validationPasswordRequired");
    else if (!isValidPassword(password))
      nextErrors.password = t("validationPasswordMin");
    if (confirm !== password) nextErrors.confirm = t("validationConfirmMatch");
    setFieldErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;
    setSubmitError(null);
    try {
      await resetPassword(password);
    } catch (error) {
      setSubmitError(getAuthErrorMessage(error, t("unableToResetPassword")));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <div className="space-y-2">
        <Label htmlFor="reset-password-new">{t("newPasswordLabel")}</Label>
        <div className="relative">
          <Input
            id="reset-password-new"
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            disabled={isPending}
            aria-invalid={Boolean(fieldErrors.password)}
            className="pr-10"
          />
          <button
            type="button"
            onClick={() => setShowPassword((value) => !value)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
            aria-label={showPassword ? t("hidePassword") : t("showPassword")}
          >
            {showPassword ? (
              <EyeOff className="size-4" aria-hidden />
            ) : (
              <Eye className="size-4" aria-hidden />
            )}
          </button>
        </div>
        {fieldErrors.password ? (
          <p className="text-xs text-destructive">{fieldErrors.password}</p>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="reset-password-confirm">{t("confirmPasswordLabel")}</Label>
        <Input
          id="reset-password-confirm"
          type={showPassword ? "text" : "password"}
          autoComplete="new-password"
          value={confirm}
          onChange={(event) => setConfirm(event.target.value)}
          disabled={isPending}
          aria-invalid={Boolean(fieldErrors.confirm)}
        />
        {fieldErrors.confirm ? (
          <p className="text-xs text-destructive">{fieldErrors.confirm}</p>
        ) : null}
      </div>

      {submitError ? (
        <p
          role="alert"
          className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive"
        >
          {submitError}
        </p>
      ) : null}

      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? (
          <Spinner className="size-4 text-primary-foreground" />
        ) : null}
        {t("resetPasswordButton")}
      </Button>
    </form>
  );
}
