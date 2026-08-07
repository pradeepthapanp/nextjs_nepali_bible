import type { SupabaseClient } from "@supabase/supabase-js";
import { unwrap } from "@/services/helpers";
import { toUserRole, type Profile } from "@/types/profile";

/**
 * Profile service — shared. A direct port of the Flutter repository's profile
 * methods (`fetchProfileById`, `updateProfile` — see
 * `lib/providers/supabase/supabase_repository_provider.dart`, `profiles`
 * table). Every feature that reads/gates on the current user's role
 * (admin/editor) or edits the profile (the auth feature) uses this ONE
 * profiles-table gateway — no feature re-implements it.
 */

/** The editable profile fields (a faithful port of Flutter's `updateProfile`). */
export interface ProfileUpdate {
  fullName?: string;
  avatarUrl?: string;
  phone?: string;
}

export interface ProfileService {
  /** The profile for a user id, or null (replaces `fetchProfileById`). */
  getProfileById(userId: string): Promise<Profile | null>;
  /**
   * Update the editable profile fields (replaces `updateProfile`): writes only
   * the provided fields to the `profiles` table for the user.
   */
  updateProfile(userId: string, patch: ProfileUpdate): Promise<void>;
}

interface ProfileRow {
  id: string;
  full_name?: string | null;
  email?: string | null;
  avatar_url?: string | null;
  phone?: string | null;
  role?: string | null;
  email_verified?: boolean | null;
  created_at?: string | null;
}

/** Maps a `profiles` row to the domain `Profile` (reuses the shared `toUserRole`). */
function mapProfile(row: ProfileRow): Profile {
  return {
    id: row.id,
    fullName: row.full_name ?? undefined,
    email: row.email ?? undefined,
    avatarUrl: row.avatar_url ?? undefined,
    phone: row.phone ?? undefined,
    role: toUserRole(row.role),
    emailVerified: row.email_verified ?? undefined,
    createdAt: row.created_at ?? undefined,
  };
}

export class SupabaseProfileService implements ProfileService {
  constructor(private readonly client: SupabaseClient) {}

  async getProfileById(userId: string): Promise<Profile | null> {
    if (!userId) return null;
    const response = await this.client
      .from("profiles")
      .select()
      .eq("id", userId)
      .maybeSingle();
    const row = unwrap(response) as ProfileRow | null;
    return row ? mapProfile(row) : null;
  }

  async updateProfile(userId: string, patch: ProfileUpdate): Promise<void> {
    // Write only the provided fields (Flutter used null-aware spread).
    const updates: Record<string, unknown> = {};
    if (patch.fullName !== undefined) updates.full_name = patch.fullName;
    if (patch.avatarUrl !== undefined) updates.avatar_url = patch.avatarUrl;
    if (patch.phone !== undefined) updates.phone = patch.phone;
    if (Object.keys(updates).length === 0) return;
    const response = await this.client
      .from("profiles")
      .update(updates)
      .eq("id", userId);
    unwrap(response);
  }
}
