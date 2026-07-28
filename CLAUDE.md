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

## Deployment platform: Netlify, not Vercel

Switched off Vercel entirely (2026-07-26). `netlify.toml` at the repo root points
Netlify at `apps/web` with `@netlify/plugin-nextjs`. The old `vercel.json` cron
config is gone — replaced by `apps/web/netlify/functions/compliance-reminders-cron.ts`,
a Netlify Scheduled Function (`0 13 * * *`, same schedule) that calls the existing
`/api/cron/compliance-reminders` route with the `CRON_SECRET` bearer token itself,
since Netlify has no auto-injected-header equivalent to Vercel Cron. No other
Vercel-specific code existed in the app (no `@vercel/*` packages, no edge
middleware, no ISR/ image-optimization config to migrate) — this was a clean swap.

This migration work (netlify.toml, the scheduled function, README/CLAUDE.md updates)
was originally done on branch `claude/vercel-build-deployment-7iptur` and has since been
merged to the default branch (`claude/build-it-ntpntq`) — `netlify.toml` and
`apps/web/netlify/functions/compliance-reminders-cron.ts` are live there now.

A live Vercel API token was pasted into a chat session on 2026-07-26 while
troubleshooting the old Vercel setup. It should be treated as compromised — rotate/
revoke it in Vercel (Settings → Tokens) regardless of whether Vercel is still used for
anything. Not confirmed done as of this writing.

## The real app is deployed and live at formright.org (as of 2026-07-28)

Contrary to earlier notes in this file (left below for history) — **the real Next.js app
now has its own Netlify project and is what `formright.org` actually serves.** Verified
directly via the Netlify API on 2026-07-28, not inferred from docs:

- Netlify project `formright-app` (site id `b3a4feaa-3ba6-4b15-99d7-ee4461feb390`) —
  primary URL `https://formright.org`, tracks the `claude/build-it-ntpntq` branch (this
  repo's actual default branch), framework `next`, deploys via `@netlify/plugin-nextjs`.
  Its current production deploy tracks whatever commit is HEAD on that branch — check
  the deploy's `commit_ref` against `git log` if you need to confirm what's actually live.
- The old coming-soon-page project (`formright`, site id
  `db7ec013-d643-4137-bc6c-8b2f0303c5e5`) still exists but no longer owns the custom
  domain — its primary URL is now the plain `https://formright.netlify.app`, still
  tracking `claude-temp-marketing-site`. DNS for `formright.org` has been moved to
  `formright-app`.
- A Supabase project (`formright`, ref `prmcagoivhfcgaljuryw`, Postgres 17,
  `ACTIVE_HEALTHY`) backs it — `DATABASE_URL`/`SUPABASE_*` env vars are set on
  `formright-app` and point there.
- **Stripe is in LIVE mode** on this deployment (`sk_live_…`/`pk_live_…`) — not test
  keys. Anything that exercises checkout against `formright.org` moves real money;
  see "Golden-path verification" below for how to test around that.
- All four Netlify env-var contexts (`production`, `deploy-preview`, `branch-deploy`,
  `dev`) for `formright-app` point at the **same** `DATABASE_URL` — deploy previews are
  not isolated from the production database. Keep that in mind before assuming a PR
  preview is a safe sandbox for anything destructive.
- Who set this up and exactly when isn't recorded anywhere in this repo's history — it
  happened between this file's last update and 2026-07-28, most likely by the human
  directly through the Netlify/Supabase/Stripe dashboards, not through a sandboxed
  session (none of this — creating accounts, generating live API keys — is something an
  agent sandbox can do). **Don't assume this file's "Outstanding before launch" list
  below is still accurate without re-checking** — several items on it turned out to
  already be done.

### Schema-drift incident (2026-07-28) and the fix

PRs #14/#15 (this file's QA-report fixes) merged code assuming migrations `017`-`019`
(`admin_notes` column, `notes` as `JSONB`, `documents.s3_key NOT NULL`) — but merging to
the default branch only auto-deploys the Netlify **app**, nothing had ever applied those
migrations to the live Supabase database. For about an hour, the live DB was one
migration behind the deployed code: registered-agent order fulfillment and admin-notes
saves were silently broken. Caught by hand (direct schema inspection via the Supabase
API), fixed by hand (applied 017-019 directly), and then fixed structurally — see
"`db/migrations/` — historical through 016, real and automated from 017" below for the
new `apps/web/scripts/migrate.js` runner that makes this a non-issue going forward. No
real customer data existed yet when this happened (`registrations`/`documents` were both
empty), so nothing was actually lost — but the next schema change won't get that luck for
free without the runner.

## Storage backend: Supabase, not AWS

`lib/storage.ts` (not `lib/s3.ts` — that file is gone) uses `@supabase/supabase-js`
against a private bucket with signed URLs. Env vars are `SUPABASE_URL` /
`SUPABASE_SERVICE_ROLE_KEY` / `SUPABASE_STORAGE_BUCKET`, not the old `AWS_*`/`S3_BUCKET`
ones. The `documents.s3_key` / `state_filings.stamped_doc_s3_key` DB columns were
deliberately **not** renamed (label-only, not worth a migration) — they hold Supabase
object keys now.

## `db/migrations/` — historical through 016, real and automated from 017

`001_init.sql` is `\ir ../schema.sql` — which pulls in the **entire current canonical
schema**, all phases, not just Phase 1. Running `002_phase2.sql` through
`005_registered_agent.sql` after it on a fresh database fails with "already exists" on
every table. Confirmed by actually running the full sequence, not just inspecting it.
`db/schema.sql` remains the real source of truth for a fresh manual install; migrations
001-016 are historical documentation only, not replayable.

**This no longer needs to be worked around by hand.** `apps/web/scripts/migrate.js` runs
before every Netlify production build, tracks applied migrations in a `schema_migrations`
table, and bootstraps itself (fresh DB → load `schema.sql` + stamp everything as baseline;
existing DB with no tracking yet → stamp everything as baseline without re-running it).
Every migration from `017` onward is a small, individually-safe `ALTER` the runner can
actually apply going forward — see the README's "Automated migrations" section.

This was built in direct response to a real incident (2026-07-28): PRs #14/#15 merged
code that assumed migrations 017-019 (`admin_notes` column, `notes` as JSONB, `s3_key
NOT NULL`) — but nothing had ever applied those migrations to the live Supabase database,
because merging to the default branch only auto-deploys the Netlify app, not the schema.
The live DB sat one migration behind the deployed code for about an hour, during which
registered-agent order fulfillment and admin-notes saves were silently broken (caught and
fixed by hand — see below — before any real customer data existed to be affected).

## Testing posture

No automated test suite exists (no jest/vitest/playwright, no `*.test.*` files). Every
verification claim in this project's history came from actually running the app — local
Postgres, dummy env vars, a real dev server, curl/Playwright against it, and (for Stripe
webhooks) a locally HMAC-signed event using the same webhook secret. If you're going to
claim something works, run it the same way; don't infer correctness from reading the code.

## Outstanding before launch (human action required — cannot be done from a sandbox)

Re-verified 2026-07-28 against the live Netlify/Supabase projects directly (not inferred) —
items 1-6 turned out to already be done, presumably by the human directly through each
provider's dashboard:

1. ~~**Supabase project**~~ — done. Project `formright` (ref `prmcagoivhfcgaljuryw`,
   Postgres 17, `ACTIVE_HEALTHY`); `DATABASE_URL`/`SUPABASE_*` are set on the
   `formright-app` Netlify project.
2. ~~**Netlify project for the real app**~~ — done. `formright-app`, base directory
   `apps/web`, tracks `claude/build-it-ntpntq`, serving `https://formright.org`. See
   "The real app is deployed and live at formright.org" above.
3. **Stripe** — `STRIPE_SECRET_KEY`/`STRIPE_PUBLISHABLE_KEY` are set and **in live mode**
   (`sk_live_…`/`pk_live_…`, not test keys), and `STRIPE_WEBHOOK_SECRET` is set (implies
   an endpoint was registered in the Stripe dashboard). **Not independently verified**:
   that the registered webhook is actually subscribed to all five events this app expects
   (`payment_intent.succeeded`, `payment_intent.payment_failed`,
   `checkout.session.completed`, `customer.subscription.updated`,
   `customer.subscription.deleted`) — check the Stripe dashboard's webhook config directly.
4. **SendGrid** — `SENDGRID_API_KEY`/`SENDGRID_FROM_EMAIL` (`noreply@formright.org`) are
   set. **Not independently verified**: sender identity/domain verification status in the
   SendGrid dashboard — if unverified, mail sends will fail or land in spam.
5. ~~**Anthropic API key**~~ — done, set on `formright-app`.
6. ~~`JWT_SECRET` / `CRON_SECRET`~~ — done, both set on `formright-app`.
7. `SENTRY_DSN` — still **not set** on `formright-app`. Optional, but until it's set the
   webhook/checkout/request-link error-reporting calls throughout this codebase no-op
   silently instead of actually alerting anyone.
8. `FIRM_SEAT_PRICE_CENTS` — still **not set**. Only matters if Pro-tier per-seat billing
   needs to be live at launch; that one endpoint just errors until it's set.
9. **Still outstanding**: smoke-test the golden path for real (signup → checkout →
   webhook fires → document generates in Supabase Storage → downloads) against the live
   deployment. Attempted 2026-07-28 from a sandboxed session and blocked by that session's
   own network egress policy (couldn't reach `formright.org` or the Supabase Postgres host
   directly — a sandbox limitation, not a code or infra problem). Since Stripe is live, do
   **not** complete this by pushing a real card through checkout unless intentionally
   spending real money — sign+verify a fake `payment_intent.succeeded` webhook event with
   the real `STRIPE_WEBHOOK_SECRET` instead (same technique PR #1 used to verify the
   webhook locally), or run it from an environment that can reach both hosts directly.
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
