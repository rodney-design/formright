-- Nonprofit statutory reference data — per-state nonprofit-corporation-act
-- citations and, where the state's own act mandates specific Articles
-- language beyond the generic IRC 501(c)(3) purpose/dissolution boilerplate
-- already in lib/doc-engine/builders/nonprofit.ts, the actual required
-- statutory statement. Same posture and precedent as compliance_rules
-- (007_compliance_rules.sql): only the 5 priority states (DE/CA/FL/NY/TX)
-- are seeded here, each row checked against the state's own published
-- statute text (via Justia/state legislature sites) as of verified_at, cited
-- in `source`. This is sourced legal-reference data for template fallback
-- and staff use — re-verify before relying on it, same as compliance_rules,
-- and it is NOT a substitute for review by a licensed attorney in the
-- jurisdiction of formation. Every other state keeps using the existing
-- generic 501(c)(3) template in buildArticles() (nonprofit.ts) — no
-- fabricated citation for states not covered here.
--
-- `subtype` distinguishes California's three nonprofit corporation types
-- (public_benefit/mutual_benefit/religious — Corp. Code Div. 2, Parts 2/3/4),
-- each of which has its own mandatory Articles statement. NULL subtype is
-- the wildcard row for states with a single nonprofit corporation law and no
-- such split (matches compliance_rules' 'all' wildcard, but NULL here since
-- there's no meaningful catch-all string across different states' schemes).

CREATE TABLE nonprofit_statutes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  state TEXT NOT NULL,
  subtype TEXT,  -- 'public_benefit' | 'mutual_benefit' | 'religious', or NULL
  act_name TEXT NOT NULL,
  act_citation TEXT NOT NULL,
  statute_url TEXT,
  -- Verbatim or lightly-adapted required statutory statement for the
  -- Articles' purpose clause, where the state's act mandates specific
  -- language. NULL means the state has no such mandated statement beyond the
  -- generic 501(c)(3) purpose language already in the template.
  purpose_clause TEXT,
  -- Free-text note on the state's dissolution/asset-distribution statute —
  -- not mandated Articles language (unlike purpose_clause), just the
  -- citation/mechanism to reference in Article XI.
  dissolution_note TEXT,
  source TEXT NOT NULL,
  verified_at DATE NOT NULL,
  UNIQUE (state, subtype)
);

CREATE INDEX idx_nonprofit_statutes_state ON nonprofit_statutes(state);

INSERT INTO nonprofit_statutes (state, subtype, act_name, act_citation, statute_url, purpose_clause, dissolution_note, source, verified_at) VALUES

-- Delaware has no separate nonprofit corporation act — nonprofit/nonstock
-- corporations are formed under the same General Corporation Law as
-- for-profits, per 8 Del. C. § 114 ("Application of chapter to nonstock
-- corporations"). No mandated purpose-clause statement exists beyond the
-- standard "any lawful purpose" language already in DGCL § 102(a)(3); winding
-- up/asset distribution on dissolution follows the general dissolution
-- provisions of Subchapter X (8 Del. C. §§ 275, 281), same mechanism as a
-- for-profit corporation.
('Delaware', NULL, 'Delaware General Corporation Law (nonstock corporations)', '8 Del. C. § 101 et seq.; § 114 (application to nonstock corporations)',
 'https://delcode.delaware.gov/title8/c001/', NULL,
 'No nonprofit-specific dissolution statute; general winding-up/distribution provisions of Subchapter X (8 Del. C. §§ 275, 281) apply, same as for-profit corporations.',
 'Confirmed via Delaware Code Title 8, Chapter 1, Subchapter I § 114 and Subchapter X §§ 275/281 (delcode.delaware.gov; law.justia.com/codes/delaware/title-8/).', '2026-07-27'),

-- California — Nonprofit Public Benefit Corporation Law (Corp. Code Div. 2,
-- Part 2, §§ 5110-6910). § 5130 mandates this exact statement in the
-- Articles' purpose clause.
('California', 'public_benefit', 'California Nonprofit Public Benefit Corporation Law', 'Cal. Corp. Code § 5130 (Div. 2, Part 2, §§ 5110-6910)',
 'https://leginfo.legislature.ca.gov/faces/codes_displayText.xhtml?lawCode=CORP&division=2.&part=2.',
 'This corporation is a nonprofit public benefit corporation and is not organized for the private gain of any person. It is organized under the Nonprofit Public Benefit Corporation Law for public and charitable purposes.',
 'Assets remaining on dissolution must be distributed to an organization engaged in activities substantially similar to those of the dissolving corporation, or to the federal/state government, per the Nonprofit Public Benefit Corporation Law dissolution provisions.',
 'Confirmed via Cal. Corp. Code § 5130 text (law.justia.com/codes/california, california.public.law).', '2026-07-27'),

-- California — Nonprofit Mutual Benefit Corporation Law (Div. 2, Part 3,
-- §§ 7110-8910). § 7130 mandates this statement; used for entity types like
-- 501(c)(6) business leagues or 501(c)(7) social clubs formed in CA, which
-- generally are NOT eligible for the public-benefit statute.
('California', 'mutual_benefit', 'California Nonprofit Mutual Benefit Corporation Law', 'Cal. Corp. Code § 7130 (Div. 2, Part 3, §§ 7110-8910)',
 'https://leginfo.legislature.ca.gov/faces/codes_displayText.xhtml?lawCode=CORP&division=2.&part=3.',
 'This corporation is a nonprofit mutual benefit corporation organized under the Nonprofit Mutual Benefit Corporation Law. The purpose of this corporation is to engage in any lawful act or activity, other than credit union business, for which a corporation may be organized under such law.',
 'Unlike public benefit/religious corporations, a mutual benefit corporation''s Articles are not required to dedicate assets to charitable purposes on dissolution unless the corporation elects 501(c)(3)-style asset-dedication language.',
 'Confirmed via Cal. Corp. Code § 7130 text (law.justia.com/codes/california, california.public.law).', '2026-07-27'),

-- California — Nonprofit Religious Corporation Law (Div. 2, Part 4,
-- §§ 9110-9690). § 9130 mandates this statement.
('California', 'religious', 'California Nonprofit Religious Corporation Law', 'Cal. Corp. Code § 9130 (Div. 2, Part 4, §§ 9110-9690)',
 'https://leginfo.legislature.ca.gov/faces/codes_displayText.xhtml?lawCode=CORP&division=2.&part=4.',
 'This corporation is a religious corporation and is not organized for the private gain of any person. It is organized under the Nonprofit Religious Corporation Law primarily for religious purposes.',
 'Assets remaining on dissolution must be distributed for religious purposes to another religious organization, per the Nonprofit Religious Corporation Law dissolution provisions.',
 'Confirmed via Cal. Corp. Code § 9130 text (law.justia.com/codes/california, california.public.law).', '2026-07-27'),

-- Florida — Florida Nonprofit Corporation Act, Fla. Stat. ch. 617 (renamed
-- from "Florida Not For Profit Corporation Act" under a revision effective
-- July 1, 2026 that modernizes the chapter to align with the Florida
-- Business Corporation Act and the ABA Model Nonprofit Corporation Act — use
-- the current name going forward). No mandated purpose-clause statement
-- comparable to California's; dissolution/winding-up is governed by
-- §§ 617.1405-617.1421.
('Florida', NULL, 'Florida Nonprofit Corporation Act', 'Fla. Stat. ch. 617 (§§ 617.1405-617.1421, winding up/dissolution)',
 'https://www.flsenate.gov/Laws/Statutes/2026/Chapter617/All', NULL,
 'Winding up and liquidation of assets on dissolution is governed by Fla. Stat. § 617.1405; administrative dissolution procedure by § 617.1421. No state-mandated purpose-clause wording; the federal 501(c)(3) exempt-purpose/asset-dedication language in the template satisfies both state and IRS requirements.',
 'Confirmed chapter renaming/2026 revision and §§ 617.1405 / 617.1421 via flsenate.gov and law.justia.com/codes/florida/title-xxxvi/chapter-617/.', '2026-07-27'),

-- New York — Not-for-Profit Corporation Law (N-PCL). Since a July 1, 2014
-- amendment, NY classifies every nonprofit as either a "charitable" or
-- "non-charitable" corporation (N-PCL § 201) rather than the older Type
-- A/B/C/D scheme; § 402 requires the certificate of incorporation to state
-- which one applies. 501(c)(3) organizations are charitable corporations.
('New York', NULL, 'New York Not-for-Profit Corporation Law', 'N-PCL § 201 (Purposes) and § 402 (Certificate of incorporation; contents)',
 'https://www.nysenate.gov/legislation/laws/NPC/201', 'This corporation is a charitable corporation, as defined in Section 201 of the Not-for-Profit Corporation Law.',
 'Charitable corporations require Attorney General and/or Supreme Court approval (N-PCL Article 10/11) before a dissolution plan distributing assets can be completed — a materially longer process than a for-profit dissolution.',
 'Confirmed via N-PCL § 201 and § 402 text (law.justia.com/codes/new-york, nysenate.gov/legislation/laws/NPC/201); note the pre-2014 Type A/B/C/D scheme is obsolete for new filings.', '2026-07-27'),

-- Texas — Business Organizations Code, Title 2, Chapter 22 (Nonprofit
-- Corporations), effective since the 2003 recodification (in force Jan 1,
-- 2006). No mandated purpose-clause statement; dissolution/asset
-- distribution to a 501(c)(3)/170(c) organization is governed by § 22.304.
('Texas', NULL, 'Texas Business Organizations Code — Nonprofit Corporations', 'Tex. Bus. Orgs. Code ch. 22 (§ 22.304, application/distribution of property)',
 'https://law.justia.com/codes/texas/business-organizations-code/title-2/chapter-22/subchapter-g/section-22-304/', NULL,
 'On dissolution, property remaining after satisfying the plan of distribution is distributed by the district court to one or more organizations exempt under IRC § 501(c)(3) or described in § 170(c)(1)/(2), per Tex. Bus. Orgs. Code § 22.304.',
 'Confirmed via Tex. Bus. Orgs. Code § 22.304 text (law.justia.com/codes/texas/business-organizations-code/title-2/chapter-22/subchapter-g/).', '2026-07-27');
