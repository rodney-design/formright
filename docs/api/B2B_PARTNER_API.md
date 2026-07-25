# FormRight B2B Partner API (v1)

For law firms, CPA firms, and formation agencies managing multiple client
formations through FormRight. Every endpoint is scoped to your firm's own
clients only — you never see another firm's data, and you can't pass a
`firm_id` to override that.

## Authentication

Every request needs an `Authorization: Bearer` header carrying your firm's
API key (issued from **Firm Dashboard → API Keys**):

```
Authorization: Bearer <your-api-key>
```

A missing or revoked key returns `401`.

## Rate limiting

**100 requests per minute per API key**, sliding window. Exceeding it
returns `429` with a `Retry-After` header (seconds until you can retry):

```
HTTP/1.1 429 Too Many Requests
Retry-After: 42

{ "error": "Rate limit exceeded" }
```

## Endpoints

### `POST /api/v1/formations`

Submit a formation for a client.

**Request body:**

```json
{
  "orgname": "Acme LLC",
  "orgtype": "llc",
  "state": "CA",
  "fiscal": "December 31",
  "address": "123 Main St",
  "city": "San Francisco",
  "zip": "94103",
  "ein": "",
  "mission": "",
  "board": [
    { "name": "Jane Founder", "role": "Member", "email": "jane@acme.com" }
  ],
  "contactName": "Jane Founder",
  "contactEmail": "jane@acme.com"
}
```

`orgtype` accepts any of: `llc`, `c-corp` / `ccorp`, `s-corp` / `scorp`,
`nonprofit`, `benefit corp` / `benefit`, `professional corp` / `pc`, `sole
prop` / `sole` (normalized by `entityFamily()` — see
`lib/entities/entityFamily.ts`). `board` is optional and defaults to `[]`.

**Response — `201 Created`:**

```json
{ "registrationId": "FR-482913" }
```

Unlike the individual-consumer checkout flow, formations created here don't
run a Stripe Checkout session per formation — Pro-tier firms are billed
per-seat (see `POST /api/subscriptions/pro/checkout`), so the registration
is created directly with `status: "paid"`.

### `GET /api/v1/formations`

List every formation your firm has created.

**Response:**

```json
{ "formations": [ { "id": "FR-482913", "orgname": "Acme LLC", "status": "paid", "entity_type": "llc", "state": "CA", "created_at": "2026-01-15T10:30:00Z", "...": "full registration row" } ] }
```

### `GET /api/v1/status?registrationId=FR-482913`

Get the status of one formation, including its state filing status.

**Response:**

```json
{
  "registrationId": "FR-482913",
  "status": "paid",
  "stateFiling": {
    "status": "submitted",
    "stateConfirmationId": null,
    "submittedAt": "2026-01-16T14:22:00Z"
  }
}
```

`stateFiling` is `null` until a `state_filings` row exists for the
registration (created automatically on formation). `stateFiling.status` is
one of `not_submitted`, `submitted`, `processing`, `approved`, `rejected` —
see `lib/state-filing/status.ts`. There is no push/webhook for status
changes yet; poll this endpoint. `404` if the registration doesn't exist or
belongs to a different firm.

### `GET /api/v1/documents?registrationId=FR-482913`

Get generated documents for one client. Omit `registrationId` to get every
document across all of your firm's clients.

**Response:**

```json
{ "documents": [ { "docKey": "articles_of_organization", "filename": "Articles_of_Organization.docx", "url": "https://.../signed-url", "version": 1, "generatedAt": "2026-01-16T14:00:00Z" } ] }
```

`url` is a short-lived signed URL into FormRight's document vault (Supabase
Storage) — re-fetch this endpoint if a link expires rather than caching it
long-term.

## What's not yet built

- **No outbound webhooks.** Status changes must be polled via
  `GET /api/v1/status`; there's no push notification to your systems yet.
- **No document-format negotiation.** Documents are returned as generated
  (`.docx`/`.pdf` per document type) — no on-demand format conversion.
- **State filing is manual on FormRight's side.** `stateFiling.status`
  reflects FormRight staff's own progress filing with the state (or, where
  configured, a vendor filing partner) — not a live government API. Typical
  turnaround is the same as the consumer flow: 1-2 business days to submit,
  1-4 weeks for state confirmation.
