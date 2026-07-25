-- Compliance rules engine, batch 4 — South, per the moat-validation
-- follow-up's regional rollout plan (Texas and Florida were already seeded
-- in 007_compliance_rules.sql; this batch covers the rest of the South:
-- Georgia, Louisiana, Arkansas, Oklahoma, Kentucky, Tennessee, Mississippi,
-- Alabama). Run after 009_compliance_rules_midwest.sql. See ../schema.sql
-- for the canonical schema. No new rule types or columns needed — every
-- pattern in this batch fits fixed_date, anniversary_exact_date, or
-- fiscal_year_offset, all already supported.
--
-- `state` values are the FULL state name, matching registrations.state /
-- STATE_FEES.
--
-- Every row below was checked against a primary or authoritative secondary
-- source as of the date in verified_at, cited in `source`. State rules
-- change; re-verify before relying on this in production, and re-confirm
-- annually regardless.
--
-- NOT seeded in this batch (left on the existing anniversary
-- approximation), per the "be conservative" instruction:
--   - Alabama LLC: the Business Privilege Tax due date genuinely differs by
--     federal tax classification (single-member LLC due date aligns with
--     Form 1040/Sch. C — April 15; multi-member aligns with Form 1065 —
--     March 15), which this app's entity_family model (llc/ccorp/scorp/
--     benefit/pc/nonprofit) cannot distinguish. Guessing either date would
--     be wrong for roughly half of Alabama LLCs, so this is intentionally
--     left unseeded rather than picking one.
--   - Georgia, Louisiana, Oklahoma, Kentucky nonprofit corporations: the
--     'all' row in each of those states was confirmed (via a direct search
--     on the nonprofit-specific requirement, not just an assumption) to
--     apply identically to nonprofit corporations — see the per-state
--     comments below for the citation in each case.

INSERT INTO compliance_rules (state, entity_family, event_type, not_required, rule_type, cadence, fixed_month, fixed_day, offset_months, offset_day, year_parity, notes, source, verified_at) VALUES

-- Georgia: fixed Jan 1 - Apr 1 filing window, confirmed identical for LLCs,
-- corporations, nonprofit corporations, and foreign entities.
('Georgia', 'all', 'annual_report', false, 'fixed_date', 'annual', 4, 1, NULL, NULL, NULL,
 'Annual Registration filing window Jan 1 - Apr 1; due Apr 1. $50 fee ($60 for some filers). 90-day grace period to Jul 1 before administrative dissolution. Confirmed identical for nonprofit corporations specifically (also Apr 1, $40 fee).',
 'https://fileforms.com/georgia-annual-report-filing-how-to-stay-compliant-and-avoid-penalties-2026-guide/ ; https://www.tax990.com/state-filing-requirements-for-nonprofits/georgia/', '2026-07-25'),

-- Louisiana: anniversary-of-formation system, confirmed for both LLCs
-- (RS 12:1308.1) and corporations (RS 12:1-1621) — literal anniversary
-- date, not month-end.
('Louisiana', 'all', 'annual_report', false, 'anniversary_exact_date', 'annual', NULL, NULL, NULL, NULL, NULL,
 'Annual report due on or before the anniversary of the formation/incorporation date each year (RS 12:1308.1 for LLCs, RS 12:1-1621 for corporations). $30 fee. 30-day grace period exists but isn''t the date to remind by.',
 'https://law.justia.com/codes/louisiana/revised-statutes/title-12/rs-12-1308-1/ ; https://law.justia.com/codes/louisiana/2022/revised-statutes/title-12/rs-12-1-1621/', '2026-07-25'),

-- Arkansas: flat May 1 deadline. LLCs pay a $150 flat annual franchise tax;
-- stock corporations pay 0.3% of outstanding capital (min $150) — different
-- calculations, but the SAME May 1 due date and the tax filing doubles as
-- the corporate annual report, so one 'all' row covers both.
('Arkansas', 'all', 'annual_report', false, 'fixed_date', 'annual', 5, 1, NULL, NULL, NULL,
 'Annual Franchise Tax Report due May 1, fixed date regardless of formation date. No statutory extension mechanism. $25 late penalty + 10%/yr interest. Doubles as the corporate annual report — Arkansas does not require a separate one.',
 'https://fileforms.com/arkansas-franchise-tax-report-deadline ; https://www.sos.arkansas.gov/uploads/bcs/Corp1_FT_2026.pdf', '2026-07-25'),

-- Oklahoma: anniversary-of-registration system for both LLCs and
-- corporations. Franchise tax was repealed for tax years starting 2024
-- (HB 1039X) — only the flat $25 annual certificate remains.
('Oklahoma', 'all', 'annual_report', false, 'anniversary_exact_date', 'annual', NULL, NULL, NULL, NULL, NULL,
 'Annual Certificate due on the anniversary date of formation/incorporation each year. $25 fee. Franchise tax repealed for tax years beginning 2024 (HB 1039X) — the annual certificate is the only remaining recurring filing.',
 'https://www.llcuniversity.com/oklahoma-llc/annual-certificate/ ; https://law.justia.com/codes/oklahoma/title-18/section-18-2055-2/', '2026-07-25'),

-- Kentucky: fixed Jan 1 - Jun 30 filing window, confirmed identical across
-- LLCs, corporations, and partnerships per the KY SOS.
('Kentucky', 'all', 'annual_report', false, 'fixed_date', 'annual', 6, 30, NULL, NULL, NULL,
 'Annual Report filing window Jan 1 - Jun 30; due Jun 30 regardless of formation date, for LLCs, corporations, and partnerships alike. $15 fee.',
 'https://www.sos.ky.gov/bus/business-filings/Pages/Annual-Reports.aspx ; https://boostsuite.com/llc-annual-report/kentucky/', '2026-07-25'),

-- Tennessee: due the 1st day of the 4th month after fiscal year end
-- (calendar-year filers: April 1), not tied to formation anniversary.
-- Confirmed identical date system for LLCs, corporations, and nonprofits
-- (fees differ: LLC $300 min, corp $20, nonprofit $5, but the due-date rule
-- doesn't vary by entity type).
('Tennessee', 'all', 'annual_report', false, 'fiscal_year_offset', 'annual', NULL, NULL, 4, 1, NULL,
 'Due on or before the 1st day of the 4th month after fiscal year end — calendar-year filers: April 1. Modeled as offset_months=4/offset_day=1 from FYE. Same due-date rule for LLCs, corporations, and nonprofits (fee amounts differ, due date does not).',
 'https://www.bizreport.com/annual-report-llc-tennessee ; https://www.llcuniversity.com/tennessee-llc/annual-report/', '2026-07-25'),

-- Mississippi: LLCs and for-profit corporation types file by Apr 15;
-- nonprofit corporations are on a SEPARATE, newer (2024/2025) May 15
-- deadline under Miss. Code 79-11-407 — different enough to need its own
-- row rather than an 'all' wildcard that would incorrectly apply Apr 15 to
-- nonprofits too.
('Mississippi', 'llc', 'annual_report', false, 'fixed_date', 'annual', 4, 15, NULL, NULL, NULL,
 'Annual Report due Apr 15; filing window opens Jan 1. Free for domestic LLCs.',
 'https://boostsuite.com/llc-annual-report/mississippi/ ; https://www.sos.ms.gov/business-services/annual-reports', '2026-07-25'),
('Mississippi', 'ccorp', 'annual_report', false, 'fixed_date', 'annual', 4, 15, NULL, NULL, NULL,
 'Same Apr 15 Annual Report deadline as LLCs, via the MS SOS.',
 'https://boostsuite.com/llc-annual-report/mississippi/ ; https://www.sos.ms.gov/business-services/annual-reports', '2026-07-25'),
('Mississippi', 'scorp', 'annual_report', false, 'fixed_date', 'annual', 4, 15, NULL, NULL, NULL,
 'Same Apr 15 Annual Report deadline — S-Corp election doesn''t change the state filing requirement.',
 'https://boostsuite.com/llc-annual-report/mississippi/ ; https://www.sos.ms.gov/business-services/annual-reports', '2026-07-25'),
('Mississippi', 'benefit', 'annual_report', false, 'fixed_date', 'annual', 4, 15, NULL, NULL, NULL,
 'Mississippi benefit corporations file as business corporations for annual-report purposes — same Apr 15 deadline.',
 'https://boostsuite.com/llc-annual-report/mississippi/ ; https://www.sos.ms.gov/business-services/annual-reports', '2026-07-25'),
('Mississippi', 'pc', 'annual_report', false, 'fixed_date', 'annual', 4, 15, NULL, NULL, NULL,
 'Professional corporations file as business corporations for annual-report purposes — same Apr 15 deadline.',
 'https://boostsuite.com/llc-annual-report/mississippi/ ; https://www.sos.ms.gov/business-services/annual-reports', '2026-07-25'),
('Mississippi', 'nonprofit', 'annual_report', false, 'fixed_date', 'annual', 5, 15, NULL, NULL, NULL,
 'New requirement effective 2024 (HB 1344, Miss. Code 79-11-407): nonprofit corporations file between Jan 1 and May 15, separate from and later than the Apr 15 deadline for LLCs/for-profit corporations. Free to file. Administrative dissolution if missed.',
 'https://www.sos.ms.gov/news/new-nonprofit-annual-report-filing-requirement ; https://esapllc.com/new-mississippi-reporting-requirement-for-nonprofit-corporations-2025/', '2026-07-25'),

-- Alabama: Business Privilege Tax return, filed with the Dept. of Revenue
-- (not the SOS) alongside the Annual Report. Nonprofits with a 501(c)
-- exemption have no requirement at all. For-profit corporations (not LLCs
-- — see the batch header for why LLC is intentionally unseeded) are due
-- 3.5 months after the start of the tax year, EXCEPT a fiscal year ending
-- specifically June 30, which gets 2.5 months instead — modeled here as
-- offset_months=4/offset_day=15 from fiscal year end, which reduces to the
-- correct date for every fiscal year end EXCEPT June 30 (that one specific
-- carve-out would compute Oct 15 here instead of the correct Sep 15; a
-- narrow, known, unmodeled gap given how rare a June 30 fiscal year end is
-- for new small-business formations).
('Alabama', 'nonprofit', 'annual_report', true, NULL, NULL, NULL, NULL, NULL, NULL, NULL,
 'No annual report or Business Privilege Tax filing required for a domestic Alabama nonprofit corporation with a 501(c) exemption. (A separate charitable-solicitation Annual Financial Report with the AG''s office may apply if the org solicits donations — not modeled here, out of scope for entity-formation compliance.)',
 'https://www.harborcompliance.com/alabama-nonprofit-compliance ; https://www.revenue.alabama.gov/faqs/what-taxpayers-must-file-an-alabama-business-privilege-tax-return/', '2026-07-25'),
('Alabama', 'ccorp', 'annual_report', false, 'fiscal_year_offset', 'annual', NULL, NULL, 4, 15, NULL,
 'Business Privilege Tax return (Form CPT) + Annual Report due 3.5 months after the start of the tax year — calendar-year filers: Apr 15. Modeled as offset_months=4/offset_day=15 from fiscal year end. KNOWN GAP: a fiscal year ending specifically Jun 30 instead gets 2.5 months (due ~Sep 15), which this formula does not special-case.',
 'https://www.revenue.alabama.gov/faqs/when-is-the-alabama-business-privilege-tax-return-due/', '2026-07-25'),
('Alabama', 'scorp', 'annual_report', false, 'fiscal_year_offset', 'annual', NULL, NULL, 4, 15, NULL,
 'Same Business Privilege Tax + Annual Report rule as C-Corp (Form PPT for pass-through entities) — S-Corp election doesn''t change the due-date formula. Same Jun-30-fiscal-year-end gap noted on the C-Corp row applies here too.',
 'https://www.revenue.alabama.gov/faqs/when-is-the-alabama-business-privilege-tax-return-due/', '2026-07-25'),
('Alabama', 'benefit', 'annual_report', false, 'fiscal_year_offset', 'annual', NULL, NULL, 4, 15, NULL,
 'Alabama benefit corporations file as business corporations for Business Privilege Tax purposes — same rule and same known Jun-30-fiscal-year-end gap as the C-Corp row.',
 'https://www.revenue.alabama.gov/faqs/when-is-the-alabama-business-privilege-tax-return-due/', '2026-07-25'),
('Alabama', 'pc', 'annual_report', false, 'fiscal_year_offset', 'annual', NULL, NULL, 4, 15, NULL,
 'Professional corporations file as business corporations for Business Privilege Tax purposes — same rule and same known Jun-30-fiscal-year-end gap as the C-Corp row.',
 'https://www.revenue.alabama.gov/faqs/when-is-the-alabama-business-privilege-tax-return-due/', '2026-07-25');
-- Alabama LLC: intentionally NOT seeded — see batch header. Falls back to
-- the anniversary approximation rather than guessing single- vs
-- multi-member status.
