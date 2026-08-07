import { Suspense } from "react";
import { AuthRouteDispatcher } from "@/features/auth/components/auth-route-dispatcher";

/**
 * /sign-up route — a thin server shell. `AuthRouteDispatcher` reads the path
 * via `useAuthNavigation` (`parseAuthPath`) and renders the matching auth
 * page. `Suspense` keeps the dispatcher safe for prerendered client rendering.
 */
export default function SignUpRoute() {
  return (
    <Suspense fallback={null}>
      <AuthRouteDispatcher />
    </Suspense>
  );
}
