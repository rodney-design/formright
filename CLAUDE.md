# FormRight — agent working notes

Business formation SaaS (LLCs, C-Corps, S-Corps, Nonprofits, Benefit Corps, Professional
Corps, Sole Props). Next.js 14 App Router app in `apps/web/`. See `README.md` for the full
stack/architecture writeup — this file is operational context for picking work back up,
not a duplicate of it.

## Target: launch August 3, 2026

## Branch reality — read this first

- The repo's actual default branch is **`claude/build-it-ntpntq`**, not `main`. Always
  branch from and PR against this.
- Phases 1 through 5 (per the build-order doc referenced throughout code comments) were
  already built in a prior session before this file existed. Nothing in "Phase 1" needs
  building from scratch — audit before assuming work is missing.
- **Push directly to a feature branch, then open a PR — don't push more commits to a
  branch after its PR has merged.** That happened once already (a one-line onboarding CSS
  fix landed on `claude/formright-repo-clone-ga286e` after PR #1 had already merged into
  the default branch), and the commit was nearly lost permanently when the branch got
  deleted — recovered via PR #2. If a branch's PR is merged, cut a fresh branch for any
  further work.
- This session's git access can push commits and merge PRs, but **cannot delete remote
  branches** — `git push origin --delete <branch>` gets a 403 from the session's git proxy
  every time. That's an environment restriction, not a permissions bug; don't retry it.
  Deleting a remote branch requires the human, via GitHub's web UI or their own machine.

## What's been done in this repo (chronological)

- **PR #1** (merged): audited Stripe checkout/webhooks, magic-link auth, and the Postgres
  schema by actually running the app locally (real Postgres, dummy env vars, a locally
  HMAC-signed Stripe webhook event) rather than just reading code. Found and fixed four
  real bugs:
  - `db/migrations/001_init.sql` used `\i ../schema.sql` (resolves relative to psql's
    invocation dir, not the script's location) — switched to `\ir`.
  - Stripe webhook: confirmation-email failure could 500 the whole handler, causing Stripe
    to retry into an idempotency check that then permanently skipped the entire success
    block (state filing + registered-agent order + email), not just the email. Fixed by
    isolating each post-payment side effect in its own try/catch, reporting to Sentry.
  - `/api/checkout`: a Stripe API failure left a permanent orphaned "pending" registration
    row. Fixed with a rollback (itself wrapped in try/catch so a failed rollback can't
    hijack the response).
  - `/api/auth/request-link`: same missing-try/catch shape around the email send.
  - Also added `.github/workflows/ci.yml` (lint, typecheck, schema-load against a real
    Postgres service container, `next build`) and swapped document storage from S3 to
    Supabase Storage (`lib/storage.ts`) to keep AWS out of the Phase 1 deployment target —
    see the "Storage backend" section below.
- **PR #2** (merged): the onboarding wizard page (`app/onboard/page.tsx`) had a redundant
  `min-h-screen` stacked on top of the Wizard component's own `min-h-[70vh]`, pushing the
  page to 932px against a 900px viewport. Removed; page now sizes to the viewport exactly.

## Storage backend: Supabase, not AWS

`lib/storage.ts` (not `lib/s3.ts` — that file is gone) uses `@supabase/supabase-js`
against a private bucket with signed URLs. Env vars are `SUPABASE_URL` /
`SUPABASE_SERVICE_ROLE_KEY` / `SUPABASE_STORAGE_BUCKET`, not the old `AWS_*`/`S3_BUCKET`
ones. The `documents.s3_key` / `state_filings.stamped_doc_s3_key` DB columns were
deliberately **not** renamed (label-only, not worth a migration) — they hold Supabase
object keys now.

## Known inconsistency: `db/migrations/` isn't a real incremental chain

`001_init.sql` is `\ir ../schema.sql` — which pulls in the **entire current canonical
schema**, all phases, not just Phase 1. Running `002_phase2.sql` through
`005_registered_agent.sql` after it on a fresh database fails with "already exists" on
every table. Confirmed by actually running the full sequence, not just inspecting it.
`db/schema.sql` is the real source of truth for a fresh install; the migrations directory
is historical documentation only. Not fixed yet — needs a decision (rewrite `001_init.sql`
to be Phase-1-only again, or drop the migrations directory for real schema-diff tooling)
before it's worth touching.

## Testing posture

No automated test suite exists (no jest/vitest/playwright, no `*.test.*` files). Every
verification claim in this project's history came from actually running the app — local
Postgres, dummy env vars, a real dev server, curl/Playwright against it, and (for Stripe
webhooks) a locally HMAC-signed event using the same webhook secret. If you're going to
claim something works, run it the same way; don't infer correctness from reading the code.

## Outstanding before launch (human action required — cannot be done from a sandbox)

None of this can be provisioned from an agent sandbox; it needs real accounts/credentials:

1. **Supabase project** — Postgres (`DATABASE_URL`) + a private Storage bucket
   (`SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_STORAGE_BUCKET`). Load
   `db/schema.sql` into it.
2. **Vercel project** (`formrightcomingsoon`) — import the repo, and set in
   Build & Deployment settings:
   - **Root Directory**: `apps/web` (the only app in this monorepo).
   - **Node.js Version**: `20.x` (no `.nvmrc`/`engines` pin in the repo, but
     `@types/node` is `^20` and that's the safe match for Next 14.2.35).
   - **Ignored Build Step**: "Only build if there are changes in a folder" →
     `apps/web` (add `db/schema.sql` too if schema changes should also trigger
     a rebuild). Avoids burning builds on `docs/`-only commits.
   - Concurrent Builds / Build Machine / Deployment Checks / Rolling Releases:
     Pro-plan extras, leave at defaults — not needed for launch.
   - Every var from `.env.example` set in Production + Preview.
3. **Stripe** — live/test keys, and a webhook endpoint registered at
   `/api/webhooks/stripe` subscribed to `payment_intent.succeeded`,
   `payment_intent.payment_failed`, `checkout.session.completed`,
   `customer.subscription.updated`, `customer.subscription.deleted`.
4. **SendGrid** — verified sender identity/domain (required or mail gets blocked/spam-
   filtered), API key.
5. **Anthropic API key** for the dashboard assistant feature.
6. `JWT_SECRET` / `CRON_SECRET` — generate random strings (`openssl rand -hex 32`).
   `CRON_SECRET` just needs to be set in Vercel — Vercel Cron sends it automatically.
7. `SENTRY_DSN` — optional but the webhook/checkout/request-link fixes above now report
   swallowed errors to Sentry; without a DSN those reports just no-op silently.
8. `FIRM_SEAT_PRICE_CENTS` — only if Pro-tier per-seat billing needs to be live at launch;
   otherwise leave unset (that one endpoint just errors until it's set).
9. Once real credentials exist: smoke-test the golden path for real (signup → checkout →
   webhook fires → document generates in Supabase Storage → downloads), not just against
   dummy values.
10. Delete `origin/claude/formright-repo-clone-ga286e` on GitHub (merged twice over via
    PR #1 and #2, safe to remove — this session's git proxy can't do it, see above).

## Local dev / verification recipe

```bash
sudo service postgresql start
createdb formright_test && psql formright_test -f db/schema.sql
cd apps/web && cp .env.example .env.local   # fill with dummy values for a local check
npm install && npm run lint && npx tsc --noEmit && npm run build
PORT=4100 npm run dev   # pick an explicit port; stale dev-server processes on 3000+ are common in sandboxed runs
```

For UI checks, Playwright is available globally in this environment
(`NODE_PATH=/opt/node22/lib/node_modules`, `PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers`,
`PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1`) even though it's not a project dependency — use it
to actually drive the app and screenshot pages rather than just reading component code.
