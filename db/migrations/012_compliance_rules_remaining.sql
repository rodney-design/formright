-- Compliance rules engine, batch 6 (FINAL) — the six states the original
-- regional rollout plan (see 007-011's headers) never actually assigned to
-- any batch: Alaska, Hawaii, Kansas, Nebraska, North Dakota, South Dakota.
-- Discovered by cross-checking migration 011 against the full 50-state
-- list rather than trusting the plan's region groupings. Run after
-- 011_compliance_rules_southwest_mountainwest.sql. With this batch, every
-- state in the plan's original scope plus these six has been researched —
-- see 007/008/009/010/011 for the rest. See ../schema.sql for the
-- canonical schema. No new rule types needed.
--
-- `state` values are the FULL state name, matching registrations.state /
-- STATE_FEES.
--
-- NOT seeded in this batch, per the "be conservative" instruction:
--   - Nebraska 'pc': this app's entityFamily() (lib/entities/entityFamily.ts)
--     collapses "professional corporation" AND "PLLC" into a single 'pc'
--     family, but Nebraska's statute puts them on DIFFERENT schedules —
--     Professional Corporations follow the business-corporation schedule
--     (even years, Mar 1) while PLLCs follow the LLC schedule (odd years,
--     Apr 1). Since this app can't distinguish which one a given 'pc'
--     registration actually is, seeding either date would be a coin flip
--     that's wrong half the time. Left unseeded — falls back to the
--     anniversary approximation. (This is a pre-existing entity_family
--     modeling gap, not something introduced by this migration.)
--   - North Dakota nonprofit: sources conflict — the ND Secretary of
--     State's own nonprofit-services page states Feb 1, while a
--     compliance-service secondary source states Aug 1 (grouped with
--     for-profit corporations). Given the direct conflict with an
--     official primary source, left unseeded rather than picking one.

INSERT INTO compliance_rules (state, entity_family, event_type, not_required, rule_type, cadence, fixed_month, fixed_day, offset_months, offset_day, year_parity, notes, source, verified_at) VALUES

-- Alaska: biennial reports due Jan 2, filing year matching the parity of
-- the formation year (an even-formed entity files every even year, etc.) —
-- this falls out of plain fixed_date + biennial without needing
-- year_parity, since rolling forward by exactly 2 years naturally
-- preserves the formation year's parity. Nonprofits are on a SEPARATE
-- Jul 2 deadline, different enough to need its own row rather than being
-- swept into the 'all' wildcard.
('Alaska', 'all', 'annual_report', false, 'fixed_date', 'biennial', 1, 2, NULL, NULL, NULL,
 'Biennial Report due Jan 2, every other year — the filing year matches the parity of the formation year (formed in an even year -> files every even year; odd -> every odd year). Confirmed identical for for-profit corporations, professional corporations, LLCs, and LLPs. $100 fee ($137.50 after Feb 2).',
 'https://www.commerce.alaska.gov/web/cbpl/corporations/biennialreports.aspx ; https://www.zenbusiness.com/alaska-biennial-report/', '2026-07-25'),
('Alaska', 'nonprofit', 'annual_report', false, 'fixed_date', 'biennial', 7, 2, NULL, NULL, NULL,
 'Nonprofit, religious, and co-operative organizations file biennially by Jul 2 (not Jan 2 like for-profit entities) — same odd/even year-of-formation parity logic, different month.',
 'https://www.commerce.alaska.gov/web/cbpl/Corporations/BiennialReportsFAQs.aspx ; https://labyrinthinc.com/nonprofit-annual-filing-requirements-alaska/', '2026-07-25'),

-- Hawaii: due at the end of the calendar quarter containing the formation
-- anniversary date — same anniversary_quarter_end pattern already
-- supported for Wisconsin. Confirmed for "all entities."
('Hawaii', 'all', 'annual_report', false, 'anniversary_quarter_end', 'annual', NULL, NULL, NULL, NULL, NULL,
 'Annual Report due by the last day of the calendar quarter containing the formation/registration anniversary date (e.g. formed in Q2 (Apr-Jun) -> due Jun 30). Confirmed for all entity types. $15 fee ($12.50 online).',
 'https://boostsuite.com/llc-annual-report/hawaii/ ; https://www.getpalm.com/hawaii/file-annual-report', '2026-07-25'),

-- Kansas: tied to the entity's tax/fiscal year end, 15th day of the 4th
-- month after — same formula for LLCs and for-profit corporations, but
-- DIFFERENT cadence (LLCs moved to biennial in 2024; corporations remain
-- annual). Nonprofits are on a separate, later schedule (15th day of the
-- 6th month after FYE).
('Kansas', 'llc', 'annual_report', false, 'fiscal_year_offset', 'biennial', NULL, NULL, 4, 15, NULL,
 'Kansas LLCs transitioned from annual to BIENNIAL information reports in 2024. Due the 15th day of the 4th month after the tax closing month — calendar-year filers: April 15. $100 fee online.',
 'https://llcbuddy.org/kansas-llc/kansas-llc-annual-report/ ; https://sos.ks.gov/businesses/information-reports.html', '2026-07-25'),
('Kansas', 'ccorp', 'annual_report', false, 'fiscal_year_offset', 'annual', NULL, NULL, 4, 15, NULL,
 'For-profit corporations remain on ANNUAL reporting (unlike the now-biennial LLC schedule), same 15th-day-of-4th-month-after-tax-closing formula — calendar-year filers: April 15.',
 'https://sos.ks.gov/business/faq-business-entity.html', '2026-07-25'),
('Kansas', 'scorp', 'annual_report', false, 'fiscal_year_offset', 'annual', NULL, NULL, 4, 15, NULL,
 'Same annual corporate schedule as C-Corp — S-Corp election doesn''t change the state filing requirement.',
 'https://sos.ks.gov/business/faq-business-entity.html', '2026-07-25'),
('Kansas', 'benefit', 'annual_report', false, 'fiscal_year_offset', 'annual', NULL, NULL, 4, 15, NULL,
 'Kansas benefit corporations file as business corporations for annual-report purposes — same annual schedule.',
 'https://sos.ks.gov/business/faq-business-entity.html', '2026-07-25'),
('Kansas', 'nonprofit', 'annual_report', false, 'fiscal_year_offset', 'annual', NULL, NULL, 6, 15, NULL,
 'Nonprofit corporations file annually, due the 15th day of the 6th month after fiscal year end (calendar-year filers: June 15) — a later, separate deadline from the LLC/corporation schedule above. $40 flat fee.',
 'https://www.kssos.org/forms/business_services/np.pdf', '2026-07-25'),
-- Kansas 'pc': not seeded — professional corporations weren't
-- distinctly confirmed in this pass; falls back to the approximation
-- rather than assuming the plain corporation schedule applies.

-- Nebraska: LLCs and nonprofits share ONE biennial schedule (odd years,
-- Apr 1); business corporations are on a DIFFERENT biennial schedule (even
-- years, Mar 1) that also carries an occupation tax nonprofits are exempt
-- from. See the batch header for why 'pc' is intentionally unseeded.
('Nebraska', 'llc', 'annual_report', false, 'fixed_date', 'biennial', 4, 1, NULL, NULL, 'odd',
 'Biennial report due Apr 1 of every ODD-numbered year, regardless of formation year (delinquent Jun 16). Applies to LLCs and PLLCs.',
 'https://sos.nebraska.gov/business-services/annualbiennial-reporting ; https://www.llcuniversity.com/nebraska-llc/biennial-report/', '2026-07-25'),
('Nebraska', 'nonprofit', 'annual_report', false, 'fixed_date', 'biennial', 4, 1, NULL, NULL, 'odd',
 'Nonprofit corporations share the LLC schedule (odd years, Apr 1, delinquent Jun 16) rather than the business-corporation schedule below. Exempt from the occupation tax that for-profit corporations pay with their filing. $25 fee.',
 'https://sos.nebraska.gov/business-services/annualbiennial-reporting', '2026-07-25'),
('Nebraska', 'ccorp', 'annual_report', false, 'fixed_date', 'biennial', 3, 1, NULL, NULL, 'even',
 'Biennial occupation tax report due Mar 1 of every EVEN-numbered year, regardless of formation year (delinquent Apr 15).',
 'https://sos.nebraska.gov/business-services/annualbiennial-reporting', '2026-07-25'),
('Nebraska', 'scorp', 'annual_report', false, 'fixed_date', 'biennial', 3, 1, NULL, NULL, 'even',
 'Same even-year Mar 1 business-corporation schedule as C-Corp — S-Corp election doesn''t change the state filing requirement.',
 'https://sos.nebraska.gov/business-services/annualbiennial-reporting', '2026-07-25'),
('Nebraska', 'benefit', 'annual_report', false, 'fixed_date', 'biennial', 3, 1, NULL, NULL, 'even',
 'Nebraska benefit corporations file as business corporations — same even-year Mar 1 schedule.',
 'https://sos.nebraska.gov/business-services/annualbiennial-reporting', '2026-07-25'),
-- Nebraska 'pc': not seeded — see batch header (PC vs PLLC ambiguity).

-- North Dakota: LLCs and for-profit corporations are on different fixed
-- annual dates. Nonprofit intentionally NOT seeded — see batch header for
-- the source conflict.
('North Dakota', 'llc', 'annual_report', false, 'fixed_date', 'annual', 11, 15, NULL, NULL, NULL,
 'Annual Report due Nov 15 every year. $50 fee if filed by the deadline; $100 late fee after.',
 'https://boostsuite.com/llc-annual-report/north-dakota/ ; https://www.proofofgoodstanding.com/learn/nd-llc-annual-report-requirements-and-deadlines-2026', '2026-07-25'),
('North Dakota', 'ccorp', 'annual_report', false, 'fixed_date', 'annual', 8, 1, NULL, NULL, NULL,
 'Domestic corporations file their Annual Report by Aug 1 every year — a different fixed date than the LLC rule above. $25 fee.',
 'https://boostsuite.com/llc-annual-report/north-dakota/', '2026-07-25'),
('North Dakota', 'scorp', 'annual_report', false, 'fixed_date', 'annual', 8, 1, NULL, NULL, NULL,
 'Same Aug 1 corporate schedule as C-Corp — S-Corp election doesn''t change the state filing requirement.',
 'https://boostsuite.com/llc-annual-report/north-dakota/', '2026-07-25'),
('North Dakota', 'benefit', 'annual_report', false, 'fixed_date', 'annual', 8, 1, NULL, NULL, NULL,
 'North Dakota benefit corporations file as domestic corporations — same Aug 1 schedule.',
 'https://boostsuite.com/llc-annual-report/north-dakota/', '2026-07-25'),
('North Dakota', 'pc', 'annual_report', false, 'fixed_date', 'annual', 8, 1, NULL, NULL, NULL,
 'Professional corporations file as domestic corporations — same Aug 1 schedule.',
 'https://boostsuite.com/llc-annual-report/north-dakota/', '2026-07-25'),

-- South Dakota: due the 1st day of the formation anniversary month —
-- same anniversary_month_first_day pattern already supported for Illinois
-- and Wyoming. Confirmed identical for corporations and LLCs.
('South Dakota', 'all', 'annual_report', false, 'anniversary_month_first_day', 'annual', NULL, NULL, NULL, NULL, NULL,
 'Annual Report due the 1st day of the formation anniversary month (e.g. formed June 11 -> due June 1 each subsequent year). Confirmed identical for corporations and LLCs. 2-month early filing window.',
 'https://www.llcuniversity.com/south-dakota-llc/annual-report/ ; https://govance.io/us/south-dakota-llc-annual-report/', '2026-07-25');
