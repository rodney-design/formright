import Link from "next/link";

function LogoMark() {
  return (
    <>
      <svg
        width="27"
        height="27"
        viewBox="0 0 27 27"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0"
      >
        <circle cx="13.5" cy="13.5" r="13" stroke="#14213D" strokeWidth="1" />
        <circle cx="13.5" cy="13.5" r="10" stroke="#A8351D" strokeWidth="1" />
        <path
          d="M8.5 14.5L11.8 17.8L18.5 10.2"
          stroke="#14213D"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <div className="flex items-baseline">
        <span className="font-serif font-bold text-[19px] text-ink tracking-[-.3px] leading-none">
          Form
        </span>
        <span className="font-serif font-bold text-[19px] text-stamp tracking-[-.3px] leading-none">
          Right
        </span>
        <span className="font-sans font-bold text-[7px] text-brass tracking-[1px] ml-1 self-start pt-[3px] leading-none">
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
