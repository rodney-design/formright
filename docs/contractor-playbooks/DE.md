# Delaware — Contractor Playbook

Internal operating notes, not legal advice — see [README](./README.md).

## Where to file

**Delaware Division of Corporations**, 401 Federal Street Suite 4, Dover, DE
19901 — phone 302-739-3073, fax 302-739-3812. Delaware doesn't have a
statutory nonprofit corporation act; a nonprofit is formed under the same
General Corporation Law as a for-profit, as a **nonstock corporation** (8
Del. C. § 114) — the form is literally titled "Certificate of Incorporation,
A Non-Stock Corporation," not "Nonprofit Articles."

Submission is **online or by mail** — there's no self-serve web portal like
California's bizfile for the general public to fill in and e-file directly;
in practice most filers submit through a Delaware registered agent (see
below) rather than mailing paper themselves.

## Setup quirks

- **A Delaware registered agent with a physical Delaware address is
  mandatory** before anything can be filed — FormRight's own registered
  agent product (`lib/registered-agent/`) or a commercial one from the
  Division of Corporations' published list. Confirm the registered agent
  order (`registered_agent_orders`) is active (or being placed in parallel)
  before submitting the Articles — a filing without a valid Delaware agent
  on file will bounce.
- Delaware has **no state income tax filing** obligation tied to formation,
  but corporations (for-profit and nonprofit alike) DO owe the annual
  franchise tax report by March 1 each year (already tracked as this org's
  `annual_report` compliance event — see `db/migrations/007_compliance_rules.sql`).
- No charitable solicitation registration exists in Delaware — don't create
  or chase a `charitable_solicitation_renewal` event for a DE nonprofit;
  none will have been seeded (`not_required = true` in
  `db/migrations/016_charitable_solicitation_rules.sql`).

## Required attachments / fields

- Entity name (must include a valid corporate designator, e.g. "Corporation,"
  "Incorporated," "Fund," etc. — DE is fairly permissive on this vs. some
  states)
- Registered agent name + Delaware street address
- Nonstock/no-par-value declaration (this is what makes it a "nonstock"
  filing rather than the standard stock-corporation certificate)
- Incorporator name and address
- Purpose clause — the generic "any lawful purpose" language in FormRight's
  Articles template is sufficient; DE doesn't mandate specific nonprofit
  statutory phrasing the way California does

## Fees & turnaround

- **$89 filing fee + $9/page** for additional pages over the base form.
- Standard processing has historically run **up to ~3 weeks**; Delaware
  offers same-day and 24-hour expedited options for an extra fee if a job
  is time-sensitive — check current expedite pricing on the Division of
  Corporations site, it changes.

## Common rejection reasons

- **Registered agent not on file / lapsed** — the single most common holdup;
  confirm the RA order status before submitting, not after.
- **Name conflicts** with an existing Delaware entity — Delaware's name
  availability check is stricter about "confusingly similar" names than some
  states; search the Division of Corporations' entity name database before
  filing rather than after a bounce.
- **Missing the nonstock/no-par declaration** — submitting the standard
  stock-corporation certificate template instead of the nonstock one is an
  easy mixup since Delaware doesn't have a separate "nonprofit" form name to
  anchor on.
