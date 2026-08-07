# Nepali Bible Web

The web (Next.js) migration of the Nepali Bible Flutter app — read, listen and
study the Bible in Nepali.

## Status

The migration is complete: **Bible, Music, Online Songs (with the shared Audio
Platform), Articles (with Quill editor), Maps, Auth, Community (Prayers +
Notices), Devotions, Quiz** and the final **public home page + global top
navigation** plus a web-first **Settings Center**. The home page
(`app/page.tsx` → `app/_components/home/`) is a real landing page (hero,
quick-access cards, today's devotion, recent articles, featured music,
community + footer), and `SiteNav` (`components/navigation/site-nav.tsx`) is
mounted globally in `app/layout.tsx` (sticky top bar, desktop horizontal nav,
mobile slide-over drawer, auth-aware actions). `lib/navigation.ts` is the
single source of truth for nav routes.

The **Settings Center** (`app/settings/[[...segments]]` → `features/settings/`)
replaces the old Flutter-style Settings page: a single `SettingsRouteDispatcher`
serves `/settings` (overview) and nine sections (`/settings/profile`,
`/settings/account`, `/settings/appearance`, `/settings/reading`,
`/settings/audio`, `/settings/notifications`, `/settings/about`,
`/settings/privacy`, `/settings/licenses`) inside a shared `SettingsLayout`
(permanent left sidebar on desktop, slide-over drawer on mobile — no bottom
nav). Every section reuses existing infrastructure: auth +
`ProfileService`/`UploadService` (Profile, Account), `next-themes` (Appearance),
the per-feature reader-settings stores (Reading), and the shared Audio Platform
plus the new shared `audio.settings` store for playback defaults (Audio). A
Settings gear button sits in the global nav beside Profile (and inside the
mobile drawer).

The app uses the **real Flutter branding**: the brand assets were copied from
the Flutter project into `public/images/`, `public/icons/` and `public/logo/`
(the `app-icon` logo appears in the top nav, footer, home hero and browser
favicon, rendered with `next/image`). Feature icons come from a **shared Font
Awesome registry** (`components/icons/feature-icons.tsx` — `FeatureIcon` /
`featureIcons`), used by the nav (mobile drawer), home quick-access cards and
section headings, and the Settings navigation. Lucide is kept for generic UI
controls (arrows, chevrons, spinners, close, favorite, etc.) — it is not
replaced globally.

The app supports **application localization** (English + Nepali) via
**next-intl**. UI strings live in typed catalogs (`messages/en.json` +
`messages/ne.json`) wired through `i18n/routing.ts`, `i18n/request.ts`, the
`createNextIntlPlugin` config and a locale-aware `app/layout.tsx`. Locale is
resolved from the `NEXT_LOCALE` cookie (URLs stay locale-free,
`localePrefix: "never"`) and forwarded to server components by `middleware.ts`
via the `X-NEXT-INTL-LOCALE` request header. The existing **language toggle**
(`components/navigation/language-switcher.tsx`) writes the cookie +
`router.refresh()`, and the selection persists across refreshes (SSR). Nav
(desktop/mobile/footer), the home page, common states, all auth forms, the
Settings Center, the audio player labels and the reader toolbars are
localized. Database content (Bible text, articles, songs, lyrics, devotions,
prayer/notice content, quiz questions, commentary, dictionary, maps, audio
titles) is **never** translated — those remain in their stored language. To
add a string: add the key to both catalogs and call `useTranslations`.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the
result.

The app uses `next/font` to optimize and load Noto Sans Devanagari (and Geist
Mono) for the Nepali UI.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
