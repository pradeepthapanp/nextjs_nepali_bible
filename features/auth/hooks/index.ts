/**
 * Barrel for the Authentication behavior hooks.
 *
 *   use-auth.ts             useAuth — consolidated auth surface (state + profile)
 *   use-auth-actions.ts     useAuthActions — imperative auth actions + redirect
 *   use-auth-navigation.ts  useAuthNavigation — deep links + router
 *   use-profile-editor.ts   useProfileEditor — profile editing (shared services)
 *   use-protected-route.ts  useProtectedRoute — signed-in guard state
 *   use-admin-route.ts      useAdminRoute — admin/editor guard state
 */

export * from "./use-auth";
export * from "./use-auth-actions";
export * from "./use-auth-navigation";
export * from "./use-profile-editor";
export * from "./use-protected-route";
export * from "./use-admin-route";
