-- Charitable solicitation registration — a separate compliance obligation
-- from the annual_report row already in compliance_rules: most states
-- require a nonprofit to register (and renew) before soliciting donations
-- from their residents, on top of whatever corporate annual-report filing
-- applies. Reuses the existing compliance_rules table/event_type column
-- (see 007_compliance_rules.sql) rather than a new table — same shape, same
-- (state, entity_family) keying, same sourcing/re-verify posture. Only the
-- 5 priority states (DE/CA/FL/NY/TX) are seeded; every other state's
-- nonprofit registrations get no charitable_solicitation_renewal event at
-- all rather than a guessed one.
--
-- entity_family is 'nonprofit' explicitly (not 'all') since this obligation
-- doesn't apply to other entity families.

INSERT INTO compliance_rules (state, entity_family, event_type, not_required, rule_type, cadence, fixed_month, fixed_day, offset_months, offset_day, notes, source, verified_at) VALUES

-- California: Attorney General Registry of Charitable Trusts. Initial
-- registration (Form CT-1) is due within 30 days of first receiving assets
-- (not modeled here — this row is the recurring renewal only, same posture
-- as the California LLC annual_report row's comment in 007). Renewal (Form
-- RRF-1) due 4 months 15 days after fiscal year end.
('California', 'nonprofit', 'charitable_solicitation_renewal', false, 'fiscal_year_offset', 'annual', NULL, NULL, 4, 15,
 'Form RRF-1 renewal to the Registry of Charitable Trusts, due 4.5 months after fiscal year end (April 15 for a calendar-year org). Separate from the LLC/corporation annual_report row above — this applies specifically to nonprofit charitable-solicitation registration.',
 'https://oag.ca.gov/charities/renewals ; https://www.oag.ca.gov/system/files/media/rrf1_form.pdf', '2026-07-27'),

-- New York: Charities Bureau (Attorney General). Form CHAR500, due 4.5
-- months after fiscal year end for 7A/DUAL filers (most 501(c)(3) public
-- charities register as DUAL, under both Article 7-A and EPTL).
('New York', 'nonprofit', 'charitable_solicitation_renewal', false, 'fiscal_year_offset', 'annual', NULL, NULL, 4, 15,
 'Form CHAR500 annual filing to the Charities Bureau, due 4.5 months after fiscal year end (May 15 for a calendar-year org, per the 15th-day-of-5th-month framing some sources use) for 7A/DUAL filers.',
 'https://ag.ny.gov/sites/default/files/regulatory-documents/CHAR500_instructions_2018.pdf ; https://labyrinthinc.com/nonprofit-annual-filing-requirements-new-york/', '2026-07-27'),

-- Florida: Solicitation of Contributions Act (FDACS), a fixed-cadence
-- obligation but NOT tied to fiscal year — renewal falls on the anniversary
-- of the org's original registration date, which this app doesn't track
-- separately from formation. anniversary_exact_date (using the formation
-- date as the best available proxy for registration date) is an
-- approximation, flagged here rather than silently treated as precise.
('Florida', 'nonprofit', 'charitable_solicitation_renewal', false, 'anniversary_exact_date', 'annual', NULL, NULL, NULL, NULL,
 'FDACS Solicitation of Contributions registration renews annually on the anniversary of the ORIGINAL REGISTRATION date, not the formation date or a fixed calendar date. Approximated here using the formation date since FormRight doesn''t track a separate initial-registration date — confirm the real registration date once known and correct if it differs.',
 'https://www.fdacs.gov/business-services/solicitation-of-contributions ; https://www.harborcompliance.com/florida-charitable-registration', '2026-07-27'),

-- Delaware: confirmed no charitable solicitation registration requirement
-- at all (one of 10 states with none, per a July 2026 multi-source survey).
('Delaware', 'nonprofit', 'charitable_solicitation_renewal', true, NULL, NULL, NULL, NULL, NULL, NULL,
 'Delaware has no charitable solicitation registration requirement for nonprofits.',
 'https://www.cogencyglobal.com/blog/which-states-require-charitable-solicitation-registration-for-nonprofits/', '2026-07-27'),

-- Texas: no GENERAL charitable solicitation registration requirement — only
-- law-enforcement/public-safety/veterans organizations must register, which
-- is a narrow carve-out this app doesn't model as its own entity family.
-- Treated as not_required for the general nonprofit case.
('Texas', 'nonprofit', 'charitable_solicitation_renewal', true, NULL, NULL, NULL, NULL, NULL, NULL,
 'Texas has no general charitable solicitation registration requirement; only law enforcement/public safety/veterans organizations must register, a narrow carve-out not modeled separately here.',
 'https://www.cogencyglobal.com/blog/which-states-require-charitable-solicitation-registration-for-nonprofits/', '2026-07-27');
