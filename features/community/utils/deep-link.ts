/**
 * Community deep-link helpers — the ONLY places the community URLs are built
 * and parsed (the counterparts to `buildAuthUrl`/`parseAuthPath`,
 * `buildArticleUrl`/`parseArticlePath`). Pure + framework-free so they are
 * directly unit-testable.
 *
 *   prayers:  /prayers, /prayers/{id}, /prayers/new, /prayers/edit/{id}
 *   notices:  /notices, /notices/{id}, /notices/new, /notices/edit/{id}
 */
import type { NoticeDeepLink, PrayerDeepLink } from "../types";

export function buildPrayerUrl(link: PrayerDeepLink): string {
  switch (link.kind) {
    case "prayers":
      return "/prayers";
    case "prayer":
      return `/prayers/${link.id}`;
    case "prayerNew":
      return "/prayers/new";
    case "prayerEdit":
      return `/prayers/edit/${link.id}`;
  }
}

export function parsePrayerPath(pathname: string): PrayerDeepLink | null {
  if (pathname === "/prayers") return { kind: "prayers" };
  if (pathname === "/prayers/new") return { kind: "prayerNew" };
  const edit = /^\/prayers\/edit\/([^/]+)$/.exec(pathname);
  if (edit) return { kind: "prayerEdit", id: edit[1] };
  const detail = /^\/prayers\/([^/]+)$/.exec(pathname);
  if (detail) return { kind: "prayer", id: detail[1] };
  return null;
}

export function buildNoticeUrl(link: NoticeDeepLink): string {
  switch (link.kind) {
    case "notices":
      return "/notices";
    case "notice":
      return `/notices/${link.id}`;
    case "noticeNew":
      return "/notices/new";
    case "noticeEdit":
      return `/notices/edit/${link.id}`;
  }
}

export function parseNoticePath(pathname: string): NoticeDeepLink | null {
  if (pathname === "/notices") return { kind: "notices" };
  if (pathname === "/notices/new") return { kind: "noticeNew" };
  const edit = /^\/notices\/edit\/([^/]+)$/.exec(pathname);
  if (edit) return { kind: "noticeEdit", id: edit[1] };
  const detail = /^\/notices\/([^/]+)$/.exec(pathname);
  if (detail) return { kind: "notice", id: detail[1] };
  return null;
}
