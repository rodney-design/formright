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
lives on branch `claude/vercel-build-deployment-7iptur`. **It has not been merged to
the default branch or deployed anywhere yet** — see "Coming-soon site is live, main
app is not" below for what's actually running in production right now.

A live Vercel API token was pasted into a chat session on 2026-07-26 while
troubleshooting the old Vercel setup. It should be treated as compromised — rotate/
revoke it in Vercel (Settings → Tokens) regardless of whether Vercel is still used for
anything. Not confirmed done as of this writing.

## formright.org now serves the real app (cut over 2026-07-27)

**DNS cutover is done.** `formright.org` now points at the real Next.js app on the
`formright-app` Netlify project, not the coming-soon page. Sequence, for reference if
this ever needs redoing:

1. Netlify only allows one project to claim a given custom domain — had to remove
   `formright.org` / `www.formright.org` from the old `formright` project's Domain
   management first (attempting to add it to `formright-app` before doing this gives
   a clear "Another project is already using this domain" error, not a silent failure).
2. Added the domain to `formright-app` → Domain management → Add a domain, then
   followed whatever DNS records that page displayed (values can differ from what a
   different site's setup showed previously) and updated them at IONOS.
3. Netlify auto-provisioned a new Let's Encrypt cert for the new association.

The old `formright` Netlify project (coming-soon page, `marketing-temp/index.html` on
branch `claude/temp-marketing-site`) **still exists** — only its custom domain
association was removed, the project itself was not deleted. Its Netlify Forms
submissions data (visitors who signed up via "Get Notified at Launch") is presumably
still sitting there, unread — nobody has been pinged on new signups (no notification
was ever configured under Forms → Form notifications). Worth checking that data via
that project's Forms tab before it's ever decommissioned for good. Its own
`marketing-temp/README.md` "Retiring it" section still references Vercel — stale,
needs a rewrite whenever someone gets to actually retiring that project.

Footer contact address on the retired coming-soon page was `hello@formright.org` —
confirm that inbox exists in the Google Workspace tied to the domain, independent of
this cutover.

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

1. **Supabase project** — DONE (2026-07-27). Project `formright` (ref
   `prmcagoivhfcgaljuryw`, `https://prmcagoivhfcgaljuryw.supabase.co`) already existed
   with `db/schema.sql`'s tables loaded except `compliance_rules`, which was missing —
   created it via the Supabase MCP connection, then seeded `state_fees` (8 rows) and
   `compliance_rules` (91 rows, all six batches — `003_phase3.sql`'s state_fees INSERT
   plus `007`-`012_compliance_rules_*.sql`) since those migrations' seed data lives
   outside `schema.sql` (see "Known inconsistency" above). A private `documents` Storage
   bucket already existed too, matching `lib/storage.ts`'s expected bucket name.
   Security/performance advisors came back clean — the `rls_enabled_no_policy` INFO
   notice on every table is expected, since the app talks to Postgres via
   `DATABASE_URL`/the service-role key server-side, not the Supabase client from a
   browser, so no anon/authenticated RLS policies are needed.
   All four Supabase env vars (`DATABASE_URL`, `SUPABASE_URL`,
   `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_STORAGE_BUCKET`) are now set directly on the
   `formright-app` Netlify project (see item 2) — the human provided the DB password
   (via a dashboard password reset) and the new-format `sb_secret_...` key from
   Settings → API in chat, since MCP can't retrieve either. **Do not put the actual
   secret values in this file** — they live in Netlify's env var store only. If
   `DATABASE_URL` ever needs re-deriving: dashboard → Settings → Database → Connection
   pooling → **Transaction pooler**, port `6543` (not the direct 5432 connection —
   Netlify functions are short-lived/serverless).
2. **Netlify project for the real app** — DONE, including the DNS cutover (see
   "formright.org now serves the real app" above). **`formright-app`**
   (site id `b3a4feaa-3ba6-4b15-99d7-ee4461feb390`, team `rodney-urhb1t8`) is now live
   at both `https://formright-app.netlify.app` and `https://formright.org`, deployed
   from branch `claude/build-it-ntpntq` (the default branch).
   All env vars from `.env.example` are now set: `CRON_SECRET`, `JWT_SECRET`,
   `NEXT_PUBLIC_APP_URL` (updated 2026-07-27 to `https://formright.org` — was
   `https://formright-app.netlify.app`; since this is a `NEXT_PUBLIC_*` var, Next.js
   inlines every reference to it at *build* time, in server route handlers too, not
   just client bundles — so **a fresh deploy is required** for checkout
   success/cancel URLs and magic-link auth emails to actually use `formright.org`;
   confirm one has run since 2026-07-27T22:39 UTC before trusting those links),
   `DATABASE_URL`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`,
   `SUPABASE_STORAGE_BUCKET`, `SENDGRID_API_KEY`, `SENDGRID_FROM_EMAIL`,
   `STRIPE_SECRET_KEY`, `STRIPE_PUBLISHABLE_KEY`, `STRIPE_WEBHOOK_SECRET`,
   `ANTHROPIC_API_KEY`. Not set (both optional): `SENTRY_DSN`, `FIRM_SEAT_PRICE_CENTS`.
   (Gotcha for next time: `manage-env-vars` upserts can silently not persist if
   `newVarScopes` is a subset like `["functions","runtime"]` — always use `["all"]`.)
   Still not independently verified: the `DATABASE_URL` connection actually works
   end-to-end — a `psql` test from this sandbox hung indefinitely (raw Postgres TCP on
   port 6543 isn't reachable from this sandbox, only proxied HTTPS is; same restriction
   blocks curling `formright.org`/`formright-app.netlify.app` directly from here —
   confirmed via the proxy status endpoint, a 403 policy denial, not a bug). Has to be
   verified by actually using the deployed app, not from a sandbox.
3. **Stripe** — DONE. Live-mode keys set (`STRIPE_SECRET_KEY`, `STRIPE_PUBLISHABLE_KEY`).
   Webhook endpoint registered in the Stripe dashboard (Workbench → Webhooks → event
   destination scope "Your account", not "Connected accounts" — FormRight isn't a
   Connect/marketplace platform) pointed at
   `https://formright-app.netlify.app/api/webhooks/stripe`, subscribed to
   `payment_intent.succeeded`, `payment_intent.payment_failed`,
   `checkout.session.completed`, `customer.subscription.updated`,
   `customer.subscription.deleted`; payload style left as "Snapshot" (matches
   `stripe.webhooks.constructEvent()` in `apps/web/app/api/webhooks/stripe/route.ts` —
   don't switch to "Thin" event notifications, the handler doesn't support that shape).
   `STRIPE_WEBHOOK_SECRET` set from that endpoint's signing secret.
   **Important**: the Stripe account showed "Review in progress — 2-3 days" as of
   2026-07-27 (dashboard → account status). Live charges may not fully process until
   that clears — factor this into when the golden-path smoke test (item 9) can
   actually succeed end-to-end. Also: no test-mode keys were configured alongside the
   live ones, so any smoke test hits real money — either use a real card + refund, or
   temporarily pull `pk_test_`/`sk_test_` keys from Stripe for testing first.
4. **SendGrid** — DONE. Domain authentication for `formright.org` verified (5 CNAME +
   1 TXT DMARC record added at IONOS; DMARC started at `p=none`, monitor-only — plan
   to move to `quarantine`/`reject` after watching reports for a couple weeks). API key
   set as `SENDGRID_API_KEY`. `SENDGRID_FROM_EMAIL=noreply@formright.org` chosen
   deliberately separate from `hello@formright.org` (the human-facing contact address)
   to keep automated transactional mail (magic links, confirmations) distinct.
   Flagged but not yet addressed: SendGrid click-tracking, if ever enabled, can cause
   corporate email gateways / Microsoft Defender "Safe Links" to pre-fetch and consume
   single-use magic-link tokens before the real user clicks — disable click tracking
   specifically for the magic-link email if this becomes an issue.
5. **Anthropic API key** — DONE, set as `ANTHROPIC_API_KEY`.
6. `JWT_SECRET` / `CRON_SECRET` — DONE, already set on `formright-app` (see item 2).
7. `SENTRY_DSN` — optional but the webhook/checkout/request-link fixes above now report
   swallowed errors to Sentry; without a DSN those reports just no-op silently. Not set
   yet.
8. `FIRM_SEAT_PRICE_CENTS` — only if Pro-tier per-seat billing needs to be live at launch;
   otherwise leave unset (that one endpoint just errors until it's set). Not set yet.
9. **Not started yet — the main remaining task.** Smoke-test the golden path for real
   (signup → checkout → webhook fires → document generates in Supabase Storage →
   downloads) against `https://formright.org` now that it's live, not just against
   dummy values. Blocked in part on Stripe's account review clearing (item 3) and on
   confirming a fresh deploy has run since the `NEXT_PUBLIC_APP_URL` change (item 2).
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
