# Florida — Contractor Playbook

Internal operating notes, not legal advice — see [README](./README.md).

## Where to file

**Florida Division of Corporations — Sunbiz** (`sunbiz.org`) — a real
self-serve online e-file portal, same posture as California's bizfile.
Filed under the **Florida Nonprofit Corporation Act**, Fla. Stat. ch. 617 —
note the Act was **renamed** from "Florida Not For Profit Corporation Act"
under a revision effective **July 1, 2026** that modernized the chapter to
align with the Florida Business Corporation Act and the ABA Model Nonprofit
Corporation Act. Use the current name; older secondary sources online will
still say the old one.

## Setup quirks

- Florida has **no state-mandated purpose-clause statement** the way
  California does — the generic 501(c)(3) exempt-purpose language in
  FormRight's template is sufficient for the state filing itself.
- **Charitable solicitation registration is separate from Articles filing**
  and runs on its own clock — the Solicitation of Contributions Act renewal
  (with FDACS, not the Division of Corporations) renews on the
  **anniversary of the org's own registration date**, not a fixed calendar
  date and not the formation date. FormRight's compliance calendar
  approximates this using the formation date (see
  `db/migrations/016_charitable_solicitation_rules.sql`) since the actual
  registration date isn't tracked separately — if the real charitable
  registration happens materially later than formation, flag it to the
  admin team so the compliance event date can be corrected.

## Required attachments / fields

- Entity name
- Principal office street address (and mailing address, if different)
- Registered agent name + Florida street address, with the registered
  agent's signature/acceptance
- Names of initial officers/directors (Florida requires at least one)

## Fees & turnaround

- Filed via Sunbiz's online e-file — online/electronic filings are
  generally the fastest path; confirm current fees on Sunbiz before
  submitting, as the ch. 617 revision effective July 1, 2026 may have
  changed the fee schedule alongside the other modernization changes.
- Sunbiz historically processes online filings quickly (often within a few
  business days); mailed paper filings take longer — prefer the portal.

## Common rejection reasons

- **Registered agent signature/acceptance missing** — Florida requires the
  registered agent to affirmatively accept the appointment as part of the
  filing, not just be named.
- **Name not distinguishable** from an existing Florida entity — check
  Sunbiz's name search before filing.
- **Missing officer/director information** — unlike some states, Florida
  wants at least the initial officer/director slate in the Articles
  themselves, not deferred entirely to the Bylaws/organizational minutes.
- Given the July 2026 ch. 617 revision, **watch for transitional filing
  requirements** on any job filed close to the effective date — check
  Sunbiz's current instructions rather than assuming last year's process
  still applies verbatim.
