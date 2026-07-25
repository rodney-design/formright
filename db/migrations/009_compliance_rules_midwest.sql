-- Compliance rules engine, batch 3 — Midwest states, per the moat-validation
-- follow-up's regional rollout plan. Run after
-- 008_compliance_rules_northeast_midatlantic.sql. See ../schema.sql for the
-- canonical schema.
--
-- `state` values are the FULL state name, matching registrations.state /
-- STATE_FEES (see 007_compliance_rules.sql's header for why).
--
-- Extends compliance_rules with two rule types this batch introduced, plus
-- year_parity for fixed-date rules anchored to the calendar rather than the
-- formation date:
--   - anniversary_month_first_day: due on the 1st of the formation
--     anniversary month, not the last day (Illinois — "must file before the
--     first day of the anniversary month").
--   - anniversary_quarter_end: due on the last day of the calendar quarter
--     containing the formation month (Wisconsin's quarterly filing system).
--   - year_parity ('odd'/'even'): a fixed_date rule whose year is pinned to
--     calendar-year parity rather than "N years after formation" (Iowa:
--     always April 1 of an odd year, regardless of when the entity formed).
--
-- Every row below was checked against a primary or authoritative secondary
-- source as of the date in verified_at, cited in `source`. State rules
-- change; re-verify before relying on this in production, and re-confirm
-- annually regardless.
--
-- NOT seeded in this batch: Wisconsin's foreign-entity exception (foreign
-- registrants always file Q1/Mar 31 regardless of actual registration
-- quarter) — out of scope per the "domestic formation + annual renewal
-- only" MVP guidance; a foreign WI registrant will get the domestic
-- quarter-based date instead, which is a known simplification, not a bug.

ALTER TABLE compliance_rules ADD COLUMN IF NOT EXISTS year_parity TEXT CHECK (year_parity IN ('odd', 'even'));
ALTER TABLE compliance_rules DROP CONSTRAINT IF EXISTS compliance_rules_rule_type_check;
ALTER TABLE compliance_rules ADD CONSTRAINT compliance_rules_rule_type_check CHECK (rule_type IN (
  'fixed_date', 'anniversary_month_last_day', 'anniversary_month_first_day',
  'anniversary_quarter_end', 'anniversary_exact_date', 'fiscal_year_offset'
));

INSERT INTO compliance_rules (state, entity_family, event_type, not_required, rule_type, cadence, fixed_month, fixed_day, offset_months, offset_day, year_parity, notes, source, verified_at) VALUES

-- Ohio: no annual/biennial report requirement at all, for LLCs or
-- corporations — confirmed the state simply doesn't have one (unlike most
-- states, this isn't a per-entity-family carve-out, it's state-wide).
('Ohio', 'all', 'annual_report', true, NULL, NULL, NULL, NULL, NULL, NULL, NULL,
 'Ohio does not require LLCs or corporations to file a biennial report or Statement of Continued Existence — no SOS annual-report obligation exists for any entity family.',
 'https://www.harborcompliance.com/ohio-annual-report ; https://www.zenbusiness.com/ohio-annual-report/', '2026-07-25'),

-- Indiana: biennial, last day of the formation anniversary month, same
-- system for LLCs and corporations.
('Indiana', 'all', 'annual_report', false, 'anniversary_month_last_day', 'biennial', NULL, NULL, NULL, NULL, NULL,
 'Business Entity Report due every 2 years by the last day of the formation anniversary month (e.g. formed March 2023 -> due March 2025 -> March 2027). Same system for LLCs and corporations.',
 'https://www.llcuniversity.com/indiana-llc/business-entity-report/', '2026-07-25'),

-- Illinois: due BEFORE the first day of the anniversary month (i.e. the
-- deadline is that first day), not month-end like most anniversary states.
('Illinois', 'all', 'annual_report', false, 'anniversary_month_first_day', 'annual', NULL, NULL, NULL, NULL, NULL,
 'Annual report due before the first day of the formation anniversary month (e.g. formed Sept 16 -> must file before Sept 1 of each following year). Same system for LLCs and corporations.',
 'https://www.llcuniversity.com/illinois-llc/annual-report/', '2026-07-25'),

-- Michigan: LLCs and corporations have DIFFERENT fixed annual dates —
-- LLC Annual Statement due Feb 15; corporation Annual Report due May 15.
('Michigan', 'llc', 'annual_report', false, 'fixed_date', 'annual', 2, 15, NULL, NULL, NULL,
 'LLC Annual Statement due Feb 15 every year via LARA (skipped the year of formation if formed after Sept 30).',
 'https://www.michigan.gov/lara/bureau-list/cscl/corps/business-entities/annual-reports ; https://www.llcuniversity.com/michigan-llc/annual-statement/', '2026-07-25'),
('Michigan', 'all', 'annual_report', false, 'fixed_date', 'annual', 5, 15, NULL, NULL, NULL,
 'Corporation Annual Report (Form CSCL/CD-2500, both domestic and foreign) due no later than May 15 every year — a different fixed date than the LLC rule above.',
 'https://www.michigan.gov/lara/bureau-list/cscl/corps/business-entities/annual-reports', '2026-07-25'),

-- Wisconsin: quarterly filing system keyed to the formation month's
-- calendar quarter (Q1 Jan-Mar -> Mar 31, Q2 Apr-Jun -> Jun 30, Q3 Jul-Sep
-- -> Sep 30, Q4 Oct-Dec -> Dec 31), same for LLCs and corporations.
('Wisconsin', 'all', 'annual_report', false, 'anniversary_quarter_end', 'annual', NULL, NULL, NULL, NULL, NULL,
 'Annual report due at the end of the calendar quarter containing the formation month (e.g. formed May -> due June 30). Same system for LLCs and corporations. Foreign entities always file by Mar 31 (Q1) regardless of registration date — that exception is not modeled here (domestic-formation MVP scope).',
 'https://www.llcuniversity.com/wisconsin-llc/annual-report/', '2026-07-25'),

-- Minnesota: fixed Dec 31 deadline, explicitly confirmed identical across
-- every domestic entity type the SOS covers.
('Minnesota', 'all', 'annual_report', false, 'fixed_date', 'annual', 12, 31, NULL, NULL, NULL,
 'Annual Renewal due Dec 31 every year. Confirmed identical for domestic non-profits, corporations, LLCs, LLPs, PLLCs, LPs, and PCs. Free to file; administrative dissolution if missed.',
 'https://www.sos.state.mn.us/business-liens/business-registration-services/annual-renewals/', '2026-07-25'),

-- Iowa: fixed biennial calendar anchored to odd calendar years, not to
-- formation-date offset — every entity files April 1 of every odd year
-- regardless of when it formed.
('Iowa', 'all', 'annual_report', false, 'fixed_date', 'biennial', 4, 1, NULL, NULL, 'odd',
 'Biennial report due between Jan 1 and Apr 1 of every odd-numbered calendar year, regardless of formation year. Modeled here as due Apr 1 of the next odd year. Same system for LLCs and corporations.',
 'https://www.llcuniversity.com/iowa-llc/biennial-report/', '2026-07-25'),

-- Missouri: plain LLCs and LPs have NO annual report requirement; for-profit
-- and nonprofit corporations DO, due by the last day of the formation
-- anniversary month. The explicit 'llc' not_required row wins over the
-- 'all' wildcard for LLCs (exact-family-match-first lookup), same pattern
-- as South Carolina in migration 008.
('Missouri', 'llc', 'annual_report', true, NULL, NULL, NULL, NULL, NULL, NULL, NULL,
 'Missouri LLCs and LPs have no annual report filing requirement with the Secretary of State — nothing to remind on.',
 'https://www.llcuniversity.com/missouri-llc/annual-report/', '2026-07-25'),
('Missouri', 'all', 'annual_report', false, 'anniversary_month_last_day', 'annual', NULL, NULL, NULL, NULL, NULL,
 'For-profit and nonprofit corporations file an Annual Report by the last day of the formation anniversary month. Does not apply to LLCs/LPs (see the explicit not_required row above, which wins for entity_family = llc).',
 'https://www.sos.mo.gov/business/corporations/annualreports', '2026-07-25');
