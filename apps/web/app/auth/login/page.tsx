import { Suspense } from "react";
import LoginForm from "@/components/auth/LoginForm";

export default function LoginPage() {
  return (
    <div style={{ maxWidth: 440, margin: "72px auto", padding: "0 24px" }}>
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-2 mb-2">
          <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
            <rect width="26" height="26" rx="6" fill="#00897B" />
            <rect x="4" y="7" width="14" height="2.5" rx="1.25" fill="white" opacity=".9" />
            <rect x="4" y="12" width="10" height="2.5" rx="1.25" fill="white" opacity=".6" />
            <rect x="4" y="17" width="12" height="2.5" rx="1.25" fill="white" opacity=".6" />
          </svg>
          <span className="font-serif font-bold text-xl text-navy">
            Form<span className="text-teal">Right</span>
          </span>
        </div>
        <p className="text-gray-500 text-sm">Sign in to access your dashboard</p>
      </div>
      <Suspense>
        <LoginForm />
      </Suspense>
    </div>
  );
}
