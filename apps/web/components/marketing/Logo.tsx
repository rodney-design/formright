import Link from "next/link";

function LogoMark({ onDark = false }: { onDark?: boolean }) {
  const ringColor = onDark ? "#F3EEE2" : "#14213D";
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
        <circle cx="13.5" cy="13.5" r="13" stroke={ringColor} strokeWidth="1" />
        <circle cx="13.5" cy="13.5" r="10" stroke="#A8351D" strokeWidth="1" />
        <path
          d="M8.5 14.5L11.8 17.8L18.5 10.2"
          stroke={ringColor}
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <div className="flex items-baseline">
        <span
          className={`font-serif font-bold text-[19px] tracking-[-.3px] leading-none ${onDark ? "text-paper-white" : "text-ink"}`}
        >
          Form
        </span>
        <span className="font-serif font-bold text-[19px] text-stamp tracking-[-.3px] leading-none">
          Right
        </span>
        <span
          className={`font-sans font-bold text-[7px] tracking-[1px] ml-1 self-start pt-[3px] leading-none ${onDark ? "text-brass-light" : "text-brass"}`}
        >
          PBC
        </span>
      </div>
    </>
  );
}

/**
 * FormRight wordmark. Pass `linked={false}` for non-interactive placements
 * (e.g. the footer, where the original prototype renders the mark with
 * `cursor:default` rather than as a home link). Pass `onDark` when placed
 * against the dark ink background (the footer) so "Form" and the seal ring
 * use a light color instead of ink-on-ink.
 */
export default function Logo({ linked = true, onDark = false }: { linked?: boolean; onDark?: boolean }) {
  if (!linked) {
    return (
      <div className="flex items-center gap-[9px]">
        <LogoMark onDark={onDark} />
      </div>
    );
  }

  return (
    <Link href="/" className="flex items-center gap-[9px]" aria-label="FormRight home">
      <LogoMark onDark={onDark} />
    </Link>
  );
}
