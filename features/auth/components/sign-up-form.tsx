"use client";

import { useState } from "react";
import { CheckCircle2, Eye, EyeOff } from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import {
  AUTH_PHONE_COUNTRY_CODE,
  AUTH_PHONE_DIGIT_LENGTH,
} from "../constants";
import { useAuthActions, useAuthNavigation } from "../hooks";
import { getAuthErrorMessage, isValidEmail, isValidPassword } from "../utils";

/**
 * SignUpForm — the full-name/phone/email/password sign-up form (the web
 * equivalent of the sign-up branch of `_SignInSignUpPageState._submit`).
 * COMPOSES the existing `useAuthActions.signUp` mutation + `useAuthNavigation`
 * (sign-in link) and the faithful Flutter validators (`validation.ts`).
 *
 * The OTP verification step (Flutter `_showOtpField`) is intentionally NOT
 * part of this phase's UI (no OTP mutations were requested in the query
 * layer) — after a successful sign-up we show a "check your email" success
 * state and link back to sign in. No Supabase, no duplicated auth logic.
 */
export function SignUpForm() {
  const { signUp, isPending } = useAuthActions();
  const { goSignIn } = useAuthNavigation();
  const t = useTranslations("auth");

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{
    fullName?: string;
    phone?: string;
    email?: string;
    password?: string;
  }>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [signedUp, setSignedUp] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const nextErrors: typeof fieldErrors = {};
    if (!fullName.trim()) nextErrors.fullName = t("validationNameRequired");
    if (!phone.trim()) nextErrors.phone = t("validationPhoneRequired");
    else if (phone.trim().length !== AUTH_PHONE_DIGIT_LENGTH)
      nextErrors.phone = t("validationPhoneLength");
    else if (!phone.trim().startsWith("9"))
      nextErrors.phone = t("validationPhoneNepal");
    if (!isValidEmail(email)) nextErrors.email = t("validationEmailInvalid");
    if (!password) nextErrors.password = t("validationPasswordRequired");
    else if (!isValidPassword(password))
      nextErrors.password = t("validationPasswordMin");
    setFieldErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;
    setSubmitError(null);
    try {
      await signUp({
        email: email.trim(),
        password,
        fullName: fullName.trim(),
        phoneNumber: phone.trim(),
      });
      setSignedUp(true);
      toast.success(t("verificationCodeSent"));
    } catch (error) {
      setSubmitError(getAuthErrorMessage(error, t("unableToCreateAccount")));
    }
  };

  if (signedUp) {
    return (
      <div className="space-y-4 text-center">
        <CheckCircle2 className="mx-auto size-10 text-primary" aria-hidden />
        <h3 className="text-base font-semibold">{t("checkYourEmail")}</h3>
        <p className="text-sm text-muted-foreground">
          {t("verificationSentDesc", { email: email.trim() })}
        </p>
        <Button
          variant="outline"
          className="w-full"
          onClick={() => {
            toast.info(t("toastVerifyEmail"));
            goSignIn();
          }}
        >
          {t("goToSignIn")}
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <div className="space-y-2">
        <Label htmlFor="sign-up-name">{t("fullNameLabel")}</Label>
        <Input
          id="sign-up-name"
          autoComplete="name"
          placeholder={t("fullNamePlaceholder")}
          value={fullName}
          onChange={(event) => setFullName(event.target.value)}
          disabled={isPending}
          aria-invalid={Boolean(fieldErrors.fullName)}
        />
        {fieldErrors.fullName ? (
          <p className="text-xs text-destructive">{fieldErrors.fullName}</p>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="sign-up-phone">{t("phoneLabel")}</Label>
        <div className="flex items-stretch">
          <span className="inline-flex items-center rounded-l-lg border border-r-0 border-input bg-muted px-3 text-sm text-muted-foreground">
            {AUTH_PHONE_COUNTRY_CODE}
          </span>
          <Input
            id="sign-up-phone"
            type="tel"
            inputMode="numeric"
            autoComplete="tel-national"
            placeholder="98XXXXXXXX"
            maxLength={AUTH_PHONE_DIGIT_LENGTH}
            value={phone}
            onChange={(event) =>
              setPhone(event.target.value.replace(/\D/g, ""))
            }
            disabled={isPending}
            aria-invalid={Boolean(fieldErrors.phone)}
            className="rounded-l-none"
          />
        </div>
        {fieldErrors.phone ? (
          <p className="text-xs text-destructive">{fieldErrors.phone}</p>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="sign-up-email">{t("emailLabel")}</Label>
        <Input
          id="sign-up-email"
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
        <Label htmlFor="sign-up-password">{t("passwordLabel")}</Label>
        <div className="relative">
          <Input
            id="sign-up-password"
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
        {t("createAccount")}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        {t("haveAccount")}{" "}
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
