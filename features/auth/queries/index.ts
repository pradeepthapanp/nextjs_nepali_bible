/**
 * Barrel for the Authentication React Query layer.
 *
 *   query-keys.ts         authKeys — { all, profile(userId), signupStatus(email) }
 *   use-auth.ts           useAuthState / useCurrentUser / useProfile
 *   use-auth-mutations.ts useSignIn / useSignUp / useGoogleSignIn / useSignOut /
 *                         useForgotPassword / useResetPassword / useUpdatePassword /
 *                         useUpdateEmail / useUpdateProfile / useUploadAvatar /
 *                         useDeleteAccount
 */

export * from "./query-keys";
export * from "./use-auth";
export * from "./use-auth-mutations";
