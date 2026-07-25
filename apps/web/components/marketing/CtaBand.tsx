import Link from "next/link";

export default function CtaBand() {
  return (
    <div
      className="relative overflow-hidden px-6 py-20 text-center md:px-12"
      style={{
        background: "linear-gradient(135deg, #14213D 0%, #1B2E52 60%, #182948 100%)",
      }}
    >
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 80% 100% at 50% 100%, rgba(168,53,29,.18) 0%, transparent 70%)",
        }}
      />
      <div className="relative z-10 mx-auto max-w-[640px]">
        <h2 className="mb-[14px] font-serif text-[clamp(2rem,4vw,2.8rem)] leading-[1.2] tracking-[-.02em] text-paper-white">
          A world where paperwork
          <br />
          never stops a great idea.
        </h2>
        <p className="mb-9 text-base font-light leading-[1.75] text-white/55">
          Join thousands of founders who chose to form right. Whether
          you&apos;re launching a startup, a small business, or a nonprofit
          that&apos;s out to change the world.
        </p>
        <div className="flex flex-wrap justify-center gap-[14px]">
          <Link
            href="/onboard"
            className="inline-flex items-center gap-2 rounded bg-stamp px-9 py-[15px] font-sans text-base font-bold text-paper-white transition-all hover:-translate-y-0.5 hover:bg-stamp-dark"
          >
            Start Your Formation →
          </Link>
          <Link
            href="/#pricing-anchor"
            className="inline-flex items-center gap-2 rounded border-2 border-white/20 px-[34px] py-[13px] font-sans text-base font-semibold text-white/70 transition-all hover:bg-paper-white hover:text-ink"
          >
            View Pricing
          </Link>
        </div>
      </div>
    </div>
  );
}
