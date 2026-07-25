import Link from "next/link";

export default function LegalShell({
  tag,
  title,
  dateLine,
  notice,
  noticeVariant = "notice",
  maxWidth,
  children,
}: {
  tag: string;
  title: string;
  dateLine: React.ReactNode;
  notice?: React.ReactNode;
  noticeVariant?: "notice" | "warning";
  maxWidth?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="bg-ink py-8">
        <div className="mx-auto max-w-[800px] px-6 sm:px-10">
          <Link
            href="/"
            className="inline-flex items-center gap-[6px] font-sans text-sm font-semibold text-white/60 transition-colors hover:text-white"
          >
            ← Back to Home
          </Link>
        </div>
      </div>
      <div
        className="mx-auto px-6 pb-24 pt-14 sm:px-10"
        style={{ maxWidth: maxWidth ?? "800px" }}
      >
        <div className="mb-3 text-[.72rem] font-bold uppercase tracking-[.12em] text-stamp">
          {tag}
        </div>
        <h1 className="mb-2 font-serif text-[2.4rem] tracking-[-.02em] text-ink">
          {title}
        </h1>
        <div className="mb-10 border-b border-rule pb-6 text-[.8rem] text-ink-faint">
          {dateLine}
        </div>
        {notice && (
          <div className={noticeVariant === "warning" ? "legal-warning" : "legal-notice"}>
            {notice}
          </div>
        )}
        <div className="legal-body">{children}</div>
      </div>
    </div>
  );
}
