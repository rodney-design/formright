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
| `AWS_REGION`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY` | S3 access for the document vault (Phase 2). Credentials are optional if running on infra with an attached IAM role — the AWS SDK's default credential chain handles that case. |
| `S3_BUCKET` | Bucket generated documents are uploaded to |
| `CRON_SECRET` | Shared secret the compliance-reminder cron route checks against the `Authorization: Bearer` header Vercel Cron sends |

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

- **Document generation now stores to S3** instead of only streaming the generated file back.
  `GET /api/documents/registration/:registrationId?key=...` (or `?all=1` for the zip) generates,
  uploads to S3, writes a `documents` row, and redirects to a pre-signed URL. Each regeneration
  is a new `version` row rather than overwriting the previous one.
- **Document vault API** — `GET /api/documents/:userId` returns pre-signed URLs for a user's
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
- **Reminder cron** — `GET /api/cron/compliance-reminders`, scheduled daily via `vercel.json`,
  secret-protected via `CRON_SECRET`. Emails via SendGrid when an event is exactly 90, 60, or 30
  days from its due date, then marks `reminded_at`.
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
  stamped certificate (uploaded to S3) via the `StateFilingPanel` on the admin registration detail
  page (`PATCH /api/admin/state-filings/:id`) after filing through the state's portal directly.
  This is the "filing status webhook/polling" build-order doc step, done manually since no state
  offers a real one yet.
- Client dashboard's Filing Status page now shows the real `state_filings` status and a stamped
  certificate download link (pre-signed S3 URL) once approved, instead of only the coarse
  `registrations.status` timeline.
- **If a state opens a real filing API later**, or FormRight decides to build portal automation,
  swap the manual step in `lib/state-filing/` for a real submission client — the `state_filings`
  table and status flow underneath don't need to change.

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
