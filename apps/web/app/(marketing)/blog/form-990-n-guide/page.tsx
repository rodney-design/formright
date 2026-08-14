import type { Metadata } from "next";
import Link from "next/link";
import BlogShell from "@/components/marketing/BlogShell";

export const metadata: Metadata = {
  title: "Form 990-N (e-Postcard): Complete Filing Guide — FormRight",
  description:
    "Who has to file Form 990-N, exactly what information it asks for, how to submit it on the IRS website, and what happens if you file late — a step-by-step guide for small nonprofits.",
};

const TOC = [
  { id: "what-is-990n", label: "What is Form 990-N?" },
  { id: "who-must-file", label: "Who must file the e-Postcard" },
  { id: "gross-receipts", label: "How the IRS defines \"gross receipts\"" },
  { id: "who-should-not-file", label: "Who should not file 990-N" },
  { id: "comparison", label: "990-N vs. 990-EZ vs. 990, side by side" },
  { id: "information-needed", label: "Information you'll need" },
  { id: "how-to-file", label: "Step-by-step: how to file" },
  { id: "walkthrough", label: "A worked example" },
  { id: "deadline", label: "Filing deadline & your fiscal year" },
  { id: "after-filing", label: "What to do after you file" },
  { id: "filing-late", label: "What happens if you file late" },
  { id: "outgrew-990n", label: "What if you've outgrown the 990-N?" },
  { id: "mistakes", label: "Common mistakes" },
  { id: "faq", label: "Frequently asked questions" },
];

export default function Form990NGuidePage() {
  return (
    <BlogShell
      category="IRS Filings"
      title="Form 990-N (e-Postcard): The Complete Filing Guide for Small Nonprofits"
      dek="Everything a small 501(c)(3) needs to know to file the annual e-Postcard correctly — who has to file it, what it asks, and how to actually submit it on the IRS website."
      meta={<>14 min read &nbsp;·&nbsp; Updated August 2026 &nbsp;·&nbsp; Applies to organizations with gross receipts normally ≤ $50,000</>}
      toc={TOC}
    >
      <p>
        If your nonprofit is small enough, the IRS doesn&apos;t ask you for
        financial statements, program descriptions, or compensation
        disclosures every year — it asks for eight pieces of basic
        information, submitted through a short online form, in a process
        that takes most organizations under ten minutes. That&apos;s Form
        990-N, officially the &quot;Electronic Notice (e-Postcard) for
        Tax-Exempt Organizations Not Required to File Form 990 or
        990-EZ.&quot; It sounds like a small thing. It is also the filing
        most responsible for small nonprofits accidentally losing their
        tax-exempt status, because it&apos;s easy to assume something this
        short doesn&apos;t really matter. It does.
      </p>
      <p>
        This guide walks through exactly who has to file it, what
        information it requires, how to submit it, and what the real
        consequences of missing it are. For the full annual compliance
        picture beyond just this one form, see our{" "}
        <Link href="/blog/nonprofit-compliance-calendar">
          nonprofit compliance calendar
        </Link>
        .
      </p>

      <h2 id="what-is-990n">What is Form 990-N?</h2>
      <p>
        Form 990-N is the simplest of the four returns that make up the
        Form 990 series — the annual information returns tax-exempt
        organizations file with the IRS in lieu of an income tax return
        (exempt organizations generally don&apos;t pay federal income tax on
        income related to their exempt purpose, but they still have to
        report on their activities and finances every year). Unlike the
        full Form 990 or the mid-sized Form 990-EZ, the 990-N exists
        entirely online — there is no paper version, no PDF, and no
        financial statements attached. It&apos;s a short electronic notice
        confirming that your organization still exists, is still small
        enough to qualify for this simplified filing, and gives the IRS a
        current address and contact.
      </p>
      <p>
        The e-Postcard was created by the Pension Protection Act of 2006,
        which for the first time required small tax-exempt organizations —
        previously exempt from any annual filing requirement at all — to
        file something every year. Before that law, thousands of small
        nonprofits with negligible income simply never appeared on the
        IRS&apos;s radar after their initial exemption determination, and a
        significant number turned out to be defunct without anyone
        updating the IRS. The 990-N (and the three-year automatic
        revocation rule that came with it) was the fix.
      </p>

      <h2 id="who-must-file">Who must file the e-Postcard</h2>
      <p>
        Your organization is generally eligible — and required — to file
        Form 990-N if:
      </p>
      <ul>
        <li>
          It is recognized as tax-exempt under section 501(a) of the
          Internal Revenue Code (most commonly 501(c)(3), but the e-Postcard
          applies to other 501(c) subsections too).
        </li>
        <li>
          Its <strong>gross receipts are normally $50,000 or less</strong>.
          &quot;Normally&quot; is a specific IRS term with its own averaging
          rules — broadly, it looks at a rolling average over the current
          and prior two years (for organizations that have existed at
          least three years), so a single unusually large year
          doesn&apos;t automatically disqualify you the following year.
        </li>
        <li>
          It is not a private foundation (private foundations always file
          Form 990-PF regardless of size).
        </li>
        <li>
          It is not otherwise excused from filing entirely, as churches and
          certain church-affiliated organizations are.
        </li>
      </ul>
      <p>
        Note that filing the 990-N is a choice within a range, not a strict
        requirement at exactly $50,000 — an organization under the
        threshold can choose to file the more detailed Form 990-EZ instead
        if, for example, it wants to present more complete financial
        information to funders or the public. But it cannot go the other
        direction: an organization over the threshold must file the 990-EZ
        or full 990, not the e-Postcard.
      </p>

      <h2 id="gross-receipts">How the IRS defines &quot;gross receipts&quot;</h2>
      <p>
        The $50,000 threshold sounds simple until you try to calculate it,
        because &quot;gross receipts&quot; means something specific to the
        IRS — it&apos;s <em>not</em> the same as net income, and it&apos;s
        not simply your bank deposits for the year.
      </p>
      <p>
        Gross receipts means the total amount your organization received
        from all sources during its annual accounting period, before
        subtracting any costs or expenses. If your nonprofit ran a $10,000
        gala that cost $4,000 to put on, gross receipts count the full
        $10,000 — not the $6,000 net. Donations, grants, program service
        revenue, membership dues, and investment income all count toward
        the total.
      </p>
      <p>
        The &quot;normally&quot; qualifier matters just as much as the
        dollar figure. The IRS doesn&apos;t require gross receipts under
        $50,000 in every single year without exception — it applies an
        averaging test:
      </p>
      <ul>
        <li>
          An organization in its first tax year qualifies if it expects to
          receive $75,000 or less.
        </li>
        <li>
          An organization in its first two years qualifies if it received
          $75,000 or less on average over those years.
        </li>
        <li>
          An organization that&apos;s been around three years or more
          qualifies if the average of the immediately preceding three
          years (including the year being filed for) is $50,000 or less.
        </li>
      </ul>
      <p>
        In practice, this means a single unusually large year — a big
        one-time bequest, for example — doesn&apos;t automatically knock an
        otherwise-small organization out of e-Postcard eligibility the
        following year, as long as the three-year average still comes in
        under the threshold.
      </p>

      <h2 id="who-should-not-file">Who should not file 990-N</h2>
      <p>A few categories of organizations should not use the e-Postcard:</p>
      <ul>
        <li>
          <strong>Organizations with gross receipts over $50,000</strong> —
          file Form 990-EZ (generally under $200,000 in receipts and
          under $500,000 in total assets) or the full Form 990 instead.
        </li>
        <li>
          <strong>Private foundations</strong> — always file Form 990-PF,
          with no gross-receipts exception, even at $0 in activity.
        </li>
        <li>
          <strong>Churches, their integrated auxiliaries, and conventions
          or associations of churches</strong> — generally excused from the
          annual filing requirement entirely, though many choose to file
          voluntarily for transparency.
        </li>
        <li>
          <strong>Organizations included in a group return</strong> — if
          your organization is a subordinate covered by a parent
          organization&apos;s group exemption and group return, you
          generally don&apos;t file your own 990-N separately; confirm with
          your parent organization.
        </li>
        <li>
          <strong>Organizations that have terminated</strong> — if your
          nonprofit has formally dissolved, you generally file a final
          return (990, 990-EZ, or a final 990-N indicating termination)
          rather than continuing routine e-Postcard filings.
        </li>
      </ul>

      <h2 id="comparison">990-N vs. 990-EZ vs. 990, side by side</h2>
      <p>
        Seeing the three most common versions of the annual return next to
        each other makes clear how much simpler the e-Postcard really is —
        and how much more the next tier up actually asks for:
      </p>
      <table>
        <thead>
          <tr>
            <th></th>
            <th>Form 990-N</th>
            <th>Form 990-EZ</th>
            <th>Form 990</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Threshold</td>
            <td>Gross receipts normally ≤ $50,000</td>
            <td>Gross receipts &lt; $200,000 and assets &lt; $500,000</td>
            <td>Gross receipts ≥ $200,000 or assets ≥ $500,000</td>
          </tr>
          <tr>
            <td>Format</td>
            <td>Online-only, 8 data fields</td>
            <td>Paper or e-file, multi-page form</td>
            <td>Paper or e-file, multi-page form + schedules</td>
          </tr>
          <tr>
            <td>Financial statements required</td>
            <td>No</td>
            <td>Yes, summarized</td>
            <td>Yes, detailed</td>
          </tr>
          <tr>
            <td>Extension available</td>
            <td>No (none needed)</td>
            <td>Yes, via Form 8868</td>
            <td>Yes, via Form 8868</td>
          </tr>
          <tr>
            <td>Late penalty</td>
            <td>None directly (counts toward 3-year revocation rule)</td>
            <td>Per-day penalty, capped by gross receipts</td>
            <td>Per-day penalty, capped by gross receipts (higher cap)</td>
          </tr>
          <tr>
            <td>Public disclosure detail</td>
            <td>Minimal — basic identifying info only</td>
            <td>Moderate — summarized finances, some governance questions</td>
            <td>Extensive — full finances, compensation, governance</td>
          </tr>
        </tbody>
      </table>

      <h2 id="information-needed">Information you&apos;ll need</h2>
      <p>
        The e-Postcard asks for eight items. Gather these before you start
        — the online system doesn&apos;t save partial progress across
        sessions in every case, so it&apos;s faster to have everything on
        hand:
      </p>
      <ol>
        <li>
          <strong>Employer Identification Number (EIN)</strong> — the
          nine-digit number the IRS assigned your organization. This is how
          the system looks up your organization&apos;s record.
        </li>
        <li>
          <strong>Tax year</strong> — the fiscal year the filing covers.
        </li>
        <li>
          <strong>Legal name and mailing address</strong> — as currently on
          file with the IRS. If either has changed since your last filing
          (or your original determination letter), the 990-N filing is also
          where you update it.
        </li>
        <li>
          <strong>Any other names the organization uses</strong> — a
          &quot;doing business as&quot; name, for example.
        </li>
        <li>
          <strong>Name and address of a principal officer</strong> — the
          person the IRS should be able to contact.
        </li>
        <li>
          <strong>Website address</strong>, if the organization has one
          (this field can be left blank if not).
        </li>
        <li>
          <strong>Confirmation that gross receipts are normally $50,000 or
          less.</strong>
        </li>
        <li>
          <strong>Confirmation of whether the organization has terminated
          or is in the process of terminating.</strong>
        </li>
      </ol>
      <p>
        That&apos;s the entire form. There are no financial statement
        uploads, no program descriptions, and no compensation disclosures —
        which is exactly what makes the 990-N faster than the alternative
        filings, and also why it&apos;s so easy to underestimate how much
        it matters.
      </p>

      <h2 id="how-to-file">Step-by-step: how to file Form 990-N</h2>
      <p>
        The e-Postcard is filed exclusively online, directly through the
        IRS&apos;s website — there is no third-party requirement to use a
        paid preparer for a filing this simple, though services exist that
        will do it for you if you&apos;d rather not.
      </p>
      <ol>
        <li>
          <strong>Go to the IRS e-Postcard filing system</strong> at
          irs.gov and search for &quot;Form 990-N&quot; if you don&apos;t
          have the direct link bookmarked — the IRS periodically changes
          the exact URL and login system, so search rather than relying on
          an old bookmark.
        </li>
        <li>
          <strong>Sign in or create an account.</strong> The IRS has moved
          e-Postcard filing behind a Login.gov (or ID.me, depending on the
          current IRS system) identity-verified account. If this is your
          organization&apos;s first time filing since the account system
          changed, budget extra time for identity verification.
        </li>
        <li>
          <strong>Look up your organization by EIN</strong> to confirm the
          system has the correct existing record on file.
        </li>
        <li>
          <strong>Enter the eight data points</strong> listed above for the
          tax year you&apos;re filing.
        </li>
        <li>
          <strong>Review and submit.</strong> The system will generally
          confirm submission immediately.
        </li>
        <li>
          <strong>Save your confirmation.</strong> Keep the submission
          confirmation with your organization&apos;s permanent records —
          treat it the same as you would a filed tax return, in case a
          question ever comes up about whether or when you filed.
        </li>
      </ol>
      <p>
        There is no fee to file Form 990-N.
      </p>
      <h3>If something goes wrong during filing</h3>
      <p>
        A few issues come up often enough to plan around. If the system
        doesn&apos;t recognize your EIN, double-check it against your
        original IRS determination letter rather than a document that
        might have a typo — a single transposed digit is the most common
        cause. If your organization&apos;s name or address in the system
        doesn&apos;t match your current records, the e-Postcard filing is
        exactly where you update it going forward; there&apos;s no separate
        change-of-address form required first. If you&apos;re filing for
        the first time after your organization was recently approved for
        exemption, allow a little extra time — new organizations sometimes
        aren&apos;t yet reflected in the filing system in the first few
        weeks after IRS approval, and trying again a week or two later
        usually resolves it.
      </p>

      <h2 id="walkthrough">A worked example</h2>
      <p>
        Consider a hypothetical organization — Maple Street Community
        Garden, a two-year-old 501(c)(3) run entirely by volunteers, with
        gross receipts of $28,000 last year from a mix of small individual
        donations and a local grant. Its treasurer sits down in April,
        with the calendar-year fiscal year ending December 31 meaning the
        e-Postcard is due May 15.
      </p>
      <p>
        The treasurer pulls the organization&apos;s EIN from its IRS
        determination letter, confirms the legal name and mailing address
        haven&apos;t changed, and notes the current board president as
        principal officer. Maple Street doesn&apos;t have a dedicated
        website, so that field is left blank. Total receipts for the year
        were $28,000 — comfortably under $50,000, and consistent with the
        prior two years, so the &quot;normally $50,000 or less&quot; box is
        confirmed without difficulty. The organization hasn&apos;t
        terminated or begun winding down, so that box is marked no.
      </p>
      <p>
        The whole submission — logging into the IRS system, looking up the
        EIN, and entering the eight fields — takes about eight minutes.
        The treasurer downloads the confirmation, saves it in the
        organization&apos;s shared compliance folder alongside the prior
        two years&apos; confirmations, and adds next year&apos;s May 15
        deadline to the board&apos;s shared calendar before closing the
        tab.
      </p>

      <h2 id="deadline">Filing deadline and your fiscal year</h2>
      <p>
        Like every return in the Form 990 series, the e-Postcard is due on
        the <strong>15th day of the 5th month after your organization&apos;s
        fiscal year ends</strong>. For an organization on a standard
        calendar fiscal year (January 1 – December 31), that&apos;s{" "}
        <strong>May 15</strong> of the following year. An organization on a
        July 1 – June 30 fiscal year owes its 990-N by November 15.
      </p>
      <p>
        Unlike the full 990 and 990-EZ, there is no extension form
        available for the 990-N — Form 8868 doesn&apos;t apply to it, since
        there&apos;s no tax liability or complex return to extend. The
        practical implication is that there&apos;s no formal way to buy
        extra time; the best approach is simply to file it as soon as your
        fiscal year closes rather than waiting until the deadline.
      </p>

      <h2 id="after-filing">What to do after you file</h2>
      <p>
        Filing the e-Postcard isn&apos;t quite the end of the task — a few
        follow-up habits make next year&apos;s filing easier and protect
        you if a question ever comes up about your compliance history:
      </p>
      <ul>
        <li>
          <strong>Save the confirmation somewhere durable</strong> — a
          shared organizational drive, not one person&apos;s personal
          email — and keep at least the last several years together in
          one place.
        </li>
        <li>
          <strong>Check the IRS Tax Exempt Organization Search tool</strong>{" "}
          a few weeks later to confirm the filing is reflected in your
          organization&apos;s public record.
        </li>
        <li>
          <strong>Note next year&apos;s deadline immediately</strong>,
          rather than waiting until you&apos;re close to it again — this is
          the single easiest way to avoid the slow drift toward a missed
          year that leads to automatic revocation.
        </li>
        <li>
          <strong>Reassess your gross receipts trend.</strong> If this
          year pushed you close to the $50,000 average, start planning for
          the more detailed 990-EZ before you&apos;re required to file it,
          not after.
        </li>
      </ul>

      <h2 id="filing-late">What happens if you file late</h2>
      <p>
        There&apos;s no dollar penalty attached to filing the e-Postcard
        late in any single year — unlike the full 990 or 990-EZ, it has no
        associated per-day fine. That leads a lot of small nonprofits to
        treat it as low-stakes. It isn&apos;t. The real risk is cumulative:
        under IRC section 6033(j), an organization that fails to file its
        required annual return or notice — including the 990-N — for{" "}
        <strong>three consecutive years</strong> has its tax-exempt status{" "}
        <strong>automatically revoked</strong>, with no advance warning and
        no appeal process for the revocation itself.
      </p>
      <p>
        Once that happens, your organization is treated for federal tax
        purposes as a taxable entity, contributions are no longer
        tax-deductible to donors, and you generally have to reapply for
        exemption from scratch using Form 1023 or 1023-EZ. Organizations
        that qualified to file the 990-N or 990-EZ can typically use the
        IRS&apos;s streamlined retroactive reinstatement process if they
        apply within 15 months of the revocation date, restoring exempt
        status back to the original date — but miss that window, and
        reinstatement is only effective going forward from the new
        application, leaving a gap where any donations received
        weren&apos;t deductible. For the full picture of what a revocation
        and reinstatement actually involves, see the penalties section of
        our{" "}
        <Link href="/blog/nonprofit-compliance-calendar">
          compliance calendar guide
        </Link>
        .
      </p>

      <h2 id="outgrew-990n">What if your nonprofit grew past $50,000?</h2>
      <p>
        If your gross receipts for the year exceeded $50,000 — or based on
        the IRS&apos;s three-year averaging rule, are no longer
        &quot;normally&quot; at or below that threshold — you&apos;re no
        longer eligible to file the 990-N for that year. Instead:
      </p>
      <ul>
        <li>
          File <strong>Form 990-EZ</strong> if gross receipts are under
          $200,000 and total assets are under $500,000.
        </li>
        <li>
          File the <strong>full Form 990</strong> if you exceed either of
          those thresholds.
        </li>
      </ul>
      <p>
        Both are due on the same 15th-day-of-the-5th-month schedule, but
        both require substantially more information than the e-Postcard —
        financial statements, program service descriptions, and (for the
        full 990) compensation and governance disclosures. If your
        organization is approaching this threshold, it&apos;s worth
        preparing for the transition a year in advance rather than
        discovering it at filing time.
      </p>

      <h2 id="mistakes">Common mistakes</h2>
      <h3>Assuming no income means no filing requirement</h3>
      <p>
        A nonprofit with literally $0 in gross receipts for the year still
        owes a 990-N. &quot;We didn&apos;t do anything this year&quot; is
        not an exception — it&apos;s exactly the situation the 990-N was
        designed for.
      </p>
      <h3>Filing under the wrong EIN or organization name</h3>
      <p>
        If your organization has recently changed its legal name, or if
        someone files using a similar-sounding organization&apos;s EIN by
        mistake, the filing won&apos;t register correctly against your
        actual record. Double-check the EIN against your IRS determination
        letter before submitting.
      </p>
      <h3>Not keeping a filing record</h3>
      <p>
        Because there&apos;s no paper form and no dollar amount attached,
        organizations frequently fail to document that they filed at all —
        which becomes a real problem if the IRS&apos;s system shows a gap
        and you need to prove otherwise. Save the confirmation every year.
      </p>
      <h3>Letting officer turnover break the chain</h3>
      <p>
        The e-Postcard is one filing that&apos;s genuinely easy to lose
        track of exactly because it&apos;s so simple — organizations that
        would never forget a complex 990 filing let the e-Postcard slip
        because it feels inconsequential, especially when the person who
        used to file it leaves the organization.
      </p>

      <h2 id="faq">Frequently asked questions</h2>
      <h3>Is there a fee to file Form 990-N?</h3>
      <p>No. The e-Postcard is free to file.</p>
      <h3>Can I file Form 990-N by mail?</h3>
      <p>
        No — it&apos;s exclusively an electronic filing through the IRS
        website. There is no paper version.
      </p>
      <h3>Do I need an accountant to file it?</h3>
      <p>
        Most organizations can file it themselves in under ten minutes
        given the information above — it&apos;s intentionally simple
        enough not to require professional preparation. That said, if
        you&apos;re unsure whether your organization qualifies for the
        990-N versus the 990-EZ, that threshold question is worth
        confirming with an accountant or your compliance provider.
      </p>
      <h3>What happens if I file the 990-N a few days late?</h3>
      <p>
        A single late filing has no direct penalty. Just file it as soon
        as you realize — the risk is only cumulative across three
        consecutive missed years, described above.
      </p>
      <h3>Can I amend a 990-N after filing?</h3>
      <p>
        Because the e-Postcard contains no financial data to correct,
        there&apos;s generally nothing to amend in the way you might amend
        a tax return — if you made an error (like the wrong tax year), the
        practical fix is usually to refile for the correct year rather
        than seek a formal amendment.
      </p>
      <h3>Does filing Form 990-N satisfy my state filing requirements too?</h3>
      <p>
        No — the e-Postcard is a federal filing only. Most states require
        their own separate annual or biennial corporate report, and many
        also require charitable solicitation registration renewals, on
        entirely independent schedules. See our{" "}
        <Link href="/blog/nonprofit-compliance-calendar">
          compliance calendar guide
        </Link>{" "}
        for the state-level side of the picture.
      </p>
      <h3>What if I made a mistake on a previously filed 990-N?</h3>
      <p>
        Because the e-Postcard carries no financial figures to correct,
        minor errors — a typo in an address, for instance — generally
        don&apos;t require any special amendment process. If you filed for
        the wrong tax year entirely, or your organization&apos;s
        eligibility for the 990-N is in question for a year you already
        filed it, it&apos;s worth confirming the right fix with an
        accountant rather than guessing, since the fix depends on exactly
        what went wrong.
      </p>
      <h3>Our organization missed one year — do we need to do anything special?</h3>
      <p>
        A single missed year, on its own, doesn&apos;t trigger revocation —
        only three <em>consecutive</em> missed years does. File the
        current year&apos;s e-Postcard as soon as you catch the gap, and
        make sure the missed year doesn&apos;t become a second or third
        consecutive miss. There&apos;s no separate late-filing form for a
        single missed 990-N; you simply resume filing going forward.
      </p>
      <h3>How does FormRight help with Form 990-N?</h3>
      <p>
        FormRight&apos;s Comply plan tracks your organization&apos;s
        specific filing deadline based on your actual fiscal year and
        sends reminders ahead of it, so the e-Postcard doesn&apos;t depend
        on any one person remembering. See the full annual picture in our{" "}
        <Link href="/blog/nonprofit-compliance-calendar">
          nonprofit compliance calendar
        </Link>
        , or <Link href="/onboard">get started</Link> with FormRight today.
      </p>
    </BlogShell>
  );
}
