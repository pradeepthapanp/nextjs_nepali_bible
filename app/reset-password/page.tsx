import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthRouteDispatcher } from "@/features/auth/components/auth-route-dispatcher";
import { seo } from "@/lib/seo";

export const metadata: Metadata = seo({
  title: "Reset Password",
  path: "/reset-password",
  noindex: true,
});

/**
 * /reset-password route — a thin server shell. `AuthRouteDispatcher` reads
 * the path via `useAuthNavigation` (`parseAuthPath`) and renders the matching
 * auth page. `Suspense` keeps the dispatcher safe for prerendered client
 * rendering.
 */
export default function ResetPasswordRoute() {
  return (
    <Suspense fallback={null}>
      <AuthRouteDispatcher />
    </Suspense>
  );
}
