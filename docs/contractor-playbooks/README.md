# Contractor Playbooks

Internal operating notes for contractors filing nonprofit Articles of
Incorporation on FormRight's behalf — see the `/contractor` dashboard
(`apps/web/app/contractor/`) for the actual job queue, worksheet, checklist,
and status-update flow these playbooks support.

**This is not legal advice**, and it is not a substitute for verifying
current requirements directly against the state's own site before filing —
fees, forms, and processing times change without much notice. Every fact
below was checked against the state's own Secretary of State / Department of
State site (or an authoritative secondary source where the primary source
wasn't scrapable) as of **2026-07-27**; re-verify anything that looks stale.

## Coverage

Only the 5 states FormRight prioritizes elsewhere in the codebase (see
`db/migrations/007_compliance_rules.sql` and
`db/migrations/013_nonprofit_statutes.sql`) have a playbook so far:

- [Delaware](./DE.md)
- [California](./CA.md)
- [Florida](./FL.md)
- [New York](./NY.md)
- [Texas](./TX.md)

No other state has a playbook yet — don't extrapolate one state's process
onto another; each Secretary of State's office runs its own portal, forms,
and fee schedule.

## How to use one

Each playbook has the same shape: where to file, what the FormRight
worksheet needs to become a submission, how long it actually takes, and the
rejection reasons that show up repeatedly in practice. Pair it with the
worksheet FormRight generates for the job (`buildFilingWorksheet()`,
`apps/web/lib/state-filing/worksheet.ts`) and the checklist seeded on the
`/contractor/state-filings/[id]` page — the playbook is state-specific
context, the checklist is the actual step-by-step to follow and check off.
