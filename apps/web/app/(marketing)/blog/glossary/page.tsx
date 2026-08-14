import type { Metadata } from "next";
import Link from "next/link";
import BlogShell from "@/components/marketing/BlogShell";

export const metadata: Metadata = {
  title: "Nonprofit Formation Glossary: 35+ Terms Every Founder Should Know — FormRight",
  description:
    "Plain-language definitions of the IRS, state, and governance terms every nonprofit founder runs into — from 501(c)(3) and the public support test to UBIT and whistleblower policies.",
};

const TOC = [
  { id: "term-501c3", label: "501(c)(3)" },
  { id: "term-501c4", label: "501(c)(4)" },
  { id: "term-articles", label: "Articles of Incorporation" },
  { id: "term-revocation", label: "Automatic Revocation" },
  { id: "term-board", label: "Board of Directors" },
  { id: "term-bylaws", label: "Bylaws" },
  { id: "term-charitable-reg", label: "Charitable Solicitation Registration" },
  { id: "term-coi", label: "Conflict of Interest Policy" },
  { id: "term-determination", label: "Determination Letter" },
  { id: "term-ein", label: "EIN (Employer Identification Number)" },
  { id: "term-excess-benefit", label: "Excess Benefit Transaction" },
  { id: "term-exempt-purpose", label: "Exempt Purpose" },
  { id: "term-fiscal-sponsorship", label: "Fiscal Sponsorship" },
  { id: "term-990", label: "Form 990" },
  { id: "term-990ez", label: "Form 990-EZ" },
  { id: "term-990n", label: "Form 990-N (e-Postcard)" },
  { id: "term-990pf", label: "Form 990-PF" },
  { id: "term-990t", label: "Form 990-T" },
  { id: "term-foreign-qual", label: "Foreign Qualification" },
  { id: "term-gift-acceptance", label: "Gift Acceptance Policy" },
  { id: "term-group-exemption", label: "Group Exemption" },
  { id: "term-incorporator", label: "Incorporator" },
  { id: "term-intermediate-sanctions", label: "Intermediate Sanctions" },
  { id: "term-mission", label: "Mission Statement" },
  { id: "term-nonprofit-corp", label: "Nonprofit Corporation" },
  { id: "term-private-foundation", label: "Private Foundation" },
  { id: "term-private-inurement", label: "Private Inurement" },
  { id: "term-public-charity", label: "Public Charity" },
  { id: "term-public-support-test", label: "Public Support Test" },
  { id: "term-registered-agent", label: "Registered Agent" },
  { id: "term-restricted-funds", label: "Restricted Funds" },
  { id: "term-standing", label: "Standing (Good Standing)" },
  { id: "term-tax-exempt", label: "Tax-Exempt Status" },
  { id: "term-ubit", label: "UBIT (Unrelated Business Income Tax)" },
  { id: "term-whistleblower", label: "Whistleblower Policy" },
];

export default function GlossaryPage() {
  return (
    <BlogShell
      category="Reference"
      title="Nonprofit Formation Glossary: 35+ Terms Every Founder Should Know"
      dek="Plain-language definitions for the IRS, state, and governance terms you'll run into while forming and running a 501(c)(3) — alphabetical, cross-linked, and free of jargon-on-jargon."
      meta={<>Reference guide &nbsp;·&nbsp; Updated August 2026 &nbsp;·&nbsp; 35 terms</>}
      toc={TOC}
    >
      <p>
        Nonprofit formation comes with its own vocabulary, and a lot of it
        sounds similar without meaning the same thing — &quot;tax-exempt&quot;
        and &quot;nonprofit corporation&quot; are not interchangeable,
        &quot;private foundation&quot; is not just a fancier way of saying
        &quot;nonprofit,&quot; and an &quot;excess benefit transaction&quot;
        is a specific, defined thing with real financial consequences. This
        glossary defines the terms you&apos;ll actually encounter while
        forming and running a 501(c)(3), with links to our deeper guides on{" "}
        <Link href="/blog/nonprofit-compliance-calendar">
          compliance deadlines
        </Link>
        , <Link href="/blog/form-990-n-guide">Form 990-N</Link>, and{" "}
        <Link href="/blog/best-nonprofit-formation-service">
          choosing a formation service
        </Link>{" "}
        where a term connects to a longer explanation.
      </p>

      <h2 id="term-501c3">501(c)(3)</h2>
      <p>
        The section of the Internal Revenue Code that describes
        organizations exempt from federal income tax because they&apos;re
        organized and operated for charitable, religious, educational,
        scientific, or certain other specified purposes. It&apos;s the
        classification most people mean when they say &quot;nonprofit,&quot;
        and it&apos;s the only common exemption category where donor
        contributions are generally tax-deductible.
      </p>

      <h2 id="term-501c4">501(c)(4)</h2>
      <p>
        A separate tax-exempt category for &quot;social welfare&quot;
        organizations. Like a 501(c)(3), a 501(c)(4) doesn&apos;t pay
        federal income tax — but unlike a 501(c)(3), donations to it are
        generally <em>not</em> tax-deductible, and it can engage in
        substantially more lobbying and political activity. Some
        organizations operate a 501(c)(3) and an affiliated 501(c)(4) side
        by side to separate charitable programming from advocacy work.
      </p>

      <h2 id="term-articles">Articles of Incorporation</h2>
      <p>
        The foundational document filed with your state&apos;s Secretary of
        State (or equivalent office) that legally creates your nonprofit
        corporation. For 501(c)(3) eligibility, the articles must include
        specific language the IRS requires — an exempt-purpose clause
        limiting your activities to those permitted under 501(c)(3), and a
        dissolution clause committing your assets to another exempt
        organization if you ever wind down. A generic corporation template
        usually won&apos;t include this language by default.
      </p>

      <h2 id="term-revocation">Automatic Revocation</h2>
      <p>
        The loss of 501(c)(3) tax-exempt status that happens automatically
        — no warning, no hearing — when an organization fails to file its
        required annual return or notice (Form 990, 990-EZ, 990-N, or
        990-PF) for three consecutive years. It&apos;s the single most
        common way small nonprofits lose their exempt status. See our{" "}
        <Link href="/blog/nonprofit-compliance-calendar">
          compliance calendar guide
        </Link>{" "}
        for how to avoid it.
      </p>

      <h2 id="term-board">Board of Directors</h2>
      <p>
        The governing body legally responsible for overseeing a nonprofit
        corporation — setting strategy, hiring and overseeing the
        executive director, approving budgets, and holding fiduciary
        duties of care, loyalty, and obedience to the organization&apos;s
        mission. Nonprofit corporations generally require a minimum number
        of directors under state law, commonly three.
      </p>

      <h2 id="term-bylaws">Bylaws</h2>
      <p>
        The internal rulebook governing how your nonprofit operates —
        board size and structure, how and when meetings happen, officer
        roles and terms, voting and quorum rules, and how the bylaws
        themselves can be amended. Unlike the Articles of Incorporation,
        bylaws generally aren&apos;t filed with the state, but the IRS
        expects to see them as part of a 501(c)(3) application.
      </p>

      <h2 id="term-charitable-reg">Charitable Solicitation Registration</h2>
      <p>
        A state-level registration — separate from and in addition to
        incorporating with the state — required before a nonprofit can
        legally solicit donations from that state&apos;s residents.
        Roughly 40 states plus D.C. require it, most with annual renewal.
        Organizations that fundraise nationally, including through an
        unrestricted donate button on a website, may owe registration in
        every state that requires it.
      </p>

      <h2 id="term-coi">Conflict of Interest Policy</h2>
      <p>
        A governance policy requiring board members, officers, and key
        employees to disclose situations where their personal or financial
        interests could conflict with the organization&apos;s. IRS Form
        990 specifically asks whether your organization has adopted one
        and whether it collects annual disclosures under it.
      </p>

      <h2 id="term-determination">Determination Letter</h2>
      <p>
        The official letter the IRS sends confirming your organization has
        been recognized as tax-exempt under 501(c)(3), issued after review
        of your Form 1023 or 1023-EZ application. It&apos;s the document
        funders, banks, and state charity regulators will typically ask to
        see as proof of your exempt status.
      </p>

      <h2 id="term-ein">EIN (Employer Identification Number)</h2>
      <p>
        A nine-digit number the IRS assigns to identify your organization
        for tax purposes — functionally, a Social Security number for your
        nonprofit. You need one to open a bank account, apply for
        501(c)(3) status, and file any Form 990. Obtained via IRS Form
        SS-4, and free to apply for directly through the IRS.
      </p>

      <h2 id="term-excess-benefit">Excess Benefit Transaction</h2>
      <p>
        A transaction in which an organization provides an economic
        benefit to an insider (a board member, officer, or other
        &quot;disqualified person&quot;) worth more than what that insider
        provides in return — for example, paying an executive director
        significantly above fair market compensation. It triggers{" "}
        <a href="#term-intermediate-sanctions">intermediate sanctions</a>{" "}
        excise taxes on the insider (and potentially board members who
        approved it), as an alternative to the IRS revoking the
        organization&apos;s exemption outright.
      </p>

      <h2 id="term-exempt-purpose">Exempt Purpose</h2>
      <p>
        One of the specific categories of activity the IRS recognizes as
        qualifying for 501(c)(3) status: charitable, religious,
        educational, scientific, literary, testing for public safety,
        fostering national or international amateur sports competition, or
        preventing cruelty to children or animals. Your Articles of
        Incorporation must state that your organization is organized
        exclusively for one or more of these purposes.
      </p>

      <h2 id="term-fiscal-sponsorship">Fiscal Sponsorship</h2>
      <p>
        An arrangement in which an established 501(c)(3) extends its
        tax-exempt status to a project that hasn&apos;t yet formed its own
        nonprofit — letting the project accept tax-deductible donations
        and apply for grants under the sponsor&apos;s umbrella while it
        gets off the ground. A common bridge for founders who want to test
        an idea before committing to full incorporation.
      </p>

      <h2 id="term-990">Form 990</h2>
      <p>
        The full annual information return required for 501(c)(3)
        organizations with gross receipts of $200,000 or more, or total
        assets of $500,000 or more — including detailed financial
        statements, program descriptions, and governance and compensation
        disclosures. See our{" "}
        <Link href="/blog/nonprofit-compliance-calendar">
          compliance calendar guide
        </Link>{" "}
        for the full Form 990 series and its deadlines.
      </p>

      <h2 id="term-990ez">Form 990-EZ</h2>
      <p>
        The mid-sized annual return for organizations with gross receipts
        under $200,000 and total assets under $500,000 — shorter than the
        full Form 990 but still requiring financial statements and program
        information, unlike the minimal 990-N.
      </p>

      <h2 id="term-990n">Form 990-N (e-Postcard)</h2>
      <p>
        The short, entirely electronic annual notice for organizations
        with gross receipts normally $50,000 or less. It asks for eight
        basic pieces of information and has no financial statements
        attached. See our{" "}
        <Link href="/blog/form-990-n-guide">complete Form 990-N filing guide</Link>.
      </p>

      <h2 id="term-990pf">Form 990-PF</h2>
      <p>
        The annual return every private foundation must file, regardless
        of size — there&apos;s no gross-receipts exception the way there
        is for public charities. It also reports the foundation&apos;s
        excise tax on net investment income and its progress toward the
        minimum distribution requirement.
      </p>

      <h2 id="term-990t">Form 990-T</h2>
      <p>
        The return used to report and pay Unrelated Business Income Tax
        (see <a href="#term-ubit">UBIT</a>), filed by any exempt
        organization with more than $1,000 in gross income from an
        unrelated trade or business.
      </p>

      <h2 id="term-foreign-qual">Foreign Qualification</h2>
      <p>
        The process of registering to legally operate in a state other
        than the one where your nonprofit originally incorporated. A
        nonprofit incorporated in Delaware that hires staff or operates
        programs in California, for example, would generally need to
        foreign-qualify in California — separate from any charitable
        solicitation registration it might also owe there.
      </p>

      <h2 id="term-gift-acceptance">Gift Acceptance Policy</h2>
      <p>
        A governance policy establishing what kinds of donations an
        organization will and won&apos;t accept — cash, real estate,
        cryptocurrency, restricted gifts with unusual conditions attached —
        and the internal process for reviewing and accepting non-cash or
        complex gifts.
      </p>

      <h2 id="term-group-exemption">Group Exemption</h2>
      <p>
        A mechanism that lets a central or parent organization extend
        501(c)(3) recognition to affiliated subordinate organizations
        under it — a national organization&apos;s local chapters, for
        example — without each subordinate filing its own separate
        exemption application.
      </p>

      <h2 id="term-incorporator">Incorporator</h2>
      <p>
        The person who signs and files the Articles of Incorporation to
        legally bring the nonprofit corporation into existence. The
        incorporator&apos;s formal role typically ends once the initial
        board of directors is seated and takes over governance.
      </p>

      <h2 id="term-intermediate-sanctions">Intermediate Sanctions</h2>
      <p>
        Excise taxes the IRS can impose on an insider who received an{" "}
        <a href="#term-excess-benefit">excess benefit transaction</a> from
        a public charity — and in some cases on board members who knowingly
        approved it — as a penalty short of revoking the organization&apos;s
        entire tax-exempt status.
      </p>

      <h2 id="term-mission">Mission Statement</h2>
      <p>
        A concise statement of an organization&apos;s core purpose and the
        change it exists to create. Not itself a legal filing requirement,
        but commonly requested in governance documents, grant applications,
        and the narrative portion of an IRS 1023 application.
      </p>

      <h2 id="term-nonprofit-corp">Nonprofit Corporation</h2>
      <p>
        The state-law legal entity structure most 501(c)(3) organizations
        use — distinct from &quot;tax-exempt,&quot; which is a federal tax
        status, not a state entity type. Incorporating as a nonprofit
        corporation with your state is necessary but not sufficient for
        501(c)(3) status; the two are separate steps handled by separate
        governments. See{" "}
        <a href="#term-tax-exempt">Tax-Exempt Status</a> below.
      </p>

      <h2 id="term-private-foundation">Private Foundation</h2>
      <p>
        A 501(c)(3) organization that doesn&apos;t meet the{" "}
        <a href="#term-public-support-test">public support test</a> —
        typically because it&apos;s funded by a single family, company, or
        small group of donors rather than broad public support. Private
        foundations face additional obligations a{" "}
        <a href="#term-public-charity">public charity</a> doesn&apos;t: a
        mandatory Form 990-PF every year, an excise tax on net investment
        income, and a minimum annual distribution requirement. See the
        foundation-specific deadlines in our{" "}
        <Link href="/blog/nonprofit-compliance-calendar">
          compliance calendar guide
        </Link>
        .
      </p>

      <h2 id="term-private-inurement">Private Inurement</h2>
      <p>
        The prohibited use of a nonprofit&apos;s net earnings to benefit an
        insider — a founder, board member, or officer. Unlike an{" "}
        <a href="#term-excess-benefit">excess benefit transaction</a>,
        which can sometimes be corrected with a penalty, private inurement
        is an absolute prohibition with no minimum dollar threshold, and
        can jeopardize the organization&apos;s exempt status entirely if
        significant.
      </p>

      <h2 id="term-public-charity">Public Charity</h2>
      <p>
        The default 501(c)(3) classification for organizations that pass
        the <a href="#term-public-support-test">public support test</a> —
        the large majority of 501(c)(3)s, as opposed to the smaller
        category of <a href="#term-private-foundation">private
        foundations</a>. Public charities don&apos;t face the private
        foundation&apos;s minimum distribution requirement or investment
        income excise tax.
      </p>

      <h2 id="term-public-support-test">Public Support Test</h2>
      <p>
        The IRS test that determines whether an organization qualifies as
        a public charity rather than a private foundation, based on
        whether it receives a sufficiently broad base of public support
        (government grants, contributions from many different donors,
        program service revenue) rather than concentrated funding from a
        small number of sources.
      </p>

      <h2 id="term-registered-agent">Registered Agent</h2>
      <p>
        A person or company designated to receive legal notices — lawsuits,
        state correspondence, annual report reminders — on behalf of your
        nonprofit corporation in every state where it&apos;s registered.
        Every state requires one with a physical, not P.O. box, address in
        that state.
      </p>

      <h2 id="term-restricted-funds">Restricted Funds</h2>
      <p>
        Donations a donor has designated for a specific purpose — a
        particular program, a capital project, an endowment — which the
        organization is legally obligated to use only for that purpose, as
        opposed to unrestricted funds usable for general operations.
      </p>

      <h2 id="term-standing">Standing (Good Standing)</h2>
      <p>
        A corporation&apos;s status when it has met its state filing
        obligations — annual/biennial reports filed, registered agent
        current, fees paid. Falling out of good standing is typically the
        step immediately before a state administratively dissolves a
        nonprofit corporation that stays delinquent.
      </p>

      <h2 id="term-tax-exempt">Tax-Exempt Status</h2>
      <p>
        Exemption from federal income tax under section 501(a) of the
        Internal Revenue Code, granted after the IRS approves a 501(c)(3)
        (or other 501(c) subsection) application. It&apos;s a federal tax
        status, separate from the state-law act of incorporating as a{" "}
        <a href="#term-nonprofit-corp">nonprofit corporation</a> and
        separate again from any state sales or property tax exemptions,
        which require their own applications.
      </p>

      <h2 id="term-ubit">UBIT (Unrelated Business Income Tax)</h2>
      <p>
        Tax owed on income from a trade or business an exempt organization
        regularly carries on that isn&apos;t substantially related to its
        exempt purpose — a nonprofit-run coffee shop open to the general
        public, for instance, as opposed to occasional volunteer-run
        fundraising sales. Reported on{" "}
        <a href="#term-990t">Form 990-T</a> when gross unrelated business
        income exceeds $1,000.
      </p>

      <h2 id="term-whistleblower">Whistleblower Policy</h2>
      <p>
        A governance policy protecting employees, volunteers, and board
        members who report suspected misconduct in good faith from
        retaliation. Like the conflict of interest policy, IRS Form 990
        specifically asks whether your organization has adopted one.
      </p>

      <p>
        Ready to put these into practice? See how the pieces fit together
        in our guides to{" "}
        <Link href="/blog/nonprofit-compliance-calendar">
          nonprofit compliance deadlines
        </Link>
        , <Link href="/blog/form-990-n-guide">filing Form 990-N</Link>, and{" "}
        <Link href="/blog/best-nonprofit-formation-service">
          choosing a formation service
        </Link>
        , or <Link href="/onboard">start forming your nonprofit</Link> with
        FormRight directly.
      </p>
    </BlogShell>
  );
}
