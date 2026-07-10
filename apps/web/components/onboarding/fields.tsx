"use client";

import type { ReactNode } from "react";
import { Button } from "@/components/ui/Button";

export function Field({
  label,
  required,
  hint,
  error,
  full,
  children,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  error?: string;
  full?: boolean;
  children: ReactNode;
}) {
  return (
    <div className={full ? "md:col-span-2" : ""}>
      <label className="block text-sm font-medium text-navy mb-1.5">
        {label} {required && <sup className="text-red-500">*</sup>}
      </label>
      {children}
      {hint && !error && <div className="text-xs text-gray-400 mt-1">{hint}</div>}
      {error && <div className="text-xs text-red-500 mt-1">{error}</div>}
    </div>
  );
}

const inputClass =
  "w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal/40 focus:border-teal";

export function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`${inputClass} ${props.className ?? ""}`} />;
}

export function TextArea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={`${inputClass} ${props.className ?? ""}`} />;
}

export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className={`${inputClass} bg-white ${props.className ?? ""}`} />;
}

export function FormGrid({ children }: { children: ReactNode }) {
  return <div className="grid grid-cols-1 md:grid-cols-2 gap-5">{children}</div>;
}

export function FormActions({
  onBack,
  backLabel = "← Back",
  stepLabel,
  children,
}: {
  onBack?: () => void;
  backLabel?: string;
  stepLabel: string;
  children: ReactNode;
}) {
  return (
    <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-100">
      {onBack ? (
        <Button variant="secondary" onClick={onBack} type="button">
          {backLabel}
        </Button>
      ) : (
        <span />
      )}
      <div className="flex items-center gap-4">
        <span className="text-xs text-gray-400">{stepLabel}</span>
        {children}
      </div>
    </div>
  );
}
