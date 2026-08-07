import type { SupabaseClient } from "@supabase/supabase-js";
import { unwrap } from "@/services/helpers";

/**
 * Prayer-prays service — the "has prayed" join table (`prayer_prays`) + the
 * `prayers.prayer_count` read. A direct port of the SupabaseRepository
 * `hasPrayed` / `pray` / `unPray` methods, plus two WEB-FIRST helpers:
 * `togglePrayer` (the data-layer equivalent of the Flutter
 * `PrayersNotifier.togglePrayer` decision — reads the current membership then
 * calls `pray`/`unPray`, moved into the service so the query layer stays
 * thin) and `getPrayerCount` (reads the existing `prayer_count` column).
 *
 * Table verified: `prayer_prays (prayer_id, user_id)` exists; anon inserts are
 * rejected by RLS (probed) → `pray`/`unPray`/`togglePrayer` require a session.
 */

export interface PrayerPraysService {
  /** Whether the signed-in user has prayed for the prayer (replaces `hasPrayed`; false signed-out). */
  hasPrayed(prayerId: string): Promise<boolean>;
  /** Insert a `prayer_prays` row (replaces `pray`; requires a session). */
  pray(prayerId: string): Promise<void>;
  /** Delete the `prayer_prays` row (replaces `unPray`; requires a session). */
  unPray(prayerId: string): Promise<void>;
  /**
   * Flip the "has prayed" state (WEB-FIRST): reads `hasPrayed` then calls
   * `pray`/`unPray`. Resolves with the NEW state (true = now prayed) so the
   * query layer can adjust the optimistic `prayerCount` in the same direction.
   */
  togglePrayer(prayerId: string): Promise<boolean>;
  /** The current `prayers.prayer_count` (WEB-FIRST column read). */
  getPrayerCount(prayerId: string): Promise<number>;
}

export class SupabasePrayerPraysService implements PrayerPraysService {
  constructor(private readonly client: SupabaseClient) {}

  private async currentUserId(): Promise<string | null> {
    return (
      (await this.client.auth.getSession()).data.session?.user?.id ?? null
    );
  }

  async hasPrayed(prayerId: string): Promise<boolean> {
    const userId = await this.currentUserId();
    if (!userId) return false;
    const response = await this.client
      .from("prayer_prays")
      .select("prayer_id")
      .eq("prayer_id", prayerId)
      .eq("user_id", userId)
      .maybeSingle();
    const row = unwrap(response) as { prayer_id: string } | null;
    return row != null;
  }

  async pray(prayerId: string): Promise<void> {
    const userId = await this.currentUserId();
    if (!userId) throw new Error("User not signed in");
    const response = await this.client
      .from("prayer_prays")
      .insert({ prayer_id: prayerId, user_id: userId });
    unwrap(response);
  }

  async unPray(prayerId: string): Promise<void> {
    const userId = await this.currentUserId();
    if (!userId) throw new Error("User not signed in");
    const response = await this.client
      .from("prayer_prays")
      .delete()
      .eq("prayer_id", prayerId)
      .eq("user_id", userId);
    unwrap(response);
  }

  async togglePrayer(prayerId: string): Promise<boolean> {
    const currently = await this.hasPrayed(prayerId);
    if (currently) {
      await this.unPray(prayerId);
    } else {
      await this.pray(prayerId);
    }
    return !currently;
  }

  async getPrayerCount(prayerId: string): Promise<number> {
    const response = await this.client
      .from("prayers")
      .select("prayer_count")
      .eq("id", prayerId)
      .single();
    const row = unwrap(response) as { prayer_count: number | null };
    return row.prayer_count ?? 0;
  }
}
