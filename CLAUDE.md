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
- **PR #3** (merged): added this file.
- **PR #4** (merged): the public "Admin" nav link was visible to every visitor, not just
  admins — found in both `Nav.tsx` and `Footer.tsx` (two separate components, two separate
  instances of the same bug). `(marketing)/layout.tsx` now computes `isAdmin` server-side
  and passes it to both.
- **PR #5** (merged): marketing site "filing room" visual redesign — ledger-cream/ink-navy/
  filing-stamp-red palette (new Tailwind tokens: `paper`, `ink`, `stamp`, `brass`, `rule`,
  additive alongside the existing `navy`/`teal`/`gold` tokens), a real Articles-of-
  Incorporation document artifact in the hero, seal-style logo mark. **Scoped to the
  marketing site only** — the logged-in app (dashboard/admin/firm) still uses the old
  palette; extending the identity there is an open decision, not yet made.
- **PR #6** (merged): `buildEIN` and `buildResolutions` (`lib/doc-engine/builders/
  nonprofit.ts`) are registered under `DOC_CONFIG` keys shared by all 7 entity families,
  but contained hardcoded nonprofit-only content (wrong SS-4 entity classification, wrong
  IRS.gov navigation steps, nonprofit-specific board resolutions like "Appointment of
  Executive Director"). Fixed with `entityFamily()`-based branching; a new
  `buildResolutionsCorp()` in `builders/corp.ts` now serves LLC/C-Corp/S-Corp/Benefit/PC
  under a `resolutions_corp` key, nonprofit keeps its own unchanged `resolutions` key.
  Verified by generating real `.docx` output for all 7 families and inspecting the
  extracted `word/document.xml`, not just reading the code.
- **PR #7** (merged): added the automated test suite — see "Testing posture" below.

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

`apps/web/tests/` has a small `vitest` suite (`npm test`, wired into `ci.yml`) covering the
three reliability bugs fixed in PR #1 — Stripe webhook side-effect isolation, checkout
rollback, magic-link error handling — with mocked DB/Stripe/email so the tests exercise the
real control-flow code without live services. That's it, though: it's a regression net for
those three specific fixed bugs, not general coverage. Everything else in this project's
history has been verified by actually running the app — local Postgres, dummy env vars, a
real dev server, curl/Playwright against it, and (for Stripe webhooks) a locally
HMAC-signed event using the same webhook secret. If you're going to claim something works
and it's not one of the three paths the vitest suite covers, run it the same way; don't
infer correctness from reading the code.

## Outstanding before launch (human action required — cannot be done from a sandbox)

None of this can be provisioned or verified from an agent sandbox; it needs real
accounts/credentials:

1. ~~Supabase project~~ — **done**: Postgres provisioned, `db/schema.sql` loaded, Storage
   bucket created, connection confirmed live. (Direct Postgres connection is IPv6-only;
   use Supabase's connection pooler if provisioning from an IPv6-less environment again —
   also just the architecturally correct choice for serverless regardless.)
2. ~~Vercel project~~ — **done**: imported, root directory `apps/web`, deployed
   successfully, live URL confirmed.
3. **Stripe** — live/test keys, and a webhook endpoint registered at
   `/api/webhooks/stripe` subscribed to `payment_intent.succeeded`,
   `payment_intent.payment_failed`, `checkout.session.completed`,
   `customer.subscription.updated`, `customer.subscription.deleted`.
4. **SendGrid** — verified sender identity/domain (required or mail gets blocked/spam-
   filtered), API key. (`lib/email.ts` is already wired to `@sendgrid/mail` — no code
   change needed, just the account-side setup.)
5. **Anthropic API key** for the dashboard assistant feature.
6. `JWT_SECRET` / `CRON_SECRET` — generate random strings (`openssl rand -hex 32`).
   `CRON_SECRET` just needs to be set in Vercel — Vercel Cron sends it automatically.
7. `SENTRY_DSN` — optional but the webhook/checkout/request-link fixes above now report
   swallowed errors to Sentry; without a DSN those reports just no-op silently.
8. `FIRM_SEAT_PRICE_CENTS` — only if Pro-tier per-seat billing needs to be live at launch;
   otherwise leave unset (that one endpoint just errors until it's set).
9. Once real credentials exist for #3-5: smoke-test the golden path for real (signup →
   checkout → webhook fires → document generates in Supabase Storage → downloads), not
   just against dummy values. **Not done yet** — this is the single biggest remaining
   launch risk; nothing else on this list matters if this hasn't happened.

## Local dev / verification recipe

```bash
sudo service postgresql start
createdb formright_test && psql formright_test -f db/schema.sql
cd apps/web && cp .env.example .env.local   # fill with dummy values for a local check
npm install && npm run lint && npx tsc --noEmit && npm test && npm run build
PORT=4100 npm run dev   # pick an explicit port; stale dev-server processes on 3000+ are common in sandboxed runs
```

For UI checks, Playwright is available globally in this environment
(`NODE_PATH=/opt/node22/lib/node_modules`, `PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers`,
`PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1`) even though it's not a project dependency — use it
to actually drive the app and screenshot pages rather than just reading component code.
