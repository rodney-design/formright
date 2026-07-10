"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

const ERROR_MESSAGES: Record<string, string> = {
  missing_token: "Missing sign-in token.",
  invalid_token: "This sign-in link is no longer valid. Links expire after 15 minutes and can only be used once.",
};

export default function LoginForm() {
  const searchParams = useSearchParams();
  const urlError = searchParams.get("error");

  const [email, setEmail] = useState("");
  const [step, setStep] = useState<"email" | "sent" | "error">(urlError ? "error" : "email");
  const [error, setError] = useState<string | null>(urlError ? ERROR_MESSAGES[urlError] ?? "Something went wrong." : null);
  const [loading, setLoading] = useState(false);

  async function requestMagicLink() {
    setError(null);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/request-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) throw new Error("Request failed");
      setStep("sent");
    } catch {
      setError("We couldn't send that link. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (step === "sent") {
    return (
      <div className="bg-white rounded-2xl p-9 shadow-lg border border-emerald-100 text-center">
        <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
          📬
        </div>
        <h3 className="text-navy text-lg font-semibold mb-2">Check your email</h3>
        <p className="text-sm text-gray-600 mb-1">We sent a secure sign-in link to</p>
        <p className="font-bold text-teal mb-5">{email}</p>
        <p className="text-sm text-gray-500 mb-5">
          Click the link in that email to access your dashboard. The link expires in 15 minutes and can only be used once.
        </p>
        <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-500">
          Didn&apos;t get it? Check your spam folder, or{" "}
          <button className="text-teal font-semibold underline" onClick={() => setStep("email")}>
            try a different email
          </button>
          .
        </div>
      </div>
    );
  }

  if (step === "error") {
    return (
      <div className="bg-white rounded-2xl p-9 shadow-lg border border-red-200 text-center">
        <div className="text-4xl mb-4">⚠️</div>
        <h3 className="text-red-600 text-lg font-semibold mb-2">Link expired or already used</h3>
        <p className="text-sm text-gray-500 mb-5">{error}</p>
        <Button
          className="w-full justify-center"
          onClick={() => {
            setStep("email");
            setError(null);
          }}
        >
          Request a New Link
        </Button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-9 shadow-lg border border-gray-200">
      <h3 className="text-navy text-lg font-semibold mb-1.5">Enter your email</h3>
      <p className="text-sm text-gray-500 mb-5">
        We&apos;ll send you a secure link to access your account — no password needed.
      </p>
      <div className="mb-5">
        <label className="block text-sm font-medium text-gray-700 mb-1.5">Email Address</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@yourorg.org"
          onKeyDown={(e) => e.key === "Enter" && requestMagicLink()}
          className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-base"
        />
      </div>
      <Button className="w-full justify-center text-base" onClick={requestMagicLink} disabled={loading}>
        {loading ? "Sending…" : "Send Magic Link →"}
      </Button>
      {error && (
        <div className="mt-3.5 bg-red-50 border border-red-200 rounded-lg px-3.5 py-2.5 text-sm text-red-600">
          {error}
        </div>
      )}
      <div className="text-center mt-5 text-sm text-gray-400">
        No account yet?{" "}
        <Link href="/onboard" className="text-teal font-semibold">
          Start your formation →
        </Link>
      </div>
    </div>
  );
}
