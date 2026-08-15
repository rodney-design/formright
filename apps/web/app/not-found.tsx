import Link from "next/link";
import Nav from "@/components/marketing/Nav";
import Footer from "@/components/marketing/Footer";
import { getCurrentUser } from "@/lib/auth";

export default async function NotFound() {
  const user = await getCurrentUser();
  const isAdmin = user?.role === "admin" || user?.role === "super_admin";

  return (
    <>
      <Nav isAdmin={isAdmin} />
      <main className="flex min-h-[60vh] flex-col items-center justify-center px-6 py-24 text-center">
        <div className="mb-2 font-serif text-6xl font-bold text-ink">404</div>
        <h1 className="mb-3 font-serif text-2xl font-bold text-ink">
          This page could not be found.
        </h1>
        <p className="mb-8 max-w-md text-ink-faint">
          The link you followed may be broken, or the page may have moved.
          Let&apos;s get you back on track.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/"
            className="rounded bg-stamp px-6 py-3 text-sm font-bold text-paper-white transition-all hover:-translate-y-0.5 hover:bg-stamp-dark"
          >
            ← Back to Home
          </Link>
          <Link
            href="/contact"
            className="rounded border-2 border-stamp px-6 py-3 text-sm font-semibold text-stamp transition-all hover:bg-paper"
          >
            Contact Us
          </Link>
        </div>
      </main>
      <Footer isAdmin={isAdmin} />
    </>
  );
}
