import Link from "next/link";

export type TocItem = { id: string; label: string };

export default function BlogShell({
  category,
  title,
  dek,
  meta,
  toc,
  children,
}: {
  category: string;
  title: string;
  dek: React.ReactNode;
  meta: React.ReactNode;
  toc?: TocItem[];
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="bg-ink py-8">
        <div className="mx-auto max-w-[800px] px-6 sm:px-10">
          <Link
            href="/blog"
            className="inline-flex items-center gap-[6px] font-sans text-sm font-semibold text-white/60 transition-colors hover:text-white"
          >
            ← Back to Blog
          </Link>
        </div>
      </div>

      <div className="mx-auto max-w-[800px] px-6 pb-10 pt-14 sm:px-10">
        <div className="mb-3 text-[.72rem] font-bold uppercase tracking-[.12em] text-stamp">
          {category}
        </div>
        <h1 className="mb-4 font-serif text-[2.1rem] leading-[1.15] tracking-[-.02em] text-ink sm:text-[2.6rem]">
          {title}
        </h1>
        <p className="mb-6 max-w-[620px] font-sans text-[1.05rem] font-light leading-[1.6] text-ink-faint">
          {dek}
        </p>
        <div className="mb-10 border-b border-rule pb-6 text-[.8rem] text-ink-faint">
          {meta}
        </div>

        {toc && toc.length > 0 && (
          <nav
            aria-label="Table of contents"
            className="mb-10 rounded-sm border border-rule bg-paper px-6 py-5"
          >
            <div className="mb-3 text-[.72rem] font-bold uppercase tracking-[.1em] text-ink-faint">
              In this guide
            </div>
            <ol className="list-decimal space-y-[6px] pl-5">
              {toc.map((item) => (
                <li key={item.id} className="text-[.88rem]">
                  <a
                    href={`#${item.id}`}
                    className="text-stamp underline decoration-stamp/30 underline-offset-2 hover:decoration-stamp"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ol>
          </nav>
        )}

        <div className="legal-body">{children}</div>
      </div>

      <div className="border-t border-rule bg-paper">
        <div className="mx-auto max-w-[800px] px-6 py-14 text-center sm:px-10">
          <h2 className="mb-3 font-serif text-[1.6rem] text-ink">
            Ready to form your nonprofit?
          </h2>
          <p className="mx-auto mb-6 max-w-[480px] font-sans text-[.95rem] font-light text-ink-faint">
            FormRight prepares your Articles of Incorporation, bylaws, and
            IRS Form 1023/1023-EZ, and helps you stay compliant every year
            after — starting at $49.
          </p>
          <Link
            href="/onboard"
            className="inline-flex items-center rounded bg-stamp px-7 py-3 font-sans text-sm font-bold text-paper-white transition-all hover:-translate-y-px hover:bg-stamp-dark"
          >
            Start Your Nonprofit →
          </Link>
        </div>
      </div>
    </div>
  );
}
