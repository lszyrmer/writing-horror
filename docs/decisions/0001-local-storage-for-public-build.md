# ADR 0001 — Local-first storage for the public build; online version deferred

- **Status:** Accepted
- **Date:** 2026-06-15
- **Deciders:** Luke Szyrmer

## Context

Writing Horror is being shaped into a public portfolio artifact — something
hiring managers can clone, run, and play with in minutes.

The current implementation ships a Supabase backend with no authentication. Its
Row Level Security policies grant `anon` full read/write over a single, global
`user_settings` row and all `writing_sessions`. This means:

- Anyone holding the (client-bundled) anon key can read every visitor's session
  history and overwrite the one shared settings row for everyone.
- Custom audio is stored as base64 / arbitrary URLs in the database and fed
  directly to `new Audio(src)`.
- `src/lib/supabase.ts` **throws on boot** if `VITE_SUPABASE_*` env vars are
  absent — so a freshly cloned repo will not even start without backend
  credentials. That directly defeats the "download and play" goal.

There is a clear future direction where this becomes an online product with an
AI feature (e.g. turning a freewriting "daily dump" into a polished artifact),
but the user, problem, and positioning are not yet decided. Candidate
directions under consideration:

1. Parse a daily dump into actionable tasks.
2. Get feedback on product work.
3. A writing aid for the butt-in-chair / blank-page problem (what the forced-pace
   loop already optimizes for).

## Decision

The **public GitHub build is fully local**:

- Persist sessions in IndexedDB, settings in `localStorage`, custom audio as
  IndexedDB Blobs played via `URL.createObjectURL`.
- **No authentication.** Overkill for a single-device local tool.
- Keep all current features. Remove the Supabase client, the `supabase/`
  migrations, the `@supabase/supabase-js` dependency, and the `VITE_SUPABASE_*`
  env requirement.
- Result: `clone && npm install && npm run dev` works with zero setup.

The **online version is deferred** until the user/problem is defined through
further product analysis. When built, it will be kept in a private repository
— **not** on GitHub — and would add: Supabase Auth, per-user
`auth.uid()` RLS, a server-side (Edge Function) LLM transform with cost caps,
and Supabase Storage for audio.

## Alternatives considered

- **Build the robust online version now** (auth + per-user RLS + AI transform
  Edge Function + Storage). Rejected as premature: the product thesis (who, what
  problem) is undecided, and an unmonetized online app carries real cost and
  maintenance. Better to commit only after the analysis.
- **Keep the anonymous Supabase backend, tighten RLS.** Rejected: public `anon`
  RLS cannot truly isolate users; it is the insecure middle, and it still
  requires backend env to boot — failing the download-and-run goal.

## Consequences

- **Positive:** secure by removal (no shared data surface, no exposed key),
  works offline, zero-setup demo, less code. Strong fit for a forced-focus
  writing tool that should run on a plane.
- **Negative:** no cross-device sync; no AI "dump → artifact" feature in the
  public build. Both are intentionally reserved for the deferred online phase.
- Session history and settings are per-device and not portable between browsers.

## Supersedes

None.
