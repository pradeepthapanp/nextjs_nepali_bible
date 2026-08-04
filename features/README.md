# Features

This directory holds **feature modules**. Each feature is self-contained and owns
its UI, types, hooks and data-fetching logic, so teams can add/remove features
without touching unrelated code.

## Convention

One folder per feature, named after the domain, e.g.:

```
features/
  bible/
    components/      # feature-scoped UI
    hooks/           # feature-scoped hooks
    services/        # data access for this feature
    types.ts         # domain models
    page.tsx         # feature route(s) — mounted under app/ routes
  music/
  ...
```

Route wiring lives in `app/` (App Router); a feature exposes its pages from its
own folder and they are mounted into `app/<feature>/` route segments during
migration.

## Planned features (from the Flutter app)

These will be migrated one at a time **after** the project foundation is
complete. No pages are created yet:

- `bible/` — Bible reading, search, chapter/verse display, audio Bible
- `music/` — songs, chords, playlists, audio playback
- `articles/` — articles and article categories
- `community/` — notices, discussions, prayers
- `quiz/` — quizzes
- `settings/` — app settings and preferences

## Rules

- Keep feature code inside `features/<feature>/` — never scatter it into the
  top-level `components/`, `hooks/`, etc.
- The top-level `components/`, `hooks/`, `services/`, `store/` folders are for
  **shared, cross-feature** code only.
- A feature may import from `@components`, `@hooks`, `@lib`, `@services`,
  `@store`, `@types`, `@utils` — shared code must not import from a feature.
