# Architecture

## Stack

Next.js 16 (App Router), React 19, TypeScript 5. Fresh scaffold — no UI
library chosen yet, no auth wired up. Backend is `ccc-employment-system-backend`
(Laravel API, MySQL), called over HTTP; this client holds no data of its own.

## Current state

Default `create-next-app` layout — `src/app/layout.tsx`, `src/app/page.tsx`.
Nothing route- or feature-specific exists yet. The conventions below are the
intended direction (mirrored from the more mature `digipay-web-client-typescript`
sibling project), to adopt as real routes/features get added rather than
decided ad hoc per PR.

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

## Data fetching

Not yet decided. When wiring up the Laravel API, prefer the Server
Action pattern the reference project uses (`<feature>/<name>.action.ts` "use
server" boundary calling a `.server.ts` fetch helper) over ad-hoc `fetch()`
calls scattered through client components — keeps auth/session handling in
one place.
