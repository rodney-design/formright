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

- `subscriptions` and `compliance_events` tables (the "Comply" annual-compliance system) are
  Phase 2, per the build-order doc, and are not implemented here.
- `STATE_FEES` is the ported flat rate table; a normalized `state_fees` table keyed by
  state + entity type is a Should-Have for a later pass, not a Phase 1 blocker.
- Additional onboarding-wizard fields that don't have dedicated columns in the Phase 1 schema
  (program description, governance preferences, IRS screening answers, registered-agent info)
  are preserved as JSON in `registrations.notes` rather than dropped.
