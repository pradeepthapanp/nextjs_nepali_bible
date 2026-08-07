"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { LoadingState } from "@/components/ui/loading-state";
import { useProtectedRoute } from "../hooks";

export interface AuthGateProps {
  children: React.ReactNode;
}

/**
 * AuthGate — the client-side protected-route guard (the web equivalent of the
 * Flutter `AuthStatePage` in `auth_state_page.dart`: shows loading until the
 * session check completes, renders the page when signed in, else shows the
 * sign-in page). REUSES `useProtectedRoute`, which DERIVES authentication from
 * the existing `SupabaseProvider` (it does NOT create another session) and
 * redirects signed-out users to `/sign-in?next={path}` (deep-link preserved).
 *
 * The server-side guard lives in the middleware (`/profile`, `/admin`); this
 * is the in-app fallback that keeps protected surfaces honest during client
 * navigation.
 */
export function AuthGate({ children }: AuthGateProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { isReady, isAuthenticated } = useProtectedRoute();

  // Redirect signed-out users to the sign-in page once the session is known.
  useEffect(() => {
    if (!isReady) return;
    if (!isAuthenticated) {
      router.replace(`/sign-in?next=${encodeURIComponent(pathname)}`);
    }
  }, [isReady, isAuthenticated, pathname, router]);

  if (!isReady) {
    return <LoadingState label="Checking your session…" />;
  }
  if (!isAuthenticated) {
    // The redirect effect runs above; show loading so the protected surface
    // never flashes before navigation.
    return <LoadingState label="Redirecting to sign in…" />;
  }
  return <>{children}</>;
}
