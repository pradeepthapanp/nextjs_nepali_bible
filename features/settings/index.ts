/**
 * The Settings feature barrel.
 *
 * A web-first Settings Center: a single `/settings` catch-all route dispatched
 * by `SettingsRouteDispatcher` into nine sections, wrapped in a shared
 * `SettingsLayout` (permanent left sidebar on desktop, slide-over drawer on
 * mobile — never a bottom nav).
 *
 *   constants/      SETTINGS_SECTIONS — the single source of truth for the
 *                   sidebar, drawer and overview
 *   components/     SettingsLayout / SettingsSidebar / SettingsRouteDispatcher
 *                   + one component per section (Profile, Account,
 *                   Appearance, Reading, Audio, Notifications, About,
 *                   Privacy, Licenses)
 *
 * Every section REUSES existing infrastructure: auth + `ProfileService` +
 * `UploadService` (Profile/Account), `next-themes` (Appearance), the
 * per-feature reader-settings stores (Reading), and the shared Audio Platform
 * (+ the new shared `audio.settings` store for playback defaults) (Audio).
 */

export * from "./constants";
export * from "./components";
