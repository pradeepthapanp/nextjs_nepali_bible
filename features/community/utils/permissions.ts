/**
 * Community permission helpers — the web permission model, derived from the
 * Flutter community pages AND the user's explicit spec (see the main README).
 * REUSES the shared `canManage` role rule (`@/types/profile`); ownership is
 * derived from the provider session user id (the one auth source).
 *
 *   - Prayers: create/comment by any signed-in user; edit/delete by the OWNER
 *     or any admin/editor. (The user's explicit "Admins/Editors edit any
 *     prayer, delete any prayer" extends Flutter's admin-only rule — a
 *     documented web adaptation.)
 *   - Notices: edit/delete by the OWNER or any admin/editor; publish toggle by
 *     admin/editor (faithful to Flutter `isOwner || isAdmin`).
 *   - Prayer replies: edit/delete by the reply OWNER or an admin (faithful to
 *     Flutter `_ReplyTile` `isOwner = userId == mine || role == admin`).
 */
import { canManage, type UserRole } from "@/types/profile";
import type { Notice, Prayer, PrayerReply } from "../types";

/** True when the current user wrote the resource (by id). */
function isOwner(
  ownerId: string | undefined,
  currentUserId: string | undefined,
): boolean {
  return Boolean(currentUserId && ownerId && ownerId === currentUserId);
}

/** Edit/delete a prayer: owner or admin/editor (user's explicit spec). */
export function canManagePrayer(
  prayer: Prayer,
  currentUserId: string | undefined,
  role: UserRole | undefined,
): boolean {
  return isOwner(prayer.userId, currentUserId) || canManage(role);
}

/** Publish a prayer / toggle notice publish: admin/editor only (Flutter `isAdmin`). */
export function canModerate(role: UserRole | undefined): boolean {
  return canManage(role);
}

/** Edit/delete a notice: owner or admin/editor (faithful to Flutter). */
export function canManageNotice(
  notice: Notice,
  currentUserId: string | undefined,
  role: UserRole | undefined,
): boolean {
  return isOwner(notice.userId, currentUserId) || canManage(role);
}

/** Edit/delete a reply: reply owner or an admin (faithful to Flutter). */
export function canManageReply(
  reply: PrayerReply,
  currentUserId: string | undefined,
  role: UserRole | undefined,
): boolean {
  return isOwner(reply.userId, currentUserId) || role === "admin";
}
