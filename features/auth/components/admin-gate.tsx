"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { ShieldAlert } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { LoadingState } from "@/components/ui/loading-state";
import { useAdminRoute } from "../hooks";

export interface AdminGateProps {
  children: React.ReactNode;
}

/**
 * AdminGate — the client-side admin/editor route guard. REUSES `useAdminRoute`
 * (which composes `useProtectedRoute` for the provider auth + `useProfile` for
 * the shared `canManage` role rule). Redirects signed-out users to
 * `/sign-in?next={path}` and shows an access-restricted state for signed-in
 * non-admin/editor users.
 *
 * The server-side `/admin` guard (role check) lives in the middleware; this is
 * the in-app fallback for client navigation.
 */
export function AdminGate({ children }: AdminGateProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { isReady, isAuthenticated, isAdmin } = useAdminRoute();

  // Redirect signed-out users to the sign-in page once the session is known.
  useEffect(() => {
    if (!isReady) return;
    if (!isAuthenticated) {
      router.replace(`/sign-in?next=${encodeURIComponent(pathname)}`);
    }
  }, [isReady, isAuthenticated, pathname, router]);

  if (!isReady) {
    return <LoadingState label="Checking access…" />;
  }
  if (!isAuthenticated) {
    // The redirect effect runs above; show loading so the surface never
    // flashes before navigation.
    return <LoadingState label="Redirecting to sign in…" />;
  }
  if (!isAdmin) {
    return (
      <EmptyState
        icon={ShieldAlert}
        title="Admin access required"
        description="You need an admin or editor account to view this page."
      />
    );
  }
  return <>{children}</>;
}
