-- Compliance rules engine, batch 5 (FINAL) — Southwest + Mountain/West, per
-- the moat-validation follow-up's regional rollout plan: New Mexico,
-- Arizona, Colorado, Utah, Wyoming, Montana, Idaho, Nevada, Oregon,
-- Washington. Run after 010_compliance_rules_south.sql. See ../schema.sql
-- for the canonical schema.
--
-- Adds one new rule type this batch needed: anniversary_month_offset_end —
-- due on the last day of the Nth month after the formation month
-- (offset_months), for Colorado's "end of the second month following the
-- anniversary month." Unlike fiscal_year_offset, this counts from the
-- formation month itself, not a fiscal year end.
--
-- With this batch, every US state + DC has been researched for this
-- rollout (see 007/008/009/010 for DE/CA/FL/NY/TX, Northeast/Mid-Atlantic,
-- Midwest, and South respectively). `state` values are the FULL state name
-- throughout, matching registrations.state / STATE_FEES.
--
-- NOT seeded in this batch, per the "be conservative" instruction:
--   - New Mexico LLC: HB0281 (Revised Uniform LLC Act, effective Jul 1
--     2024) introduces a NEW triennial reporting requirement for LLCs,
--     replacing the old "no annual report" rule — but as of this research
--     pass, secondary sources describe the SOS's implementation of this as
--     still "rolling out," with no confirmed fixed date/anniversary
--     mechanics to seed. This app's `cadence` column also only supports
--     'annual'/'biennial', not 'triennial', so even a confirmed rule
--     couldn't be modeled without a schema change. Left unseeded rather
--     than seeding the now-superseded "not required" rule or guessing at
--     the new mechanics — falls back to the anniversary approximation.

ALTER TABLE compliance_rules DROP CONSTRAINT IF EXISTS compliance_rules_rule_type_check;
ALTER TABLE compliance_rules ADD CONSTRAINT compliance_rules_rule_type_check CHECK (rule_type IN (
  'fixed_date', 'anniversary_month_last_day', 'anniversary_month_first_day',
  'anniversary_quarter_end', 'anniversary_month_offset_end',
  'anniversary_exact_date', 'fiscal_year_offset'
));

INSERT INTO compliance_rules (state, entity_family, event_type, not_required, rule_type, cadence, fixed_month, fixed_day, offset_months, offset_day, year_parity, notes, source, verified_at) VALUES

-- ── Southwest ──────────────────────────────────────────────────────────

-- New Mexico: for-profit corporations file biennially, 15th day of the 4th
-- month after fiscal year end; nonprofit corporations file annually, 15th
-- day of the 5th month after fiscal year end (identical timing/formula to
-- the federal Form 990-N calculation already used elsewhere in this file).
-- LLC intentionally not seeded — see batch header.
('New Mexico', 'ccorp', 'annual_report', false, 'fiscal_year_offset', 'biennial', NULL, NULL, 4, 15, NULL,
 'Corporations file a biennial report by the 15th day of the 4th month following fiscal year end (calendar-year filers: April 15). $25 fee.',
 'https://www.zenbusiness.com/new-mexico-annual-report/ ; https://mosey.com/resources/us/secretary-of-state/new-mexico-annual-report/', '2026-07-25'),
('New Mexico', 'scorp', 'annual_report', false, 'fiscal_year_offset', 'biennial', NULL, NULL, 4, 15, NULL,
 'Same biennial corporate report rule as C-Corp — S-Corp election doesn''t change the state filing requirement.',
 'https://www.zenbusiness.com/new-mexico-annual-report/ ; https://mosey.com/resources/us/secretary-of-state/new-mexico-annual-report/', '2026-07-25'),
('New Mexico', 'benefit', 'annual_report', false, 'fiscal_year_offset', 'biennial', NULL, NULL, 4, 15, NULL,
 'New Mexico benefit corporations file as business corporations for annual-report purposes — same biennial rule.',
 'https://www.zenbusiness.com/new-mexico-annual-report/ ; https://mosey.com/resources/us/secretary-of-state/new-mexico-annual-report/', '2026-07-25'),
('New Mexico', 'pc', 'annual_report', false, 'fiscal_year_offset', 'biennial', NULL, NULL, 4, 15, NULL,
 'Professional corporations file as business corporations for annual-report purposes — same biennial rule.',
 'https://www.zenbusiness.com/new-mexico-annual-report/ ; https://mosey.com/resources/us/secretary-of-state/new-mexico-annual-report/', '2026-07-25'),
('New Mexico', 'nonprofit', 'annual_report', false, 'fiscal_year_offset', 'annual', NULL, NULL, 5, 15, NULL,
 'Nonprofit corporations file annually by the 15th day of the 5th month following fiscal year end (calendar-year filers: May 15) — same formula/timing as the federal Form 990-N, but this is the separate NM SOS filing. $10 fee.',
 'https://www.zenbusiness.com/new-mexico-annual-report/ ; https://mosey.com/resources/us/secretary-of-state/new-mexico-annual-report/', '2026-07-25'),

-- Arizona: LLCs have no annual report requirement at all. Corporations,
-- nonprofits, LLPs, and LLLPs file annually on the exact anniversary date
-- of incorporation/registration.
('Arizona', 'llc', 'annual_report', true, NULL, NULL, NULL, NULL, NULL, NULL, NULL,
 'Arizona LLCs are not required to file an annual report — nothing to remind on.',
 'https://www.mystatellc.com/llc/compliance ; https://incparadise.net/arizona/arizona-llc-inc-annual-filing-requirements/', '2026-07-25'),
('Arizona', 'all', 'annual_report', false, 'anniversary_exact_date', 'annual', NULL, NULL, NULL, NULL, NULL,
 'Corporations, nonprofits, LLPs, and LLLPs file an annual report due on the exact anniversary date of incorporation/registration each year. $45 fee. Does not apply to LLCs (see the explicit not_required row above, which wins for entity_family = llc).',
 'https://www.arizonaregisteredagent.com/registered-agent-service/arizona-annual-report/ ; https://fileforms.com/arizona-2026-annual-report-filing-guide-for-business-owners-professionals/', '2026-07-25'),

-- ── Mountain/West ──────────────────────────────────────────────────────

-- Colorado: Periodic Report due at the end of the SECOND month following
-- the formation anniversary month (not the anniversary month itself) —
-- introduces the new anniversary_month_offset_end rule type. Same system
-- for LLCs and corporations via the Colorado SOS.
('Colorado', 'all', 'annual_report', false, 'anniversary_month_offset_end', 'annual', NULL, NULL, 2, NULL, NULL,
 'Periodic Report due by the end of the 2nd month after the formation anniversary month (e.g. formed March -> due May 31). A generous 5-month filing window (2 months before through 2 months after the anniversary month) exists; this models the outer due date. $25 fee.',
 'https://www.llcuniversity.com/colorado-llc/periodic-report/ ; https://www.coloradoregisteredagent.com/colorado-periodic-report/', '2026-07-25'),

-- Utah: flat $18 fee, due last day of the formation anniversary month, for
-- every entity type.
('Utah', 'all', 'annual_report', false, 'anniversary_month_last_day', 'annual', NULL, NULL, NULL, NULL, NULL,
 'Annual Renewal due by the last day of the formation anniversary month. Flat $18 fee for all entity types. 30-day grace period exists but isn''t the date to remind by.',
 'https://www.llcuniversity.com/utah-llc/annual-report/ ; https://fileforms.com/utah-annual-report-deadline', '2026-07-25'),

-- Wyoming: due the FIRST day of the anniversary month (not month-end) —
-- same anniversary_month_first_day pattern as Illinois. Confirmed for
-- corporations, LLCs, LPs, RLLPs, and SFs.
('Wyoming', 'all', 'annual_report', false, 'anniversary_month_first_day', 'annual', NULL, NULL, NULL, NULL, NULL,
 'Annual Report (license tax) due the 1st day of the formation anniversary month (e.g. formed May 15 -> due May 1 each year). Fee is based on in-state asset value, minimum $60. Up to 120 days early filing window; delinquent 60 days after due date.',
 'https://wyobiz.wyo.gov/Business/AnnualReport.aspx ; https://fileforms.com/wyoming-annual-report-filing-for-2026-deadlines-requirements-and-how-to-stay-compliant/', '2026-07-25'),

-- Montana: fixed April 15 deadline for both LLCs and corporations. Fees
-- are waived by the Secretary of State for 2024-2027 filings, but that's a
-- fee policy, not a due-date change.
('Montana', 'all', 'annual_report', false, 'fixed_date', 'annual', 4, 15, NULL, NULL, NULL,
 'Annual Report due Apr 15 every year (filing window opens Jan 1), for both corporations and LLCs. Fees waived 2024-2027 per SOS policy — a fee decision, not a due-date change.',
 'https://boostsuite.com/llc-annual-report/montana/ ; https://www.llcuniversity.com/montana-llc/annual-report/', '2026-07-25'),

-- Idaho: due last day of the formation anniversary month, $0 fee online,
-- same system for domestic and foreign LLCs (and corporations, per the
-- Idaho SOS's unified annual-report system).
('Idaho', 'all', 'annual_report', false, 'anniversary_month_last_day', 'annual', NULL, NULL, NULL, NULL, NULL,
 'Annual Report due by the last day of the formation anniversary month. $0 fee filed online. First report due the year after formation.',
 'https://www.llcuniversity.com/idaho-llc/annual-report/ ; https://boostsuite.com/llc-annual-report/idaho/', '2026-07-25'),

-- Nevada: Annual List + State Business License, due last day of the
-- formation anniversary month — explicitly confirmed identical for both
-- LLCs and corporations (not a fixed statewide date like most other
-- states' business-license-style filings).
('Nevada', 'all', 'annual_report', false, 'anniversary_month_last_day', 'annual', NULL, NULL, NULL, NULL, NULL,
 'Annual List + State Business License renewal due by the last day of the formation anniversary month. Confirmed identical deadline mechanics for corporations and LLCs. $150+ fee (LLC) varies by entity type; $175 late fee.',
 'https://www.unitedcorporate.com/blog/what-is-a-nevada-annual-list/ ; https://boostsuite.com/llc-annual-report/nevada/', '2026-07-25'),

-- Oregon: due on the EXACT anniversary date of formation (not month-end,
-- not a fixed statewide date) — explicitly confirmed to not use month-end
-- or fiscal year, unlike most other anniversary-based states.
('Oregon', 'all', 'annual_report', false, 'anniversary_exact_date', 'annual', NULL, NULL, NULL, NULL, NULL,
 'Annual Report due on the literal anniversary date of formation/registration each year — Oregon explicitly does not use anniversary-month-end, the 1st of the month, or fiscal year end. $100 LLC fee.',
 'https://www.llcuniversity.com/oregon-llc/annual-report/ ; https://www.statebusinesscompliance.com/blog/oregon-llc-annual-report-2026', '2026-07-25'),

-- Washington: due by the end of the formation anniversary month, same
-- system for LLCs and corporations via the WA SOS.
('Washington', 'all', 'annual_report', false, 'anniversary_month_last_day', 'annual', NULL, NULL, NULL, NULL, NULL,
 'Annual Report due by the end of the formation anniversary month (e.g. formed June 15 -> due June 30 each year). $70 fee. Up to 180 days early filing window.',
 'https://www.llcuniversity.com/washington-llc/annual-report/ ; https://fileforms.com/washington-annual-report-deadline', '2026-07-25');
