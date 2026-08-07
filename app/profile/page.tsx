import { Suspense } from "react";
import { AuthRouteDispatcher } from "@/features/auth/components/auth-route-dispatcher";

/**
 * /profile route — a thin server shell (PROTECTED: the middleware redirects
 * signed-out users to `/sign-in?next=/profile`; `ProfilePage` is additionally
 * wrapped in `AuthGate` for client navigation). `AuthRouteDispatcher` reads
 * the path via `useAuthNavigation` (`parseAuthPath`) and renders the matching
 * auth page. `Suspense` keeps the dispatcher safe for prerendered client
 * rendering.
 */
export default function ProfileRoute() {
  return (
    <Suspense fallback={null}>
      <AuthRouteDispatcher />
    </Suspense>
  );
}
