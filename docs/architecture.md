# Architecture

## Stack

Next.js 16 (App Router), React 19, TypeScript 5. Fresh scaffold — no UI
library chosen yet, no auth wired up. Backend is `ccc-employment-system-backend`
(Laravel API, MySQL), called over HTTP; this client holds no data of its own.

## Current state

Screens: `/login`, `/dashboard` (Today + time clock), `/employees` (list,
new, detail, edit/delete), `/attendance` (by date, manual entry, edit/delete).
Tailwind v4 with the trest palette (`ink`, `muted`, `canvas`, `line`, `moss`,
`clay`, `brick`) in `src/app/globals.css`.

## Server vs Client Components

App Router renders every component as a **Server Component** by default. Add
`"use client"` only when a component actually needs interactivity
(`useState`, `useEffect`, event handlers, browser APIs). Default to Server
Components; this keeps the JS shipped to the browser small.

## Co-location convention

- A `_`-prefixed folder is **private** — not a routable URL segment.
- `src/app/_*` — shared across the entire app.
- `src/app/<route>/_*` — scoped to that one route.

Components/hooks/helpers live next to the route that uses them until more
than one route needs them, then move up to the nearest shared `_*` folder.

## Path aliases

`@/*` → `src/*` (set in `tsconfig.json` by the scaffold). Add more specific
aliases (`@components/*`, `@lib/*`, etc.) once there's enough shared code to
justify them — don't pre-create empty alias folders.

## Data fetching (BFF)

The browser never calls Laravel. Server Components read with
`apiData<T>(path)` and Server Actions write with `apiFetch<T>(path, {method, body})`
(`src/app/_lib/api.server.ts`); both attach `Authorization: Bearer` from the
`httpOnly` cookie `ccc_token`. `API_URL` is server-only.

- Actions live in `<route>/_actions/*.action.ts`, return `ActionState`
  (`{message?, error?, errors?}`) for `useActionState`, and build explicit JSON
  bodies — the API rejects unknown fields.
- `src/proxy.ts` only checks the cookie exists (optimistic). A 401 from the API
  redirects to `/auth/expired`, a Route Handler that clears the cookie (Server
  Components cannot) and sends the user to `/login?expired=1`.
- Formatting of API raw values (`HH:MM:SS`, minutes, `Y-m-d`) is in
  `src/app/_lib/format.ts`.
