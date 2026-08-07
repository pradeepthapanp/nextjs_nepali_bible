/**
 * Profile + roles — shared across every feature that needs the current user's
 * profile for gating. A direct port of the Flutter `Profile` model
 * (`lib/models/profile.dart`, Supabase `profiles` table).
 *
 * Flutter's `UserRole` enum values: `admin`, `editor`, `user`.
 */
export type UserRole = "admin" | "editor" | "user";

export interface Profile {
  id: string;
  fullName?: string;
  email?: string;
  avatarUrl?: string;
  phone?: string;
  role: UserRole;
  emailVerified?: boolean;
  createdAt?: string;
}

/**
 * True when the role may manage content (admin or editor — the web equivalent
 * of Flutter's `_canManage` used by the audio list and the article editor).
 * Generic: consumers name the capability they gate (e.g. `canManage` audios,
 * articles, notices) but the role rule is the same everywhere.
 */
export function canManage(role: UserRole | undefined): boolean {
  return role === "admin" || role === "editor";
}

/** Maps a `profiles` row's role string to a `UserRole` (defaults to "user"). */
export function toUserRole(role: string | null | undefined): UserRole {
  switch ((role ?? "user").toLowerCase()) {
    case "admin":
      return "admin";
    case "editor":
      return "editor";
    default:
      return "user";
  }
}
