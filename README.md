# FormRight

Business formation for every founder — LLCs, C-Corps, S-Corps, Nonprofits, Benefit Corps,
Professional Corps, and Sole Proprietorships. Phase 1 Next.js build, ported from the
`formright_v2_pbc.html` prototype per the Phase 1 build-order doc.

## Stack

- **App**: Next.js 14 (App Router) + TypeScript + Tailwind, in `apps/web/`
- **DB**: Postgres (schema in `db/schema.sql`)
- **Auth**: passwordless magic-link (JWT session cookie, no passwords anywhere)
- **Payments**: Stripe Checkout + webhooks
- **Email**: SendGrid
- **Documents**: server-side `docx`/`jspdf` generation in `apps/web/lib/doc-engine/`
- **Errors**: Sentry (`apps/web/instrumentation.ts`), only active when `SENTRY_DSN` is set

## Getting started

```bash
cd apps/web
cp .env.example .env.local   # fill in the values below
npm install
npm run dev
```

Create the database and load the schema:

```bash
createdb formright
psql formright -f ../db/schema.sql
```

### Environment variables

See `.env.example`. All of these are required for the app to function; nothing is hardcoded.

| Var | Used for |
|---|---|
| `DATABASE_URL` | Postgres connection string |
| `JWT_SECRET` | Signs session JWTs |
| `STRIPE_SECRET_KEY` | Server-side Stripe API calls |
| `STRIPE_WEBHOOK_SECRET` | Verifies `/api/webhooks/stripe` signatures |
| `STRIPE_PUBLISHABLE_KEY` | Reserved for client-side Stripe.js if needed later |
| `SENDGRID_API_KEY` | Sends magic-link and confirmation emails |
| `SENDGRID_FROM_EMAIL` | From-address for those emails |
| `SENTRY_DSN` | Enables server-side error reporting when set; app runs fine without it |
| `NEXT_PUBLIC_APP_URL` | Absolute base URL used in emails and redirects |
| `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` | Supabase Storage access for the document vault (Phase 2). The service-role key bypasses row-level security for server-side access to a private bucket — never expose it to the client. |
| `SUPABASE_STORAGE_BUCKET` | Bucket generated documents are uploaded to |
| `CRON_SECRET` | Shared secret the compliance-reminder cron route checks against the `Authorization: Bearer` header the Netlify Scheduled Function sends |

### Promoting a user to admin

There is no signup flow for admin accounts — this is intentional (see "Known debt fixed"
below). Admins sign in the same passwordless way as clients; access is gated by the `role`
column. To grant access after someone has signed in at least once:

```sql
UPDATE users SET role = 'admin' WHERE email = 'you@yourcompany.com';
```

## Project layout

```
apps/web/
  app/(marketing)/     home, pricing, terms, privacy, about, contact, etc.
  app/onboard/         6-step formation wizard
  app/dashboard/        client dashboard (documents, filing status, billing, settings)
  app/admin/            admin pipeline + registration detail
  app/api/               auth, checkout, stripe webhook, document downloads, admin actions
  lib/entities/          ported entity-routing logic (entityFamily, ENTITY_DOCS_MAP, evalIrs, STATE_FEES, pricing)
  lib/doc-engine/         ported docx/PDF document generation, server-side
  lib/store/              onboarding wizard client state (Zustand)
db/
  schema.sql              Phase 1 schema (users, sessions, registrations, payments, documents)
```

## Known debt fixed during this port (per build-order doc §6)

- No hardcoded admin password — admin access requires a real `role='admin'` DB row plus a
  magic-link login, same as any other account.
- No demo auth bypass — every sign-in goes through `/api/auth/request-link` +
  `/api/auth/verify`, backed by real tokens with expiry.
- No duplicate-ID admin table markup — the admin UI is componentized React, not repeated
  literal `id="admin-table"` elements.
- No Cloudflare `/cdn-cgi/` email-decode script — plain `mailto:` links.
- No jsPDF/docx CDN dependency — both are bundled npm dependencies used server-side.

## Phase 1 scope notes

- `STATE_FEES` is the ported flat rate table; a normalized `state_fees` table keyed by
  state + entity type is a Should-Have for a later pass, not a Phase 1 blocker.
- Additional onboarding-wizard fields that don't have dedicated columns in the Phase 1 schema
  (program description, governance preferences, IRS screening answers, registered-agent info)
  are preserved as JSON in `registrations.notes` rather than dropped.

## Phase 2 — Document Vault & Compliance

- **Document generation now stores to Supabase Storage** instead of only streaming the generated
  file back. `GET /api/documents/registration/:registrationId?key=...` (or `?all=1` for the zip)
  generates, uploads to a private bucket, writes a `documents` row, and redirects to a signed URL.
  Each regeneration is a new `version` row rather than overwriting the previous one. (Originally
  built on S3 — swapped for Supabase Storage to keep AWS out of the Phase 1 deployment target;
  `lib/storage.ts` is the only place this is wired in. The `documents.s3_key` /
  `state_filings.stamped_doc_s3_key` columns predate the swap and still hold the object key, just
  no longer literally an S3 key — left unrenamed to avoid a migration for a label-only change.)
- **Document vault API** — `GET /api/documents/:userId` returns signed URLs for a user's
  already-generated documents (`lib/queries/documents.ts`). The dashboard Documents tab uses this
  to show "Download" vs. "Generate" per document.
- **FormRight Comply subscription** — real recurring Stripe billing ($149/yr), separate from the
  one-time formation checkout (Stripe Checkout can't mix payment and subscription line items in
  one session). `POST /api/subscriptions/comply/checkout` starts it from the dashboard billing
  page; the Stripe webhook upserts the `subscriptions` table on `checkout.session.completed` /
  `customer.subscription.updated` / `customer.subscription.deleted`.
- **Compliance calendar** — `lib/entities/complianceEvents.ts` seeds `compliance_events` rows on
  registration creation, entity-type-driven (e.g. IRS Form 2553 election deadline for S-Corps,
  annual benefit report for Benefit Corps). Due dates are approximated from the formation date;
  state-specific fixed-calendar-date rules aren't modeled yet.
- **Reminder cron** — `GET /api/cron/compliance-reminders`, secret-protected via `CRON_SECRET`,
  triggered daily by the Netlify Scheduled Function in `netlify/functions/compliance-reminders-cron.ts`.
  Emails via SendGrid when an event is exactly 90, 60, or 30 days from its due date, then marks
  `reminded_at`.
- **Registered agent service is not implemented.** Per the build-order doc, this is gated on a
  business decision (integrate with Northwest Registered Agent's API vs. build in-house
  fulfillment) rather than a pure build task — the `subscriptions.plan` CHECK constraint already
  allows `'agent'` so the schema doesn't block whichever direction gets picked.

## Phase 3 — State Filing Integrations

**Research finding (checked before building — see build-order doc's own caveat that this phase
is gated by external approval, not build time): none of the 5 priority states (DE, CA, FL, NY,
TX) expose a documented, official, programmatic filing-submission API today.** All five are
web-portal-only — Texas's SOSDirect/SOSUpload is the closest thing to programmatic (an
authenticated account-based upload workflow, still not a REST/SOAP API), and fax filing there
was discontinued Sept 2025 in favor of that portal. Search-engine "API" results for these states
are almost entirely third-party data resellers scraping/reselling entity data, not official state
filing capability. This should be re-verified directly with each state's Division of
Corporations/business-filing office before assuming it's permanently true — it's a snapshot, not
a guarantee.

Given that, Phase 3 is built as **manual filing status tracking**, not automated e-filing:

- `state_filings` and `state_fees` tables (`db/migrations/003_phase3.sql`).
- `lib/entities/stateFeesTable.ts`'s `getStateFeeForEntity()` reads entity-type-specific fees from
  `state_fees`, falling back to the old flat `STATE_FEES` rate when no row exists yet. Only a
  few state+entity_type combinations are seeded — the ones the build-order doc gives verified
  figures for (Delaware LLC/C-Corp/Nonprofit, New York's LLC publication-fee callout, California's
  LLC fee + $800/yr franchise tax). Filling in the rest needs a real accuracy pass against current
  Secretary of State fee schedules, not invented numbers — deliberately left unseeded rather than
  guessed.
- `lib/state-filing/worksheet.ts` builds a filing worksheet from a registration's data (entity
  name, registered agent, address, board/members) — not a state-specific verified form mapping,
  since no state's actual form field schema was confirmed. It's what staff transcribe into that
  state's own portal by hand.
- A `state_filings` row is auto-created (`ensureStateFiling`) when a registration's payment
  succeeds (Stripe webhook). Admins update `filing_status`/`state_confirmation_id` and attach the
  stamped certificate (uploaded to Supabase Storage) via the `StateFilingPanel` on the admin
  registration detail page (`PATCH /api/admin/state-filings/:id`) after filing through the state's
  portal directly. This is the "filing status webhook/polling" build-order doc step, done manually
  since no state offers a real one yet.
- Client dashboard's Filing Status page now shows the real `state_filings` status and a stamped
  certificate download link (signed URL) once approved, instead of only the coarse
  `registrations.status` timeline.
- **If a state opens a real filing API later**, or FormRight decides to build portal automation,
  swap the manual step in `lib/state-filing/` for a real submission client — the `state_filings`
  table and status flow underneath don't need to change.
- **Prototype vendor-filing seam (`lib/state-filing/providers/`, `db/migrations/006_filing_provider.sql`).**
  Still no state exposes a direct filing API, but third-party filers (FileForms, doola, ...)
  operate as approved filers and expose *their own* filing operations as a REST API + webhooks.
  `getFilingProvider(state)` in `lib/state-filing/providers/index.ts` returns a configured vendor
  client (currently `fileforms.ts`) or `null`; `submitStateFilingToProvider()`
  (`lib/state-filing/submit.ts`) is called right after `ensureStateFiling()` in the Stripe webhook,
  isolated in its own try/catch so a vendor outage can't block payment processing. `state_filings`
  gained `provider` (defaults to `'manual'`, the existing worksheet flow) and `provider_filing_id`
  columns. `POST /api/webhooks/fileforms` receives status callbacks and re-hosts the stamped
  certificate in Supabase Storage. **This is a prototype, not a verified integration**: FileForms's
  actual endpoint paths, request/response field names, and webhook header names in
  `fileforms.ts` are reconstructed from public marketing pages (direct fetches to their docs were
  blocked from this sandbox) — confirm every one against a real sandbox account/API reference
  before pointing this at production, the same way `state_fees` rows were deliberately left
  unseeded rather than guessed. No `FILEFORMS_API_KEY` is set anywhere, so today this seam is a
  no-op and every filing still goes through the manual worksheet.

## Registered agent service (Northwest Registered Agent)

The Phase 2 build-order doc flagged registered agent fulfillment as gated on a business decision
(Northwest's API vs. in-house) rather than a pure build task. That decision landed on Northwest —
but researching their actual technical surface (same diligence as the Phase 3 state research)
found **no confirmed public, self-serve API**: Northwest's "Wholesale Registered Agent
Partnership" is sales-gated (phone/email onboarding with a wholesale specialist), not API key
issuance. So this is built the same way as Phase 3's state filing tracking:

- `registered_agent_orders` table (`db/migrations/005_registered_agent.sql`), auto-created
  (`ensureRegisteredAgentOrder`) when a paid registration's `notes.addons` includes
  `registered_agent` (Stripe webhook). Plan-bundled registered agent (the Standard tier's included
  "Registered agent (1 year)" feature) doesn't create an order row yet — only the explicit addon
  purchase does; wiring the bundled case is a follow-up, not silently assumed.
- `lib/registered-agent/worksheet.ts` builds an order packet (entity name, state, address,
  contact) for staff to place by phone/email with a Northwest wholesale contact.
- Admins record the resulting status/confirmation ID via `RegisteredAgentPanel` on the admin
  registration detail page (`PATCH /api/admin/registered-agent-orders/:id`). Status surfaces to
  the client on the dashboard Filing Status page.
- **If Northwest's wholesale API access materializes** (their marketing describes something
  API-shaped but it couldn't be verified from outside a partner relationship — no primary-source
  docs, auth scheme, or endpoint list found), swap the manual step for a real client the same way
  as state filing.

## Phase 4 — B2B Pro Tier & API

**Pro-tier signup is sales-assisted, not self-serve** (brief §4.3: pricing page routes Pro-tier
CTAs to "Contact Sales," already true since Phase 1's `PricingTabs.tsx`). Concretely: an internal
admin creates the `firms` row and its founding `firm_admin` via `/admin/firms`
(`POST /api/admin/firms`) after the sales conversation — there's no public "create your firm"
flow. Managing the firm afterward (inviting teammates, generating API keys, configuring branding,
subscribing to seat billing) is self-service from `/firm/*`.

- **Schema**: `firms`, `firm_members`, `api_keys`, `registrations.firm_id`
  (`db/migrations/004_phase4.sql`), plus a `firm_subscriptions` table not in the doc's literal
  schema block — kept separate from the personal `subscriptions` table (Comply) since seat billing
  is scoped to the firm, not a user.
- **Firm dashboard** (`/firm`) — bulk client list with status view + CSV export, isolated by
  `firm_id` (`lib/queries/firms.ts`, `getRegistrationsForFirm`). Read-only: firm staff see
  formation status but don't edit FormRight's internal processing status.
- **White-label PDFs** — `lib/doc-engine/branding.ts` fetches a firm's logo/color
  (`firms.branding` JSONB) and threads it through cover pages and headers/footers
  (`lib/doc-engine/helpers.ts`). Deliberately scoped to covers/headers/footers only, not full
  document re-theming — the builder functions have dozens of hardcoded brand-color literals per
  file, and rethreading branding through all of them was out of scope. Set from `/firm/settings`.
- **REST API v1** (`/api/v1/formations`, `/api/v1/documents`, `/api/v1/status`) — `Authorization:
  Bearer <key>` auth (`lib/apiAuth.ts`, `lib/queries/apiKeys.ts`; keys are sha256-hashed, shown
  once at creation in `/firm/api-keys`), every query scoped to the calling firm. Formations
  created via the API are marked `paid` immediately (no per-formation Stripe checkout) since
  Pro-tier firms are billed per-seat, not per-formation.
- **Per-seat billing** — `POST /api/subscriptions/pro/checkout` (firm admin only) creates a
  Stripe subscription with quantity = active `firm_members` count; quantity resyncs
  (`syncFirmSeatQuantity`) whenever membership changes (invite accepted on login, member removed).
  **`FIRM_SEAT_PRICE_CENTS` has no default** — no verified per-seat price exists anywhere in the
  build-order doc or `pricing.ts` (those are per-formation Pro-tier prices, a different
  monetization axis) — the checkout endpoint errors instead of charging an invented figure until
  it's set.
- **Invitation/handoff flow** — `POST /api/firm/members/invite` (admin only) finds-or-creates the
  invitee's `users` row and inserts a pending `firm_members` row, emails them
  (`sendFirmInviteEmail`); accepted automatically on their next magic-link login
  (`acceptPendingFirmInvites` in `/api/auth/verify`), which also resyncs seat billing.

## Phase 5 — Intelligence & Scale

Per the build-order doc's own table, only the AI formation assistant was marked buildable now;
everything else needed either external-API research (same treatment as Phase 3/Northwest) or has
no spec yet.

- **AI formation assistant** — `POST /api/assistant`, grounded in the signed-in user's own
  `registrations` + `compliance_events` (`lib/assistant.ts` builds the system prompt from that
  data, `lib/queries/complianceEvents.ts` is the new query). Scoped to entity/state formation and
  compliance Q&A, explicitly out-of-scope for general legal/tax advice, carries the same
  non-attorney disclaimer as `components/marketing/DisclaimerBar.tsx`. Streams via
  `client.messages.stream()` (`claude-opus-4-8`) as plain text chunks to a chat panel at
  `/dashboard/assistant` (`components/dashboard/AssistantChat.tsx`) — there was no existing
  Support chat UI slot ported from the prototype in this build, so this is a new dashboard nav
  item rather than a reuse.
- **IRS e-filing (Form 2553, expanded 1023-EZ) — researched, not built.** Same diligence as
  Phase 3's state research: **neither form has a real e-filing API.** Form 2553 has no electronic
  filing option at all (mail or fax only). Form 1023-EZ is filed exclusively through Pay.gov (a
  payment/form portal, not an API). The IRS's Modernized e-File (MeF) program is a real API, but
  it's scoped to tax *returns* (1120, 990, 1040, etc.), not standalone elections or exemption
  applications — and access requires becoming an IRS-Authorized e-file Provider (Form 3112,
  suitability check, EFIN, transmitter testing — up to 45 days), a business/legal authorization
  process, not a public API key, mirroring Phase 3/Northwest exactly. The existing Phase 1
  Form 2553 guide builder and 1023-EZ Pay.gov pre-fill PDF are already the right shape for this
  reality — nothing further was built here.
- **Predictive compliance alerts, BOI/FinCEN reporting, Canada/UK formation, marketplace —
  intentionally not built.** Per the build-order doc these have no spec yet beyond the existing
  90/60/30-day reminders (predictive), need a scoping pass on what "assistance" means
  (BOI/FinCEN), or are explicitly exploratory with no schema (Canada/UK, marketplace). Building
  any of these now would mean guessing at requirements rather than following a spec.

## MVP funnel hardening (post-audit sprint)

Following a moat-validation audit that found the app "feature-complete but no-funnel" (no
Comply conversion path, no product analytics, formation-anniversary-approximated compliance
dates, and an unfinished B2B API), four independent systems were built:

- **Comply auto-conversion funnel** — three touchpoints where there were previously zero: a
  post-formation upsell interstitial on `/onboard/success` (`ComplyUpsellCard.tsx`), a CTA in the
  registration confirmation email (`lib/email.ts`) linking back to that same page, and a
  dashboard banner for signed-in founders without an active subscription
  (`ComplyNudgeBanner.tsx`). The success-page flow runs before the founder has ever logged in, so
  `POST /api/subscriptions/comply/checkout` now accepts a `registrationId` fallback (resolving the
  user via the registration) alongside its existing session-based path — same public-identifier
  trust model `/api/v1/status` already uses.
- **Product analytics (PostHog)** — `lib/analytics.ts` (no-ops without `NEXT_PUBLIC_POSTHOG_KEY`,
  consistent with how other optional integrations behave), initialized client-side from the root
  layout via `PostHogInit.tsx`. Instruments the funnel: `formation_started` (wizard mount) →
  `formation_completed` (success page) → `comply_upsell_shown` / `comply_upsell_clicked` →
  `comply_subscribed` (billing success redirect). Client-side only for now — a server-side
  (posthog-node) pass for events that can be missed by ad blockers is a natural follow-up, not
  done here.
- **Compliance rules engine** — `compliance_rules` table (`db/migrations/007_compliance_rules.sql`)
  + `lib/entities/complianceRulesTable.ts`, replacing the formation-anniversary approximation with
  verified per-state annual-report due dates for the 5 priority states (DE, CA, FL, NY, TX), each
  row cited to a source in the migration. Also corrects an inaccurate assumption from an earlier
  task spec that IRS Form 990-N was due January 31 — the actual rule (15th day of the 5th month
  after tax-year close) is now computed from the registration's real fiscal year, landing on
  May 15 for the calendar-year-default case. Every other state still uses the pre-existing
  anniversary approximation rather than a guessed fixed date — same posture as `state_fees`.
- **B2B API hardening** — `lib/rateLimit.ts` (in-memory sliding window, 100 req/min per firm by
  default, overridable via `API_RATE_LIMIT_PER_MINUTE`) wired into `requireApiKeyFirm()`, the one
  choke point all three `/api/v1/*` routes already share, rather than duplicated per-route or
  built as separate Next.js middleware (which defaults to the Edge runtime and wouldn't share
  in-process state with these Node.js route handlers). **Single-process only** — swap for a
  Redis-backed limiter before running multiple server instances, or the effective limit becomes
  "100 × instance count." `FIRM_SEAT_PRICE_CENTS` now defaults to $29.99/mo/seat
  (`lib/entities/pricing.ts`) instead of hard-erroring when unset — override via env once a real
  go-to-market number is decided. `docs/api/B2B_PARTNER_API.md` documents the actual endpoints,
  auth header (`Authorization: Bearer`, not `X-API-Key`), and response shapes as implemented —
  not the illustrative schema from the original task spec, which didn't match this codebase.
