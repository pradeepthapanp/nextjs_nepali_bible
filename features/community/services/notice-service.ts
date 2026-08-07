import type { SupabaseClient } from "@supabase/supabase-js";
import { unwrap } from "@/services/helpers";
import type { UploadService } from "@/services/upload-service";
import { fileExtension } from "@/utils/content-type";
import { mediaPathFromUrl } from "@/utils/media";
import { NOTICE_IMAGE_UPLOAD_FOLDER } from "../constants";
import type { Notice, NoticeInput, NoticeUpdate } from "../types";

/**
 * Notice service — a direct port of the SupabaseRepository notice methods
 * (`fetchNotices`, `getNotice`, `createNotice`, `updateNotice`, `deleteNotice`,
 * `setNoticePublished`) from
 * `lib/providers/supabase/supabase_repository_provider.dart`, plus the notice
 * IMAGE upload/delete, which REUSE the SHARED `UploadService` (no duplicated
 * upload logic — the `get-upload-url`/PUT/`delete-file` edge-function flow
 * lives only in the shared service). Uses the existing `notices` table with no
 * schema changes (verified: the table + every column exist in the live
 * backend).
 *
 * NOT ported (dead Flutter code — see the arch README): `fetchPublishedNotices`
 * and `fetchActiveNotices` are defined in the repository but never called by
 * any UI. No `NoticeComment` — notices have no comments (no table exists).
 *
 * WEB ADAPTATION: Flutter's `fetchNotices` returns `[]` when signed out; the
 * web does NOT special-case signed-out here (the `/notices` routes are
 * `AuthGate`-protected so the session is present; RLS enforces row visibility).
 */

export interface NoticeService {
  /** Paginated notices, newest first (replaces `fetchNotices`). */
  getNotices(options?: { limit?: number; offset?: number }): Promise<Notice[]>;
  /** A single notice by id (replaces `getNotice`; `.maybeSingle()`). */
  getNotice(id: string): Promise<Notice | null>;
  /** Insert a notice row (replaces `createNotice`; requires a session). */
  createNotice(input: NoticeInput): Promise<Notice>;
  /** Update all editable fields + stamp `updated_at` (replaces `updateNotice`). */
  updateNotice(input: NoticeUpdate): Promise<Notice>;
  /**
   * Delete a notice row (replaces `deleteNotice`), then best-effort deletes
   * the notice image file via the SHARED `UploadService` (Flutter's
   * `NoticesNotifier.deleteImageFile`).
   */
  deleteNotice(notice: Notice): Promise<void>;
  /** Set the publish state (replaces `setNoticePublished`). */
  setNoticePublished(id: string, isPublished: boolean): Promise<void>;
  /**
   * Upload the notice image via the SHARED `UploadService`. The storage path
   * is `images/notices/{timestamp}.{ext}` (Flutter builds `notices/{ts}.{ext}`
   * + `UploadNotifier.uploadImage` prepends `images/`).
   */
  uploadNoticeImage(
    blob: Blob,
    fileName: string,
    onProgress?: (progress: number) => void,
  ): Promise<string>;
  /** Best-effort delete of a notice image file (SHARED `UploadService` + `mediaPathFromUrl`). */
  deleteNoticeImage(imageUrl: string | undefined): Promise<void>;
}

/** A `notices` row as returned by Supabase (snake_case columns). */
export interface NoticeRow {
  id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  user_id: string | null;
  is_published: boolean | null;
  published_at: string | null;
  expires_at: string | null;
  created_at: string;
  updated_at: string;
}

/** Maps a `notices` row to the domain `Notice` (mirrors `Notice.fromJson`). */
export function mapNotice(row: NoticeRow): Notice {
  return {
    id: row.id,
    title: row.title,
    description: row.description ?? undefined,
    imageUrl: row.image_url ?? undefined,
    userId: row.user_id ?? undefined,
    isPublished: row.is_published ?? true,
    publishedAt: row.published_at ?? undefined,
    expiresAt: row.expires_at ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/** The editable notice fields in the snake_case update payload. */
function toNoticeUpdateRow(input: NoticeUpdate): Record<string, unknown> {
  return {
    title: input.title,
    description: input.description ?? null,
    image_url: input.imageUrl ?? null,
    is_published: input.isPublished,
    published_at: input.publishedAt ?? null,
    expires_at: input.expiresAt ?? null,
  };
}

export class SupabaseNoticeService implements NoticeService {
  /**
   * @param client The shared Supabase client.
   * @param upload The SHARED `UploadService` (same client) — used ONLY for the
   * notice image upload/delete (no duplicated upload logic).
   */
  constructor(
    private readonly client: SupabaseClient,
    private readonly upload: UploadService,
  ) {}

  async getNotices(options?: {
    limit?: number;
    offset?: number;
  }): Promise<Notice[]> {
    const limit = options?.limit ?? 50;
    const offset = options?.offset ?? 0;
    const response = await this.client
      .from("notices")
      .select()
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);
    const rows = unwrap(response) as NoticeRow[] | null;
    return (rows ?? []).map(mapNotice);
  }

  async getNotice(id: string): Promise<Notice | null> {
    const response = await this.client
      .from("notices")
      .select()
      .eq("id", id)
      .maybeSingle();
    const row = unwrap(response) as NoticeRow | null;
    return row ? mapNotice(row) : null;
  }

  async createNotice(input: NoticeInput): Promise<Notice> {
    // Flutter throws exactly this when signed out.
    const user = (await this.client.auth.getSession()).data.session?.user ?? null;
    if (!user) throw new Error("User not authenticated");
    const response = await this.client
      .from("notices")
      .insert({
        title: input.title,
        description: input.description ?? null,
        image_url: input.imageUrl ?? null,
        user_id: user.id,
        is_published: input.isPublished,
        published_at: input.publishedAt ?? null,
        expires_at: input.expiresAt ?? null,
      })
      .select()
      .single();
    const row = unwrap(response) as NoticeRow;
    return mapNotice(row);
  }

  async updateNotice(input: NoticeUpdate): Promise<Notice> {
    const response = await this.client
      .from("notices")
      .update({ ...toNoticeUpdateRow(input), updated_at: new Date().toISOString() })
      .eq("id", input.id)
      .select()
      .single();
    const row = unwrap(response) as NoticeRow;
    return mapNotice(row);
  }

  async deleteNotice(notice: Notice): Promise<void> {
    const response = await this.client
      .from("notices")
      .delete()
      .eq("id", notice.id);
    unwrap(response);
    // Best-effort image file delete (Flutter `deleteImageFile`): the SHARED
    // `mediaPathFromUrl` extracts the storage path, then the SHARED
    // `UploadService.deleteFile` removes the object.
    await this.deleteNoticeImage(notice.imageUrl);
  }

  async setNoticePublished(id: string, isPublished: boolean): Promise<void> {
    const response = await this.client
      .from("notices")
      .update({ is_published: isPublished })
      .eq("id", id);
    unwrap(response);
  }

  async uploadNoticeImage(
    blob: Blob,
    fileName: string,
    onProgress?: (progress: number) => void,
  ): Promise<string> {
    const ext = fileExtension(fileName);
    const path = `images/${NOTICE_IMAGE_UPLOAD_FOLDER}/${Date.now()}.${ext}`;
    return this.upload.uploadFile(blob, path, onProgress);
  }

  async deleteNoticeImage(imageUrl: string | undefined): Promise<void> {
    const path = mediaPathFromUrl(imageUrl);
    if (!path) return;
    try {
      await this.upload.deleteFile(path);
    } catch (error) {
      console.warn("Failed to delete notice image", error);
    }
  }
}
