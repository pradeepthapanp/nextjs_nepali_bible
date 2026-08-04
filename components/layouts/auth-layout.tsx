import { AppContainer } from "@/components/ui/app-container";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Logo } from "@/components/ui/logo";
import { ThemeToggle } from "@/components/navigation/theme-toggle";

export interface AuthLayoutProps {
  title?: React.ReactNode;
  description?: React.ReactNode;
  children: React.ReactNode;
  /** Optional hint below the card (e.g. terms/privacy links). */
  footer?: React.ReactNode;
  className?: string;
}

/**
 * AuthLayout — the centered card scaffold for sign-in / sign-up pages.
 * Keeps auth flows visually consistent (logo, one card, theme toggle) and
 * fully responsive. Used by the auth feature once it is migrated.
 */
export function AuthLayout({
  title,
  description,
  children,
  footer,
  className,
}: AuthLayoutProps) {
  return (
    <div
      className={
        "relative flex min-h-dvh flex-col items-center justify-center px-4 py-12 " +
        (className ?? "")
      }
    >
      <div className="absolute right-4 top-4">
        <ThemeToggle />
      </div>

      <AppContainer maxWidth="md" className="w-full">
        <div className="flex flex-col items-center gap-6">
          <Logo size="lg" />

          <Card className="w-full">
            <CardHeader className="text-center">
              {title ? (
                <CardTitle className="text-xl">{title}</CardTitle>
              ) : null}
              {description ? (
                <CardDescription>{description}</CardDescription>
              ) : null}
            </CardHeader>
            <CardContent>{children}</CardContent>
          </Card>

          {footer ? (
            <p className="text-center text-sm text-muted-foreground">
              {footer}
            </p>
          ) : null}
        </div>
      </AppContainer>
    </div>
  );
}
