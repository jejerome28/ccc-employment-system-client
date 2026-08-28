# CCC Employment System — Web Client

> Project for **City College of Calamba**, done as part of IT 210 (Sir Coy).
>
> Group 1: G. Batalla, C. Brosas, A. Erana, J. Goyala

Next.js (App Router, TypeScript) dashboard for CCC's employment system. Talks
to the [`ccc-employment-system-backend`](https://github.com/jejerome28/ccc-employment-system-backend)
Laravel API — this app holds no data of its own. See [story.md](story.md) for
the product context and [docs/architecture.md](docs/architecture.md) for
conventions.

## Prerequisites

- Node.js 20+ and npm
- The backend running locally (see its README) — this app expects an API to
  call once features land

## Setup

```bash
git clone https://github.com/jejerome28/ccc-employment-system-client.git
cd ccc-employment-system-client
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Commands

```bash
npm run dev      # start dev server
npm run build    # production build
npm run lint     # eslint
npx tsc --noEmit # typecheck
npm test         # Jest unit tests
npm run e2e      # Playwright e2e tests (starts dev server automatically)
```

First time running e2e, install the browser: `npx playwright install --with-deps chromium`
(the `--with-deps` step needs `sudo`; if that fails, run `npx playwright install chromium`
alone and make sure system deps are already present).

## Docs

- [story.md](story.md) — what this system is for
- [SECURITY.md](SECURITY.md) — security checklist
- [docs/architecture.md](docs/architecture.md) — stack and conventions
