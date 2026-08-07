# Settings Center (web-first)

Replaces the old Flutter-style Settings page with a web-first Settings Center.

## Routes

All served by a single catch-all route + dispatcher:

```
/settings                      → overview (section cards)
/settings/profile              → Profile   (protected)
/settings/account              → Account   (protected)
/settings/appearance           → Appearance
/settings/reading              → Reading
/settings/audio                → Audio
/settings/notifications        → Notifications
/settings/about                → About
/settings/privacy              → Privacy
/settings/licenses             → Open Source Licenses
```

`app/settings/[[...segments]]/page.tsx` → `SettingsRouteDispatcher`
(`components/settings-route-dispatcher.tsx`) reads the pathname and renders the
matching section inside the shared `SettingsLayout`.

## Layout

- **Desktop (≥lg):** permanent left sidebar (`SettingsSidebar`, sticky) + content
  on the right; the sidebar stays visible while switching sections.
- **Mobile (<lg):** hamburger button opens a `ResponsiveDrawer` slide-over with
  the same section list. Content fills the screen.
- **No bottom navigation.**
- Real routes → browser back/forward work; the active section is highlighted via
  `aria-current` on the sidebar.

`constants.ts` (`SETTINGS_SECTIONS`) is the single source of truth for the
sidebar, the mobile drawer and the `/settings` overview.

## Reuse (no duplication)

| Section        | Reuses                                                        |
| -------------- | ------------------------------------------------------------- |
| Profile        | `AuthGate`, `useProfileEditor`, `ProfileAvatar`, `ProfileForm`, `DeleteAccountDialog`, `changePassword` |
| Account        | `useAuth`, `useProfileEditor` (sign out / delete account)     |
| Appearance     | `next-themes` (`useTheme`) + `APP_FONT_FAMILIES`              |
| Reading        | Shared `ReaderSettingsProvider`/`ReaderSettingsPanel` over the EXISTING per-feature reader stores (Bible / Articles / Devotions) |
| Audio          | Shared Audio Platform + the new `useAudioSettingsStore` (`audio.settings`) for playback defaults |
| Notifications  | UI only (no backend push infra yet) — persisted to `notifications.prefs` |
| About / Privacy / Licenses | `siteConfig`, `APP_VERSION`, static content        |

Shared controls live in `components/settings-controls.tsx`
(`SettingRow`, `ToggleSwitch`, `SegmentedControl`, `SettingsSelect`).
