import Link from "next/link";
import Nav from "@/components/marketing/Nav";
import Footer from "@/components/marketing/Footer";

export default function NotFound() {
  return (
    <>
      <Nav />
      <main className="flex min-h-[60vh] flex-col items-center justify-center px-6 py-24 text-center">
        <div className="mb-2 font-serif text-6xl font-bold text-navy">404</div>
        <h1 className="mb-3 font-serif text-2xl font-bold text-navy">
          This page could not be found.
        </h1>
        <p className="mb-8 max-w-md text-slate-500">
          The link you followed may be broken, or the page may have moved.
          Let&apos;s get you back on track.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/"
            className="rounded-xl bg-gold px-6 py-3 text-sm font-bold text-navy shadow-gold transition-all hover:-translate-y-px hover:bg-[#FFB300]"
          >
            ← Back to Home
          </Link>
          <Link
            href="/contact"
            className="rounded-xl border-2 border-teal px-6 py-3 text-sm font-semibold text-teal transition-all hover:bg-teal-pale"
          >
            Contact Us
          </Link>
        </div>
      </main>
      <Footer />
    </>
  );
}
