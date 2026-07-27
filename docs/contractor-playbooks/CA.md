# California — Contractor Playbook

Internal operating notes, not legal advice — see [README](./README.md).

## Where to file

**California Secretary of State, bizfile Online** — `bizfileonline.sos.ca.gov`.
This is a real self-serve web portal (unlike Delaware/New York) — file
directly online rather than by mail for anything but the rare edge case.

California splits nonprofits into **3 statutory sub-types**, each with its
own form and its own mandatory Articles statement (see
`db/migrations/013_nonprofit_statutes.sql` and the onboarding sub-type
selector in `apps/web/components/onboarding/StepOrganization.tsx`):

- **Public Benefit** (`ARTS-PB-501(c)(3)`) — most 501(c)(3) charitable/
  educational/scientific orgs. This is the default for the vast majority of
  FormRight's CA nonprofit jobs.
- **Mutual Benefit** — business leagues, social clubs (typically
  501(c)(6)/(c)(7), not 501(c)(3)-eligible).
- **Religious** — its own statutory track, distinct from public benefit.

Confirm the job's `nonprofitSubtype` (visible on the worksheet / registration
notes) matches the form actually being filed — filing the wrong sub-type's
form is a real, avoidable rejection reason (see below).

## Setup quirks

- Search the entity name **before** filing — bizfile Online has a name
  availability search built in. California's name rules require a
  distinguishable name from every other entity on file, not just other
  nonprofits.
- **Within 90 days of the Articles being filed**, a **Statement of
  Information (Form SI-100)** must also be filed listing officers,
  directors, and the principal office address — this is a separate,
  additional filing, not part of the Articles submission itself. Flag it as
  a follow-up task; don't consider the CA job fully closed out until it's
  done.
- California requires the mandatory sub-type statement (§ 5130 / 7130 / 9130
  language, already baked into FormRight's generated Articles per
  `lib/doc-engine/builders/nonprofit.ts`) verbatim — don't paraphrase it when
  transcribing into bizfile.

## Required attachments / fields

- Entity name
- The statutory purpose statement for the selected sub-type (public
  benefit/mutual benefit/religious — see above)
- Registered agent (California calls this the "agent for service of
  process") name + California street address
- Principal office address

## Fees & turnaround

- **$30 filing fee** for Articles of Incorporation (public benefit), as of
  2026 — confirm current fee on bizfile before submitting, CA has changed
  this fee schedule before.
- **Online/in-person filings**: typically a few business days. **Mailed
  paper filings**: can run several weeks — a strong reason to prefer the
  online portal whenever possible.
- Expedited service available: **24-hour for $350**, **same-day for $750** —
  worth flagging to the admin team if a client's plan tier includes expedite
  and the deadline is tight.

## Common rejection reasons

- **Wrong sub-type form filed** — e.g. submitting the public benefit form
  for an org that should be mutual benefit, or vice versa. Cross-check
  against the worksheet's `nonprofitSubtype` before submitting.
- **Missing or incorrect mandatory purpose statement** — California checks
  for the exact required statutory language, not just "a" purpose
  statement.
- **Registered agent address is a P.O. box** — must be a physical California
  street address.
- **Statement of Information missed** — doesn't reject the Articles
  themselves, but leaves the entity out of compliance almost immediately
  after formation; make sure this follow-up task is tracked, not just the
  initial filing.
