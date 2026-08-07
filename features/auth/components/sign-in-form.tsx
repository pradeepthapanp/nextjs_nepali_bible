"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { useAuthActions, useAuthNavigation } from "../hooks";
import { getAuthErrorMessage, isValidEmail, isValidPassword } from "../utils";

/**
 * SignInForm — the email/password sign-in form (the web equivalent of the
 * login branch of `_SignInSignUpPageState._submit`). COMPOSES the existing
 * `useAuthActions.signIn` (which calls the `AuthService.signIn` mutation and
 * redirects to `?next=` after success) + `useAuthNavigation` (forgot/sign-up
 * links) and the faithful Flutter validators (`validation.ts`).
 *
 * No Supabase, no duplicated auth logic — the session flows through the
 * provider's `onAuthStateChange` (the one auth source).
 */
export function SignInForm() {
  const { signIn, isPending } = useAuthActions();
  const { goForgotPassword, goSignUp } = useAuthNavigation();
  const t = useTranslations("auth");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{
    email?: string;
    password?: string;
  }>({});
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const nextErrors: typeof fieldErrors = {};
    if (!isValidEmail(email)) nextErrors.email = t("validationEmailInvalid");
    if (!password) nextErrors.password = t("validationPasswordRequired");
    else if (!isValidPassword(password))
      nextErrors.password = t("validationPasswordMin");
    setFieldErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;
    setSubmitError(null);
    try {
      await signIn(email.trim(), password);
    } catch (error) {
      setSubmitError(getAuthErrorMessage(error, t("unableToSignIn")));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <div className="space-y-2">
        <Label htmlFor="sign-in-email">{t("emailLabel")}</Label>
        <Input
          id="sign-in-email"
          type="email"
          autoComplete="email"
          placeholder={t("emailPlaceholder")}
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          disabled={isPending}
          aria-invalid={Boolean(fieldErrors.email)}
        />
        {fieldErrors.email ? (
          <p className="text-xs text-destructive">{fieldErrors.email}</p>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="sign-in-password">{t("passwordLabel")}</Label>
        <div className="relative">
          <Input
            id="sign-in-password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
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

      {submitError ? (
        <p
          role="alert"
          className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive"
        >
          {submitError}
        </p>
      ) : null}

      <div className="flex justify-end">
        <Button
          type="button"
          variant="link"
          className="px-0"
          onClick={goForgotPassword}
        >
          {t("forgotPasswordLink")}
        </Button>
      </div>

      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? (
          <Spinner className="size-4 text-primary-foreground" />
        ) : null}
        {t("signInButton")}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        {t("noAccount")}{" "}
        <button
          type="button"
          className="font-semibold text-primary underline-offset-4 hover:underline"
          onClick={goSignUp}
        >
          {t("signUpHere")}
        </button>
      </p>
    </form>
  );
}
