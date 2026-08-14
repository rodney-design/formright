import type { Metadata } from "next";
import Link from "next/link";
import BlogShell from "@/components/marketing/BlogShell";

export const metadata: Metadata = {
  title: "The Complete Nonprofit Compliance Calendar (2026) — FormRight",
  description:
    "Every federal and state deadline a 501(c)(3) needs to track — Form 990, annual reports, charitable registration renewals, and what happens if you miss one. A month-by-month calendar included.",
};

const TOC = [
  { id: "why-it-matters", label: "Why nonprofit compliance deadlines matter" },
  { id: "by-org-size", label: "Compliance obligations by organization size" },
  { id: "federal-deadlines", label: "Federal compliance deadlines" },
  { id: "state-deadlines", label: "State compliance deadlines" },
  { id: "state-income-tax", label: "State income tax exemption & employment filings" },
  { id: "governance-deadlines", label: "Governance & internal deadlines" },
  { id: "month-by-month", label: "Month-by-month compliance calendar" },
  { id: "scenario", label: "A worked example: one year at a small nonprofit" },
  { id: "foundation-deadlines", label: "Extra deadlines for private foundations" },
  { id: "penalties", label: "What happens if you miss a deadline" },
  { id: "staying-on-top", label: "How to never miss a deadline again" },
  { id: "faq", label: "Frequently asked questions" },
];

export default function NonprofitComplianceCalendarPage() {
  return (
    <BlogShell
      category="Nonprofit Compliance"
      title="The Complete Nonprofit Compliance Calendar: Every Deadline You Can't Miss"
      dek="Federal, state, and internal governance deadlines for 501(c)(3) organizations — laid out month by month, with the real consequences of missing each one."
      meta={<>18 min read &nbsp;·&nbsp; Updated August 2026 &nbsp;·&nbsp; Applies to calendar-year 501(c)(3) organizations</>}
      toc={TOC}
    >
      <p>
        Getting your 501(c)(3) approved is the beginning of your compliance
        obligations, not the end of them. Every nonprofit — regardless of
        size, budget, or how many staff you have — owes the IRS an annual
        information return, owes its home state (and often several other
        states) periodic filings, and owes its own board a set of governance
        rituals that keep the organization legally sound. None of these
        obligations are optional, and unlike a late credit card payment, the
        penalty for missing enough of them isn&apos;t a fee — it&apos;s losing
        your tax-exempt status entirely.
      </p>
      <p>
        This guide lays out every recurring deadline a typical 501(c)(3)
        needs to track, organized by who you owe it to (the IRS, your state,
        or your own board), followed by a month-by-month calendar you can
        adapt to your organization&apos;s fiscal year. If you&apos;re looking
        specifically for how to file the annual e-Postcard, see our{" "}
        <Link href="/blog/form-990-n-guide">Form 990-N filing guide</Link>.
      </p>

      <h2 id="why-it-matters">Why nonprofit compliance deadlines matter</h2>
      <p>
        Unlike a for-profit business, where missing a filing deadline
        usually means a late fee, a nonprofit that misses enough deadlines
        can lose the entire legal and financial foundation it was built on.
        Four consequences make nonprofit compliance calendars worth taking
        seriously:
      </p>
      <h3>1. Automatic revocation of tax-exempt status</h3>
      <p>
        Under Internal Revenue Code section 6033(j), any organization
        required to file an annual return or notice (Form 990, 990-EZ,
        990-N, or 990-PF) that fails to do so for three consecutive years
        has its tax-exempt status <strong>automatically revoked</strong> —
        no warning letter, no hearing, no appeal. The revocation is
        published in the IRS&apos;s Tax Exempt Organization Search database
        and, historically, in the Internal Revenue Bulletin. This is the
        single most common way small nonprofits lose their exempt status,
        and it happens to thousands of organizations every year, almost
        always because nobody was tracking the filing deadline.
      </p>
      <h3>2. Loss of donor deductibility</h3>
      <p>
        Once status is revoked, contributions to your organization are no
        longer tax-deductible to donors. For an organization that relies on
        individual or foundation giving, this is often fatal — grantmakers
        typically require current 501(c)(3) status as a condition of
        funding, and many won&apos;t re-engage with an organization that has
        a revocation on its public record, even after reinstatement.
      </p>
      <h3>3. State administrative dissolution</h3>
      <p>
        Separately from the IRS, states can administratively dissolve a
        nonprofit corporation that fails to file required annual or
        biennial reports, or that lets its registered agent lapse. A
        dissolved corporation can&apos;t legally sign contracts, open bank
        accounts, or in most states, even use its own name — and
        reinstatement typically requires back-filing every missed report
        plus penalties before the state will restore good standing.
      </p>
      <h3>4. Personal exposure for directors and officers</h3>
      <p>
        Directors and officers are generally shielded from an
        organization&apos;s liabilities as long as the corporation is
        properly maintained. Administrative dissolution or exempt-status
        revocation can weaken that shield, and directors’ and officers’
        (D&amp;O) insurance policies frequently exclude coverage for claims
        arising while an organization was not in good standing. Compliance
        isn&apos;t just paperwork — it&apos;s the thing that keeps the
        corporate veil intact.
      </p>

      <h2 id="by-org-size">Compliance obligations by organization size</h2>
      <p>
        Not every nonprofit carries the same compliance load. A
        two-person, all-volunteer organization with a $15,000 annual
        budget and a national organization with paid staff and multi-state
        fundraising are both 501(c)(3)s, but their calendars look
        completely different. It helps to know which profile you&apos;re
        in before you build your own calendar from the sections below.
      </p>
      <table>
        <thead>
          <tr>
            <th>Organization profile</th>
            <th>Typical recurring obligations</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>All-volunteer, under $50,000/year, single state</td>
            <td>
              Form 990-N, one state annual/biennial report, registered
              agent maintenance, annual board meeting and minutes
            </td>
          </tr>
          <tr>
            <td>Small staff, $50,000–$200,000/year, single state</td>
            <td>
              Form 990-EZ, payroll tax filings (941, W-2/1099), state
              annual report, charitable solicitation registration renewal,
              annual conflict-of-interest disclosures
            </td>
          </tr>
          <tr>
            <td>
              Established staff, $200,000+/year, multi-state fundraising
            </td>
            <td>
              Full Form 990, payroll tax filings, state annual report,
              charitable registration renewals in every state solicited,
              possible foreign qualification in states with staff or
              offices, audited financials in some registration states
            </td>
          </tr>
          <tr>
            <td>Private foundation, any size</td>
            <td>
              Form 990-PF every year regardless of activity, excise tax on
              net investment income, minimum distribution tracking, state
              annual report
            </td>
          </tr>
        </tbody>
      </table>
      <p>
        The obligations only ever add on top of each other as an
        organization grows — nothing on this list disappears as you scale,
        which is exactly why building tracking habits early, while your
        calendar is still short, pays off later when it isn&apos;t.
      </p>

      <h2 id="federal-deadlines">Federal compliance deadlines</h2>
      <p>
        Federal obligations come from the IRS and apply to every 501(c)(3),
        regardless of which state you&apos;re incorporated in.
      </p>

      <h3>The Form 990 series (annual information return)</h3>
      <p>
        Every 501(c)(3) — with very narrow exceptions for churches and a
        few other categories — must file some version of Form 990 every
        year. Which version depends on gross receipts and total assets:
      </p>
      <table>
        <thead>
          <tr>
            <th>Form</th>
            <th>Who files it</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Form 990-N (e-Postcard)</td>
            <td>Gross receipts normally ≤ $50,000</td>
          </tr>
          <tr>
            <td>Form 990-EZ</td>
            <td>Gross receipts &lt; $200,000 and total assets &lt; $500,000</td>
          </tr>
          <tr>
            <td>Form 990</td>
            <td>Gross receipts ≥ $200,000 or total assets ≥ $500,000</td>
          </tr>
          <tr>
            <td>Form 990-PF</td>
            <td>All private foundations, regardless of size</td>
          </tr>
        </tbody>
      </table>
      <p>
        Every version of the 990 series is due on the{" "}
        <strong>15th day of the 5th month after your fiscal year ends</strong>
        . For an organization on a calendar fiscal year (Jan 1 – Dec 31),
        that&apos;s <strong>May 15</strong>. An organization on a July 1 –
        June 30 fiscal year owes its 990 by November 15. A single automatic
        6-month extension is available for the 990, 990-EZ, and 990-PF by
        filing Form 8868 before the original deadline — but there is no
        extension available (or needed) for the 990-N, since it&apos;s a
        short electronic notice rather than a full return. For the details
        of filing the e-Postcard specifically, see our{" "}
        <Link href="/blog/form-990-n-guide">complete Form 990-N guide</Link>.
      </p>

      <h3>Form 990-T (unrelated business income tax)</h3>
      <p>
        If your nonprofit generates more than $1,000 in gross income from a
        trade or business that&apos;s not substantially related to your
        exempt purpose — a thrift shop run by volunteers is generally fine;
        a nonprofit-owned parking garage rented out commercially usually
        isn&apos;t — you owe Unrelated Business Income Tax (UBIT) and must
        file Form 990-T on the same 15th-day-of-the-5th-month schedule as
        your other 990. If you expect to owe $500 or more in UBIT for the
        year, you generally need to make quarterly estimated tax payments
        as well.
      </p>

      <h3>Employment tax deadlines (if you have staff)</h3>
      <p>
        Nonprofits with employees are subject to the same federal payroll
        tax calendar as any employer:
      </p>
      <ul>
        <li>
          <strong>Form 941</strong> (quarterly federal tax return) — due
          April 30, July 31, October 31, and January 31 for the preceding
          quarter.
        </li>
        <li>
          <strong>W-2s and 1099-NEC forms</strong> to employees and
          contractors — due January 31 for the prior calendar year.
        </li>
        <li>
          <strong>Form 940</strong> (federal unemployment tax) — most
          501(c)(3) organizations are statutorily exempt from FUTA, but
          confirm your exemption applies before assuming you can skip this
          one; it&apos;s otherwise due January 31.
        </li>
      </ul>
      <p>
        If your organization has no employees — common for very early-stage
        nonprofits run entirely by volunteers — these don&apos;t apply, but
        note the deadline on your calendar anyway for the year you make your
        first hire.
      </p>

      <h2 id="state-deadlines">State compliance deadlines</h2>
      <p>
        State-level obligations are where compliance calendars get
        genuinely complicated, because every state runs its own system on
        its own schedule, and a nonprofit that fundraises across state
        lines can owe filings to a dozen states at once.
      </p>

      <h3>Annual or biennial corporate reports</h3>
      <p>
        Most states require every nonprofit corporation to file a periodic
        report with the Secretary of State (or equivalent office) confirming
        your registered agent, principal address, and officers/directors
        are current. Some states require this annually, others every two
        years; some tie the deadline to your incorporation anniversary,
        others to a fixed calendar date that applies to every entity in the
        state. Fees typically run from $10 to a few hundred dollars.
        Miss it, and most states will first mark the corporation
        &quot;not in good standing,&quot; then administratively dissolve it
        after a further grace period — usually somewhere between 60 days and
        a year, depending on the state.
      </p>

      <h3>Charitable solicitation registration renewals</h3>
      <p>
        Roughly 40 states plus D.C. require a nonprofit to register before
        soliciting donations from residents of that state — and almost all
        of them require annual renewal, typically alongside a copy of your
        Form 990 and audited financials above certain revenue thresholds.
        If your organization solicits donations nationally (including
        through a website with no geographic restriction, which courts and
        regulators increasingly treat as soliciting everywhere), you may
        owe renewal filings in every state that requires registration —
        each with its own deadline, form, and fee. Many organizations use
        the Unified Registration Statement (URS), accepted by roughly
        two-thirds of registration states, to reduce the paperwork burden,
        but renewal deadlines still vary by state.
      </p>

      <h3>State sales tax exemption renewals</h3>
      <p>
        Some states that grant nonprofits an exemption from sales tax on
        purchases require periodic renewal of that exemption certificate —
        often every few years rather than annually. It&apos;s easy to
        forget because the consequence of lapsing is quiet (you simply
        start paying sales tax you shouldn&apos;t) rather than dramatic, but
        it&apos;s worth a recurring calendar check regardless.
      </p>

      <h3>Registered agent maintenance</h3>
      <p>
        Every state requires a nonprofit corporation to maintain a
        registered agent with a physical address in that state, available
        during business hours to receive legal notices. This isn&apos;t a
        once-a-year filing, but registered agent lapses — an agent who
        moves, resigns, or whose service you stopped paying for — are a
        surprisingly common cause of missed state mail, including the
        notices warning you that a report is overdue.
      </p>

      <h2 id="state-income-tax">State income tax exemption and employment filings</h2>
      <p>
        Two more state-level obligations catch first-time founders off
        guard because they&apos;re easy to assume are automatically covered
        by federal 501(c)(3) status. They&apos;re not.
      </p>
      <h3>State corporate income tax exemption</h3>
      <p>
        Federal 501(c)(3) recognition exempts your organization from{" "}
        <em>federal</em> income tax. Most, but not all, states extend a
        parallel exemption from state corporate income tax — but in a
        number of states, that exemption isn&apos;t automatic and requires
        its own separate application to the state&apos;s department of
        revenue, distinct from both your Articles of Incorporation and
        your federal determination letter. An organization that assumes
        state exemption is automatic can end up owing state income tax it
        never expected, plus penalties for not having filed a state
        corporate return in years it should have.
      </p>
      <h3>State unemployment insurance and workers&apos; compensation</h3>
      <p>
        Once a nonprofit has employees, most states require registration
        for state unemployment insurance, and most require workers&apos;
        compensation coverage — separate systems from the federal payroll
        tax deadlines described above, with their own registration
        deadlines (generally triggered at the point you make your first
        hire, not on an annual cycle) and their own periodic reporting
        after that. Some states offer 501(c)(3) organizations a
        &quot;reimbursable&quot; alternative to standard unemployment
        insurance premiums, which trades a lower ongoing cost for direct
        reimbursement liability if a former employee claims benefits —
        worth evaluating with your accountant once you have staff.
      </p>

      <h3>Multi-state nonprofits: what changes</h3>
      <p>
        An organization that operates, hires, or fundraises across more
        than one state doesn&apos;t just repeat the same obligations in
        each place — it accumulates a separate, independently timed
        checklist per state. A nonprofit incorporated in Ohio that hires a
        remote program director in Georgia and solicits donations
        nationally through its website may owe: an Ohio annual report on
        Ohio&apos;s schedule, foreign qualification in Georgia because it
        now has an employee there, Georgia payroll tax registration, and
        charitable solicitation registration renewals in every state that
        requires one for nationwide online solicitation — each state&apos;s
        deadline calculated independently, often relative to that
        organization&apos;s own fiscal year rather than a single shared
        date. There is no shortcut that consolidates this into one filing;
        the Unified Registration Statement helps with the paperwork burden
        for charitable registration specifically, but incorporation,
        foreign qualification, and payroll registrations remain
        state-by-state. Organizations that grow into multiple states
        often find this is the point where a dedicated compliance
        subscription — rather than a spreadsheet one person maintains —
        starts to earn its cost.
      </p>

      <h2 id="governance-deadlines">Governance and internal deadlines</h2>
      <p>
        Beyond what you owe outside regulators, your own bylaws typically
        create a set of recurring obligations that, while not filed with
        any government agency, are just as important to track — and are
        exactly what an IRS auditor or state attorney general will ask to
        see if your organization is ever reviewed.
      </p>
      <ul>
        <li>
          <strong>Annual board meeting.</strong> Most bylaws (and many state
          nonprofit corporation statutes) require at least one annual
          meeting of the board of directors, at minimum to elect officers
          and review the organization&apos;s finances.
        </li>
        <li>
          <strong>Annual conflict-of-interest disclosure.</strong> IRS Form
          990 Part VI explicitly asks whether your organization requires
          directors and officers to annually disclose conflicts of interest
          — and best practice (often required by your own conflict of
          interest policy) is to collect a signed disclosure from every
          board member and key employee every year.
        </li>
        <li>
          <strong>Minutes review and retention.</strong> Board and committee
          meeting minutes should be finalized, approved at the following
          meeting, and retained according to your document retention
          policy — permanently, in most cases, for corporate governance
          records.
        </li>
        <li>
          <strong>Budget approval.</strong> Most boards approve an annual
          operating budget before or at the start of the fiscal year it
          covers.
        </li>
      </ul>

      <h2 id="month-by-month">Month-by-month compliance calendar</h2>
      <p>
        Here&apos;s how these deadlines lay out across a year for a typical
        calendar-year (Jan 1 – Dec 31 fiscal year) 501(c)(3) with employees
        that solicits donations in its home state. Adjust the federal
        deadlines by shifting them relative to your own fiscal year end if
        it differs, and add a row for every additional state where you
        register to fundraise.
      </p>
      <table>
        <thead>
          <tr>
            <th>Month</th>
            <th>Deadline</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>January</td>
            <td>Jan 31 — W-2s/1099s to employees &amp; contractors; Form 941 (Q4)</td>
          </tr>
          <tr>
            <td>February</td>
            <td>Board reviews prior-year financials in preparation for the 990</td>
          </tr>
          <tr>
            <td>March–April</td>
            <td>Prepare Form 990/990-EZ/990-N; April 30 — Form 941 (Q1)</td>
          </tr>
          <tr>
            <td>May</td>
            <td>May 15 — Form 990 series due (or file Form 8868 for a 6-month extension)</td>
          </tr>
          <tr>
            <td>June</td>
            <td>Many states&apos; annual/biennial corporate report deadlines fall here — check your state</td>
          </tr>
          <tr>
            <td>July</td>
            <td>Jul 31 — Form 941 (Q2); charitable registration renewals often follow ~30–120 days after your 990</td>
          </tr>
          <tr>
            <td>August–September</td>
            <td>Mid-year governance check-in; confirm registered agent and directors are current with the state</td>
          </tr>
          <tr>
            <td>October</td>
            <td>Oct 31 — Form 941 (Q3); Nov 15 extended 990 deadline if you filed Form 8868</td>
          </tr>
          <tr>
            <td>November</td>
            <td>Board approves next year&apos;s budget; annual conflict-of-interest disclosures collected</td>
          </tr>
          <tr>
            <td>December</td>
            <td>Annual board meeting (if not held earlier); year-end donor acknowledgment letters prepared</td>
          </tr>
        </tbody>
      </table>
      <p>
        This is a representative calendar, not a guarantee — your state,
        fiscal year, and specific registrations will shift these dates.
        Treat it as a starting template and confirm every date against the
        IRS and your specific state&apos;s Secretary of State and charity
        regulator websites.
      </p>

      <h2 id="scenario">A worked example: one year at a small nonprofit</h2>
      <p>
        It&apos;s easier to see how these deadlines interact in practice
        than in the abstract. Here&apos;s how a real year might unfold for
        a hypothetical organization — call it Riverside Youth Mentors, a
        calendar-year 501(c)(3) with two part-time staff, an annual budget
        around $85,000, incorporated in one state, and fundraising
        primarily through local donors and one statewide grant.
      </p>
      <p>
        In January, Riverside&apos;s bookkeeper issues W-2s to the two
        staff members and files the Q4 Form 941. In March, the treasurer
        pulls together the prior year&apos;s financials — bank statements,
        the grant award letter, donor records — so the board can review
        them at the April meeting before the 990-EZ is prepared. Because
        Riverside&apos;s gross receipts ($85,000) fall between the 990-N
        and full-990 thresholds, they file Form 990-EZ, not the simpler
        e-Postcard, and it&apos;s due May 15. The board also uses the April
        meeting to collect signed conflict-of-interest disclosures from
        every director for the year.
      </p>
      <p>
        In June, Riverside&apos;s home state requires a biennial corporate
        report — this happens to be an off year, so nothing&apos;s due, but
        the executive director notes the due date for next year on the
        shared calendar anyway. Because Riverside solicits donations only
        within its home state, it renews just one charitable solicitation
        registration, due roughly 90 days after the 990-EZ filing under
        that state&apos;s rules — mid-August. Quarterly payroll filings
        continue in the background every three months regardless of what
        else is happening.
      </p>
      <p>
        By November, the board approves next year&apos;s budget at its
        fall meeting, and by December, the annual board meeting (required
        under Riverside&apos;s bylaws) is held, minutes are drafted, and a
        year-end appeal goes out to donors. None of this required a
        compliance officer or outside counsel — it required one shared
        calendar, one clearly assigned owner (the treasurer, backed up by
        the executive director), and starting each filing two to three
        weeks ahead of its actual deadline rather than on it.
      </p>

      <h2 id="foundation-deadlines">Extra deadlines for private foundations</h2>
      <p>
        If your organization is a private foundation rather than a public
        charity — most commonly because it&apos;s funded by a single family,
        company, or small group of donors rather than broad public support
        — you owe several obligations public charities don&apos;t:
      </p>
      <ul>
        <li>
          <strong>Form 990-PF every year</strong>, with no gross-receipts
          exception — even a foundation with $0 in activity for the year
          still owes a 990-PF.
        </li>
        <li>
          <strong>Excise tax on net investment income</strong> (IRC section
          4940), generally a flat rate on the foundation&apos;s investment
          income, reported and paid with the 990-PF.
        </li>
        <li>
          <strong>Minimum distribution requirement</strong> — private
          foundations must generally distribute at least 5% of the average
          fair market value of their investment assets for qualifying
          purposes each year, or face an excise tax under IRC section 4942
          on the shortfall.
        </li>
        <li>
          <strong>Form 4720</strong> — required if the foundation owes
          excise taxes for prohibited transactions such as self-dealing,
          excess business holdings, or failing the minimum distribution
          requirement.
        </li>
      </ul>
      <p>
        If you&apos;re not sure whether your organization is a public
        charity or a private foundation, see our{" "}
        <Link href="/blog/glossary">nonprofit glossary</Link> entries on the{" "}
        <em>public support test</em> and <em>private foundation</em>.
      </p>

      <h2 id="penalties">What happens if you miss a deadline</h2>
      <p>
        The consequences scale with how badly and how often you&apos;re
        late:
      </p>
      <h3>Late Form 990/990-EZ</h3>
      <p>
        The IRS assesses a per-day penalty for a late 990 or 990-EZ, capped
        based on your organization&apos;s gross receipts — the exact
        dollar amounts adjust periodically for inflation, so check
        irs.gov/form990 for the current figures rather than relying on a
        number that may be out of date by the time you read this. The
        penalty accrues automatically; there&apos;s no grace period beyond
        an approved Form 8868 extension.
      </p>
      <h3>Missed Form 990-N</h3>
      <p>
        There&apos;s no dollar penalty for filing the e-Postcard late in a
        given year, since it&apos;s a notice rather than a return with a
        tax liability attached — but it still counts toward the
        three-strikes automatic revocation rule described above, which is
        the real risk.
      </p>
      <h3>Automatic revocation and reinstatement</h3>
      <p>
        Once status is revoked for three consecutive years of non-filing,
        reinstatement requires filing a new exemption application (Form
        1023 or 1023-EZ, depending on eligibility) with the IRS. Small
        organizations that were eligible to file the 990-N or 990-EZ can
        often use a streamlined retroactive reinstatement process if they
        apply within 15 months of the revocation date, which restores
        exempt status back to the original revocation date and avoids a
        filing gap for donor deductibility purposes. Organizations that
        miss the 15-month window, or that were required to file the full
        990, generally must apply for reinstatement effective only from the
        postmark date of the new application — meaning any donations made
        during the gap were not tax-deductible.
      </p>
      <h3>State administrative dissolution</h3>
      <p>
        Reinstatement after state administrative dissolution generally
        requires filing every report you missed (with back fees) plus a
        reinstatement application and fee. Some states also require
        confirming your corporate name hasn&apos;t been taken by another
        entity in the meantime — which does happen, particularly to
        organizations with generic or popular names.
      </p>

      <h2 id="staying-on-top">How to never miss a deadline again</h2>
      <p>
        Every organization that&apos;s been through an automatic revocation
        says the same thing afterward: it happened because deadline
        tracking lived in one person&apos;s head — usually a founder,
        treasurer, or bookkeeper — and that person got busy, changed roles,
        or left. A few practices fix this reliably:
      </p>
      <ol>
        <li>
          <strong>Put every deadline on a shared calendar</strong>, not an
          individual&apos;s inbox — a board or staff Google Calendar that
          survives personnel changes.
        </li>
        <li>
          <strong>Assign a named owner and a backup</strong> for each
          recurring filing, reviewed annually at your board meeting.
        </li>
        <li>
          <strong>Build in a buffer</strong> — target completing each
          filing 2–3 weeks before the actual deadline, not on the deadline
          itself, so a discovered problem still leaves time to fix it.
        </li>
        <li>
          <strong>Use a compliance tracking service</strong> rather than
          memory. FormRight&apos;s Comply plan tracks your organization&apos;s
          specific federal and state deadlines and sends reminders before
          each one is due — see how it works on our{" "}
          <Link href="/onboard">onboarding page</Link>.
        </li>
      </ol>

      <h2 id="faq">Frequently asked questions</h2>
      <h3>Does my nonprofit need to file anything if it had no income this year?</h3>
      <p>
        Yes. Even a nonprofit with $0 in activity for the year still owes
        at minimum a Form 990-N, and private foundations owe a Form 990-PF
        regardless of activity level. &quot;Nothing happened this year&quot;
        is not an exception to the filing requirement.
      </p>
      <h3>My nonprofit is brand new — when does the clock start?</h3>
      <p>
        Your first 990 filing is generally due based on your organization&apos;s
        actual fiscal year, even a short first year. If you incorporated in
        September and use a calendar fiscal year, your first Form 990
        series filing covers September through December and is still due
        the following May 15.
      </p>
      <h3>Do churches have to follow this calendar?</h3>
      <p>
        Churches, their integrated auxiliaries, and conventions or
        associations of churches are generally exempt from the annual Form
        990 filing requirement (though not from other obligations like
        payroll tax if they have employees). Most other religious
        organizations that aren&apos;t churches in this specific technical
        sense — many faith-based nonprofits, for example — do still need to
        file.
      </p>
      <h3>What if I&apos;m not sure which states require charitable registration for my organization?</h3>
      <p>
        Start from where you&apos;re incorporated and where you actively
        solicit donations — including through an online donate button
        without geographic restriction, which many states treat as
        soliciting their residents. Because registration requirements
        change and vary significantly by state, this is one area worth
        confirming directly against each state&apos;s charity regulator
        rather than relying on a general guide.
      </p>
      <h3>Do state and federal deadlines ever conflict with each other?</h3>
      <p>
        Not usually in the sense of requiring contradictory action, but
        they frequently cluster — many states set charitable registration
        renewal deadlines relative to your 990 filing date specifically so
        the two line up, which means a slip on your federal 990 can cascade
        into a late state renewal too. Treat the 990 as the anchor date
        your other filings depend on, not an isolated deadline.
      </p>
      <h3>What&apos;s the difference between losing good standing and losing tax-exempt status?</h3>
      <p>
        They&apos;re separate systems with separate consequences. Losing
        state good standing (from a missed annual report) affects your
        ability to operate as a corporation in that state — sign
        contracts, maintain your name — and can lead to state
        administrative dissolution. Losing federal tax-exempt status (from
        three years of missed 990 filings) affects donor deductibility and
        your standing with the IRS. An organization can be out of
        compliance with one and fine on the other, but both are worth
        tracking independently since neither protects you from the other.
      </p>
      <h3>Should a very small, all-volunteer nonprofit still bother with a formal calendar?</h3>
      <p>
        Especially a small one. Small organizations are the ones most
        likely to lose track of a filing during a leadership transition,
        precisely because there&apos;s no dedicated staff whose job it is
        to notice. A shared calendar costs nothing and is the single
        highest-leverage thing a volunteer-run board can do to protect its
        exempt status.
      </p>
      <h3>Who on our team should actually own the compliance calendar?</h3>
      <p>
        Whoever has the most continuity, not necessarily the most
        expertise — a treasurer or executive director who&apos;s likely to
        stay with the organization for several years is a better owner
        than a rotating volunteer position, even if the volunteer has more
        accounting background. Pair that person with a named backup and
        review the assignment at your annual board meeting, so a single
        departure never leaves the calendar with no owner at all.
      </p>
      <h3>How does FormRight help with ongoing compliance?</h3>
      <p>
        Beyond initial formation, FormRight&apos;s Comply subscription
        tracks your organization&apos;s specific federal and state filing
        calendar and sends reminders ahead of each deadline, so compliance
        doesn&apos;t depend on one person remembering. Learn more or{" "}
        <Link href="/onboard">get started</Link>, or read our guide to{" "}
        <Link href="/blog/form-990-n-guide">filing Form 990-N</Link> if
        that&apos;s your next deadline.
      </p>
    </BlogShell>
  );
}
