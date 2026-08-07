import { Suspense } from "react";
import { AuthRouteDispatcher } from "@/features/auth/components/auth-route-dispatcher";

/**
 * /auth/callback route — a thin server shell (the Supabase OAuth +
 * password-recovery redirect target). `AuthRouteDispatcher` reads the path via
 * `useAuthNavigation` (`parseAuthPath` → callback) and renders
 * `AuthCallbackPage`, which waits on the provider session and redirects to
 * `?next=`/`/profile`. `Suspense` keeps the dispatcher safe for prerendered
 * client rendering.
 */
export default function AuthCallbackRoute() {
  return (
    <Suspense fallback={null}>
      <AuthRouteDispatcher />
    </Suspense>
  );
}
