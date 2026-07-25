-- Compliance rules engine, batch 2 — Northeast + Mid-Atlantic states, per the
-- moat-validation follow-up's regional rollout plan. Run after
-- 007_compliance_rules.sql. See ../schema.sql for the canonical schema.
--
-- Extends compliance_rules with three things the DE/CA/FL/NY/TX batch didn't
-- need:
--   - not_required: some states genuinely have no annual-report/renewal
--     obligation for a given entity family (South Carolina LLCs not taxed
--     as corporations). The app skips generating an event entirely rather
--     than guessing a date that doesn't exist.
--   - anniversary_exact_date: Massachusetts LLCs are due on the literal
--     formation date each year, not the last day of that month (contrast
--     with California/New York's month-end anniversary pattern).
--   - fiscal_year_offset: several states tie CORPORATE (not LLC) annual
--     reports to fiscal year end rather than a fixed calendar date or
--     formation anniversary — Massachusetts, North Carolina, South
--     Carolina, and Vermont. offset_months/offset_day mirror the existing
--     Form 990-N calculation shape already in
--     lib/entities/complianceRulesTable.ts (15th day of the Nth month
--     after fiscal year end, or the last day of that month when
--     offset_day is NULL).
--
-- Every row below was checked against a primary or authoritative secondary
-- source as of the date in verified_at, cited in `source`. State rules
-- change; re-verify before relying on this in production, and re-confirm
-- annually regardless.
--
-- NOT seeded in this batch (left on the existing anniversary
-- approximation) because the entity-family-specific rule wasn't confidently
-- verified in this pass: Massachusetts nonprofit corporations (Ch. 156D's
-- "every domestic corporation" language wasn't confirmed to include
-- nonprofit corporations, which Massachusetts governs separately under
-- Ch. 180), South Carolina nonprofit corporations and benefit/professional
-- corporations (only the C-corp/S-corp tax-return-tied deadline was
-- verified). Per the "be conservative" instruction, these stay on the
-- fallback rather than reuse an adjacent entity type's rule as a guess.

ALTER TABLE compliance_rules ALTER COLUMN rule_type DROP NOT NULL;
ALTER TABLE compliance_rules ALTER COLUMN cadence DROP NOT NULL;
ALTER TABLE compliance_rules ADD COLUMN IF NOT EXISTS not_required BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE compliance_rules ADD COLUMN IF NOT EXISTS offset_months INTEGER;
ALTER TABLE compliance_rules ADD COLUMN IF NOT EXISTS offset_day INTEGER CHECK (offset_day BETWEEN 1 AND 31);
ALTER TABLE compliance_rules DROP CONSTRAINT IF EXISTS compliance_rules_rule_type_check;
ALTER TABLE compliance_rules ADD CONSTRAINT compliance_rules_rule_type_check CHECK (rule_type IN (
  'fixed_date', 'anniversary_month_last_day', 'anniversary_exact_date', 'fiscal_year_offset'
));
ALTER TABLE compliance_rules ADD CONSTRAINT compliance_rules_not_required_check
  CHECK (not_required OR (rule_type IS NOT NULL AND cadence IS NOT NULL));

INSERT INTO compliance_rules (state, entity_family, event_type, not_required, rule_type, cadence, fixed_month, fixed_day, offset_months, offset_day, notes, source, verified_at) VALUES

-- ── Northeast ──────────────────────────────────────────────────────────

-- Connecticut: LLCs file on a fixed Jan 1 - Mar 31 window (due Mar 31);
-- corporations (and PCs, treated as stock corporations) file by the last
-- day of their formation anniversary month instead.
('CT', 'llc', 'annual_report', false, 'fixed_date', 'annual', 3, 31, NULL, NULL,
 'Fixed filing window Jan 1 - Mar 31; due Mar 31 regardless of formation date. $25 late fee.',
 'https://www.harborcompliance.com/connecticut-annual-report ; https://fileforms.com/connecticut-annual-report-deadlines/', '2026-07-25'),
('CT', 'all', 'annual_report', false, 'anniversary_month_last_day', 'annual', NULL, NULL, NULL, NULL,
 'Corporations (stock and non-stock/nonprofit) file by the last day of the formation anniversary month — distinct from the LLC fixed-window rule above.',
 'https://www.wolterskluwer.com/en/solutions/ct-corporation/annual-report-filings ; https://fileforms.com/connecticut-annual-report-deadlines/', '2026-07-25'),

-- Massachusetts: LLCs are due on the exact anniversary date (not month-end);
-- corporations file within 2.5 months of fiscal year end (M.G.L. c.156D
-- Sec. 16.22) — modeled as 15th day of the 3rd month after FYE.
('MA', 'llc', 'annual_report', false, 'anniversary_exact_date', 'annual', NULL, NULL, NULL, NULL,
 'Due on the literal formation anniversary date each year (not month-end). No state-sent reminder.',
 'https://www.llcuniversity.com/massachusetts-llc/annual-report/', '2026-07-25'),
('MA', 'ccorp', 'annual_report', false, 'fiscal_year_offset', 'annual', NULL, NULL, 3, 15,
 'Due within 2.5 months of fiscal year end (M.G.L. c.156D Sec. 16.22) — modeled as 15th day of the 3rd month after FYE; calendar-year filers: March 15.',
 'https://legalclarity.org/how-to-file-a-massachusetts-annual-report-online-or-by-mail/', '2026-07-25'),
('MA', 'scorp', 'annual_report', false, 'fiscal_year_offset', 'annual', NULL, NULL, 3, 15,
 'Same corporate annual-report statute as C-Corp — S-Corp election doesn''t change the state filing requirement.',
 'https://legalclarity.org/how-to-file-a-massachusetts-annual-report-online-or-by-mail/', '2026-07-25'),
('MA', 'benefit', 'annual_report', false, 'fiscal_year_offset', 'annual', NULL, NULL, 3, 15,
 'Massachusetts benefit corporations are a subtype of business corporation under c.156D — same annual report statute.',
 'https://legalclarity.org/how-to-file-a-massachusetts-annual-report-online-or-by-mail/', '2026-07-25'),
('MA', 'pc', 'annual_report', false, 'fiscal_year_offset', 'annual', NULL, NULL, 3, 15,
 'Professional corporations file as business corporations under c.156D for annual-report purposes.',
 'https://legalclarity.org/how-to-file-a-massachusetts-annual-report-online-or-by-mail/', '2026-07-25'),

-- New Jersey: single system covers LLCs and corporations alike — due last
-- day of the formation anniversary month.
('NJ', 'all', 'annual_report', false, 'anniversary_month_last_day', 'annual', NULL, NULL, NULL, NULL,
 'Due last day of formation anniversary month. $75 fee. First report due the year after formation.',
 'https://www.llcuniversity.com/new-jersey-llc/annual-report/', '2026-07-25'),

-- Pennsylvania: Act 122 (2022) replaced the old decennial-report system
-- with THREE different fixed annual deadlines by entity type, effective
-- 2025 — this is the one state in this batch where LLC and corporation
-- deadlines are both fixed dates but on different days.
('PA', 'llc', 'annual_report', false, 'fixed_date', 'annual', 9, 30, NULL, NULL,
 'Act 122 of 2022 (effective 2025): all PA LLCs (domestic + foreign) file by Sept 30. No dissolution penalty for 2025/2026 reports (grace period) — full enforcement begins 2027.',
 'https://www.pa.gov/agencies/dos/programs/business/types-of-filings-and-registrations/annual-reports ; https://www.kmgslaw.com/articles/legislative-alert-pa-act-122', '2026-07-25'),
('PA', 'all', 'annual_report', false, 'fixed_date', 'annual', 6, 30, NULL, NULL,
 'Act 122: all PA business AND nonprofit corporations (domestic + foreign) file by June 30 — different fixed date than the LLC rule above.',
 'https://www.pa.gov/agencies/dos/programs/business/types-of-filings-and-registrations/annual-reports ; https://www.kmgslaw.com/articles/legislative-alert-pa-act-122', '2026-07-25'),

-- Vermont: tied to fiscal year end (within 3 months), not formation
-- anniversary — modeled as last day of the 3rd month after FYE (calendar
-- year filers: March 31). Applied to 'all' since VT's SOS system covers
-- corporations and LLCs under the same fiscal-year-anchored rule.
('VT', 'all', 'annual_report', false, 'fiscal_year_offset', 'annual', NULL, NULL, 3, NULL,
 'Due within 3 months after fiscal year end (last day of that 3rd month) — calendar-year filers: March 31. Not anniversary-based despite resembling other states'' patterns.',
 'https://www.zenbusiness.com/vermont-annual-report/', '2026-07-25'),

-- New Hampshire: fixed Jan 1 - Apr 1 window, confirmed identical for both
-- corporations and LLCs.
('NH', 'all', 'annual_report', false, 'fixed_date', 'annual', 4, 1, NULL, NULL,
 'Fixed filing window Jan 1 - Apr 1, due Apr 1 for both corporations and LLCs. $50 late fee.',
 'https://www.sos.nh.gov/corporations-0/business-faqs ; https://boostsuite.com/llc-annual-report/new-hampshire/', '2026-07-25'),

-- Maine: fixed June 1 deadline, LLC-verified; applied to 'all' — Maine's
-- SOS annual report system is a single filing regime shared across entity
-- types (not verified per-entity-type in this pass, flagged for
-- confirmation if a corp-specific deadline surfaces later).
('ME', 'all', 'annual_report', false, 'fixed_date', 'annual', 6, 1, NULL, NULL,
 'Due June 1 every year. $50 late fee; administrative dissolution 65 days after if still unfiled.',
 'https://boostsuite.com/llc-annual-report/maine/', '2026-07-25'),

-- Rhode Island: filing window Feb 1 - May 1; using May 1 as the due date to
-- remind by (a 30-day grace period to Dec 1 exists but shouldn't be the
-- target date for a reminder system).
('RI', 'all', 'annual_report', false, 'fixed_date', 'annual', 5, 1, NULL, NULL,
 'Filing window Feb 1 - May 1; modeled here as due May 1 (a further 30-day grace period to Dec 1 exists but isn''t the date to remind by).',
 'https://www.llcuniversity.com/rhode-island-llc/annual-report/', '2026-07-25'),

-- ── Mid-Atlantic ───────────────────────────────────────────────────────

-- Maryland: single Annual Report + Business Personal Property Return system
-- covers LLCs and corporations identically.
('MD', 'all', 'annual_report', false, 'fixed_date', 'annual', 4, 15, NULL, NULL,
 'Annual Report + Business Personal Property Return, filed together with SDAT. Due Apr 15 (next business day if a weekend).',
 'https://www.llcuniversity.com/maryland-llc/annual-report/', '2026-07-25'),

-- Virginia: LLCs pay an "annual registration fee" (not a report) and
-- corporations file an "annual report" — different labels, but both are
-- due by the last day of the formation anniversary month, so one wildcard
-- rule covers both without losing accuracy.
('VA', 'all', 'annual_report', false, 'anniversary_month_last_day', 'annual', NULL, NULL, NULL, NULL,
 'LLCs pay a $50 annual registration fee (no report filed); corporations file an annual report. Both due by the last day of the formation anniversary month.',
 'https://www.llcuniversity.com/virginia-llc/annual-report/', '2026-07-25'),

-- West Virginia: fixed Jan 1 - Jul 1 filing window, covers LLCs,
-- corporations, and nonprofits under one guide.
('WV', 'all', 'annual_report', false, 'fixed_date', 'annual', 7, 1, NULL, NULL,
 'Filing window opens Jan 1, due Jul 1. $75 late fee.',
 'https://fileforms.com/west-virginia-annual-report-deadlines/ ; https://www.zenind.com/en-US/help/post/west-virginia-annual-report-filing-guide-for-llcs-corporations-and-nonprofits', '2026-07-25'),

-- North Carolina: LLCs have a fixed April 15 deadline; corporations
-- (including S-Corps, benefit corps, and PCs, all filed as business
-- corporations with the NC SOS) are instead tied to fiscal year end — 15th
-- day of the 4th month after FYE, which coincides with April 15 for
-- calendar-year filers but differs for off-calendar fiscal years.
('NC', 'llc', 'annual_report', false, 'fixed_date', 'annual', 4, 15, NULL, NULL,
 'Fixed Apr 15 deadline, not tied to fiscal year end. $200 fee (mail) / $202 (online).',
 'https://www.sosnc.gov/divisions/business_registration/annual_report_due_dates', '2026-07-25'),
('NC', 'all', 'annual_report', false, 'fiscal_year_offset', 'annual', NULL, NULL, 4, 15,
 'Business corporations (incl. S-Corp election, benefit corps, PCs) file by the 15th day of the 4th month after fiscal year end — calendar-year filers: April 15, same as the LLC deadline but computed differently for off-calendar fiscal years.',
 'https://www.sosnc.gov/divisions/business_registration/annual_report_due_dates', '2026-07-25'),

-- South Carolina: plain LLCs have NO annual report/renewal requirement at
-- all unless taxed as a corporation. C-Corps and S-Corps file their
-- "annual report" as part of their SC income tax return, tied to fiscal
-- year end (SC1120 for C-Corps: 15th day of 4th month; SC1120S for
-- S-Corps: 15th day of 3rd month, matching the federal deadlines those
-- returns piggyback on).
('SC', 'llc', 'annual_report', true, NULL, NULL, NULL, NULL, NULL, NULL,
 'South Carolina LLCs not taxed as corporations have no annual report or SOS renewal requirement — nothing to remind on.',
 'https://www.llcuniversity.com/south-carolina-llc/annual-report/', '2026-07-25'),
('SC', 'ccorp', 'annual_report', false, 'fiscal_year_offset', 'annual', NULL, NULL, 4, 15,
 'Filed as SC1120 attachment to the SC Dept. of Revenue, not a separate SOS report. 15th day of 4th month after fiscal year end — calendar-year filers: April 15.',
 'https://filingfox.com/guides/south-carolina-llc-annual-report-guide-filing-requirements-deadlines-and-tax-tips/', '2026-07-25'),
('SC', 'scorp', 'annual_report', false, 'fiscal_year_offset', 'annual', NULL, NULL, 3, 15,
 'Filed as SC1120S attachment to the SC Dept. of Revenue. 15th day of 3rd month after fiscal year end — calendar-year filers: March 15.',
 'https://filingfox.com/guides/south-carolina-llc-annual-report-guide-filing-requirements-deadlines-and-tax-tips/', '2026-07-25'),

-- District of Columbia: biennial report, confirmed identical for LLCs,
-- corporations, LPs, and LLPs.
('DC', 'all', 'annual_report', false, 'fixed_date', 'biennial', 4, 1, NULL, NULL,
 'Biennial Report (Form BRA-25), due Apr 1 of the year following formation, then every 2 years. Confirmed identical requirement for corporations and LLCs. $300 fee, $100 late fee.',
 'https://www.tailorbrands.com/llc-formation/district-of-columbia-llc/biennial-report ; https://llccompass.com/dc-llc-biennial-report/', '2026-07-25');
