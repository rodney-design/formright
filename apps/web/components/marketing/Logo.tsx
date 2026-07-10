import Link from "next/link";

function LogoMark() {
  return (
    <>
      <svg
        width="26"
        height="26"
        viewBox="0 0 26 26"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0"
      >
        <rect width="26" height="26" rx="6" fill="#00897B" />
        <rect x="4" y="7" width="14" height="2.5" rx="1.25" fill="white" opacity=".9" />
        <rect x="4" y="12" width="10" height="2.5" rx="1.25" fill="white" opacity=".6" />
        <rect x="4" y="17" width="12" height="2.5" rx="1.25" fill="white" opacity=".6" />
      </svg>
      <div className="flex items-baseline">
        <span className="font-serif font-bold text-[19px] text-white tracking-[-.3px] leading-none">
          Form
        </span>
        <span className="font-serif font-bold text-[19px] text-gold tracking-[-.3px] leading-none">
          Right
        </span>
        <span className="font-sans font-bold text-[7px] text-teal-light tracking-[1px] ml-1 self-start pt-[3px] leading-none">
          PBC
        </span>
      </div>
    </>
  );
}

/**
 * FormRight wordmark. Pass `linked={false}` for non-interactive placements
 * (e.g. the footer, where the original prototype renders the mark with
 * `cursor:default` rather than as a home link).
 */
export default function Logo({ linked = true }: { linked?: boolean }) {
  if (!linked) {
    return (
      <div className="flex items-center gap-[9px]">
        <LogoMark />
      </div>
    );
  }

  return (
    <Link href="/" className="flex items-center gap-[9px]" aria-label="FormRight home">
      <LogoMark />
    </Link>
  );
}
