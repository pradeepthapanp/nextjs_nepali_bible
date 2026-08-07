/**
 * Prayer domain types — a direct port of the Flutter `Prayer` model
 * (`lib/models/prayer.dart`, Supabase `prayers` table) and the `PrayerReply`
 * model (`lib/models/prayer_reply.dart`, `prayer_replies` table), following the
 * web convention (snake_case rows → camelCase domain, ISO string dates).
 *
 * Table columns verified against the live backend (`prayers`, `prayer_replies`
 * exist with exactly these columns — see `services/README.md`).
 */

/** A prayer request (the `prayers` table row). */
export interface Prayer {
  id: string;
  title: string;
  details: string;
  userId?: string;
  authorName?: string;
  isAnonymous: boolean;
  prayerCount: number;
  replyCount: number;
  published: boolean;
  /** The moderation status string (Flutter default `'active'`). */
  status: string;
  createdAt: string;
  updatedAt: string;
}

/** The create/edit fields of a prayer (Flutter `AddEditPrayerSheet._save`). */
export interface PrayerInput {
  title: string;
  details: string;
  isAnonymous: boolean;
}

/** A prayer reply / comment (the `prayer_replies` table row). */
export interface PrayerReply {
  id: string;
  prayerId: string;
  userId?: string;
  authorName?: string;
  reply: string;
  createdAt: string;
  updatedAt: string;
}

/** The create fields of a reply (Flutter `PrayerDetailsSheet._sendReply`). */
export interface PrayerReplyInput {
  prayerId: string;
  reply: string;
}

/** The update fields of a reply (Flutter `_EditReplyDialog.onSave`). */
export interface PrayerReplyUpdate {
  replyId: string;
  reply: string;
}
