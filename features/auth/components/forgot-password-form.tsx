"use client";

import { useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { useAuthActions, useAuthNavigation } from "../hooks";
import { getAuthErrorMessage, isValidEmail } from "../utils";

/**
 * ForgotPasswordForm — the "send a password reset link" form (WEB-FIRST: the
 * Flutter `sendPasswordResetEmail` is commented out). COMPOSES the existing
 * `useAuthActions.forgotPassword` mutation (`AuthService.resetPasswordForEmail`)
 * + the `useAuthNavigation` sign-in link. Shows a success state after the
 * reset email is sent. No Supabase, no duplicated auth logic.
 */
export function ForgotPasswordForm() {
  const { forgotPassword, isPending } = useAuthActions();
  const { goSignIn } = useAuthNavigation();
  const t = useTranslations("auth");

  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!isValidEmail(email)) {
      setEmailError(t("validationEmailInvalid"));
      return;
    }
    setEmailError(null);
    setSubmitError(null);
    try {
      await forgotPassword(email.trim());
      setSent(true);
    } catch (error) {
      setSubmitError(getAuthErrorMessage(error, t("unableToSendResetLink")));
    }
  };

  if (sent) {
    return (
      <div className="space-y-4 text-center">
        <CheckCircle2 className="mx-auto size-10 text-primary" aria-hidden />
        <h3 className="text-base font-semibold">{t("resetLinkSent")}</h3>
        <p className="text-sm text-muted-foreground">
          {t("resetLinkSentDesc", { email: email.trim() })}
        </p>
        <Button variant="outline" className="w-full" onClick={goSignIn}>
          {t("backToSignIn")}
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <div className="space-y-2">
        <Label htmlFor="forgot-password-email">{t("emailLabel")}</Label>
        <Input
          id="forgot-password-email"
          type="email"
          autoComplete="email"
          placeholder={t("emailPlaceholder")}
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          disabled={isPending}
          aria-invalid={Boolean(emailError)}
        />
        {emailError ? (
          <p className="text-xs text-destructive">{emailError}</p>
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
        {t("sendResetLink")}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        {t("rememberedIt")}{" "}
        <button
          type="button"
          className="font-semibold text-primary underline-offset-4 hover:underline"
          onClick={goSignIn}
        >
          {t("signInHere")}
        </button>
      </p>
    </form>
  );
}
