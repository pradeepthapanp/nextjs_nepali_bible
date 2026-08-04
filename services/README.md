# Services

This directory holds the **data-access / service layer**: functions that talk to
backend APIs (Supabase, REST, etc.) and return normalized results.

## Convention

- One module per domain, e.g. `services/bible.ts`, `services/music.ts`,
  `services/auth.ts`.
- Functions are typed and return a normalized result — use `ServiceError` from
  `@types` for error shapes and `Maybe<T>`/`Nullable<T>` where appropriate.
- Services are consumed by TanStack Query hooks and by Server Components.
  They do **not** depend on React — they are plain async modules.
- The low-level Supabase client wiring lives in `lib/supabase/` (client/server/
  middleware); services build on top of those clients.

## Example shape (added during feature migration)

```ts
// services/bible.ts
import { createClient } from "@/lib/supabase/server";

export async function getBooks() {
  const supabase = await createClient();
  // ...supabase.from("books").select("*")
}
```

This folder intentionally contains no feature services yet — the foundation
only wires the client layer in `lib/supabase/`.
