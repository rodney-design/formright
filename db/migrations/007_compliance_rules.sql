-- Compliance rules engine — verified annual-report due dates for the 5
-- priority states (build-order doc §Phase 3 states: DE/CA/FL/NY/TX). Run
-- after 006_filing_provider.sql. See ../schema.sql for the canonical schema.
--
-- Every row below was checked against a primary or authoritative secondary
-- source as of the date in verified_at, cited in `source`. State rules
-- change; re-verify before relying on this in production, and re-confirm
-- annually regardless. No other state has a row here — everything else
-- keeps using seedComplianceEvents()'s formation-anniversary approximation
-- rather than a guessed fixed date.
--
-- entity_family = 'all' is a wildcard: lib/entities/complianceRulesTable.ts
-- looks for an exact (state, entity_family) match first, then falls back to
-- (state, 'all'). This keeps the table small — most states don't
-- distinguish LLC from corporation cadence, so one 'all' row covers every
-- entity family except where a state-specific carve-out needs its own row
-- (Delaware and California both split LLC from corporation forms below).

INSERT INTO compliance_rules (state, entity_family, event_type, rule_type, cadence, fixed_month, fixed_day, notes, source, verified_at) VALUES

-- Delaware: LLCs/LPs pay a flat $300 annual tax with NO report filed, due
-- June 1 every year — distinct from the corporate franchise tax + annual
-- report requirement below, hence its own row.
('DE', 'llc', 'annual_report', 'fixed_date', 'annual', 6, 1,
 'Flat $300 annual LLC/LP tax — no report is filed, payment only. $200 late penalty + 1.5%/mo interest if missed.',
 'https://corp.delaware.gov/frtax/ ; https://www.delawareinc.com/blog/june-1-important-deadline-delaware-llcs/', '2026-07-25'),

-- Delaware: for-profit corporations (C-Corp, S-Corp, Benefit Corp, PC) and
-- nonprofit corporations file an annual franchise tax report due March 1.
('DE', 'all', 'annual_report', 'fixed_date', 'annual', 3, 1,
 'Annual franchise tax report + payment due March 1 for corporations (all forms). $200 penalty + 1.5%/mo interest if missed.',
 'https://www.wolterskluwer.com/en/expert-insights/delaware-corporations-annual-franchise-report-and-tax-requirement ; https://corp.delaware.gov/frtax/', '2026-07-25'),

-- Florida: identical annual report deadline for every entity type via
-- Sunbiz, so a single 'all' row covers the whole state.
('FL', 'all', 'annual_report', 'fixed_date', 'annual', 5, 1,
 'Annual report due via Sunbiz. $400 late fee applies automatically if filed after May 1.',
 'https://dos.fl.gov/sunbiz/manage-business/efile/annual-report/', '2026-07-25'),

-- Texas: Public Information Report + franchise tax filing, same May 15
-- deadline for every entity type that files with the Comptroller.
('TX', 'all', 'annual_report', 'fixed_date', 'annual', 5, 15,
 'Public Information Report + franchise tax due May 15 (moves to next business day if a weekend/holiday). $50 late fee regardless of tax owed.',
 'https://comptroller.texas.gov/help/franchise/information-report.php', '2026-07-25'),

-- California: LLCs file a Statement of Information every TWO years, due by
-- the last day of the formation anniversary month.
('CA', 'llc', 'annual_report', 'anniversary_month_last_day', 'biennial', NULL, NULL,
 'Biennial Statement of Information (Form LLC-12), due last day of formation anniversary month. $250 penalty after the 60-day grace period. Initial filing is separately due within 90 days of formation — not modeled here, this rule is the recurring one only.',
 'https://www.llcuniversity.com/california-llc/statement-of-information/ ; https://mosey.com/blog/california-biennial-statement-of-information/', '2026-07-25'),

-- California: corporations (C-Corp, S-Corp, Benefit Corp, PC) and nonprofit
-- corporations file the Statement of Information every year, not biennially.
('CA', 'all', 'annual_report', 'anniversary_month_last_day', 'annual', NULL, NULL,
 'Annual Statement of Information for corporations, due last day of formation anniversary month.',
 'https://www.llcuniversity.com/california-llc/statement-of-information/ (corp variant) ; https://www.getpalm.com/resources/ca-statement-of-information-due-date-guide', '2026-07-25'),

-- New York: biennial statement, every entity form (LLCs and corporations
-- alike), due last day of formation anniversary month.
('NY', 'all', 'annual_report', 'anniversary_month_last_day', 'biennial', NULL, NULL,
 'Biennial Statement due last day of formation anniversary month, every 2 years. $9 fee.',
 'https://dos.ny.gov/biennial-statements-business-corporations-and-limited-liability-companies', '2026-07-25');
