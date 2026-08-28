# Security Policy — CCC Employment System (Web Client)

This is the web client for CCC's employment system (see [story.md](story.md)).
It's a presentation layer over the `ccc-employment-system-backend` Laravel
API — it has no database of its own; whatever auth/session mechanism gets
built should keep it that way.

This is a fresh scaffold: no auth, no API calls, no third-party scripts wired
up yet. This document is a checklist for what to get right as those get
built, not a record of controls already in place — update each section as
real code lands, the way the reference `digipay-web-client-typescript`
project's `SECURITY.md` documents its actual, shipped controls.

## Reporting a vulnerability

Report internally to the engineering team lead — do not open a public GitHub
issue for a security finding, since this handles employee/HR data.

## Things to get right when building this out

- **Session/auth**: prefer a server-issued, `httpOnly`, `secure` cookie over
  any client-readable token storage (`localStorage`, non-`httpOnly` cookie,
  Redux/Context state that outlives the request).
- **Access control**: gate authenticated routes server-side (layout or
  middleware reading the session cookie), not just by hiding UI client-side.
- **PII**: employee records are personal data — never log full request/response
  bodies containing them; log identifiers only.
- **CSP / security headers**: set centrally (`next.config.js` `headers()`)
  once any third-party script is introduced, rather than trusting defaults.
- **Env vars**: only `NEXT_PUBLIC_*` values may ship to the browser bundle;
  anything that must stay server-only (API keys, signing secrets) goes in a
  non-`NEXT_PUBLIC_*` var read only from Server Components/Actions.
- **Cross-employee data isolation**: same rule as the reference project — the
  backend must authorize every request against the caller's own identity;
  the frontend passing an employee/record ID is never itself proof of
  authorization.

## Pre-Deploy Security Checklist

- [ ] `npm run lint` and `npx tsc --noEmit` are clean.
- [ ] `npm audit` has no unresolved high/critical findings.
- [ ] No access token or PII written to `localStorage` or a non-`httpOnly`
      cookie.
- [ ] No new `NEXT_PUBLIC_*` env var holds a value that must stay confidential.
- [ ] Security headers present on responses (CSP, `X-Frame-Options`, HSTS,
      `Referrer-Policy`, `X-Content-Type-Options`) once configured.
