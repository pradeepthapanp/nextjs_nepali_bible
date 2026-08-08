import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthRouteDispatcher } from "@/features/auth/components/auth-route-dispatcher";
import { seo } from "@/lib/seo";

export const metadata: Metadata = seo({
  title: "Sign In",
  path: "/sign-in",
  noindex: true,
});

/**
 * /sign-in route — a thin server shell. `AuthRouteDispatcher` reads the path
 * via `useAuthNavigation` (`parseAuthPath`) and renders the matching auth
 * page. `Suspense` keeps the dispatcher safe for prerendered client rendering
 * (mirrors the Maps/Articles/Music route shells).
 */
export default function SignInRoute() {
  return (
    <Suspense fallback={null}>
      <AuthRouteDispatcher />
    </Suspense>
  );
}
