"use client";

import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "ghost" | "dark";

const VARIANT_CLASSES: Record<Variant, string> = {
  primary: "bg-gold text-navy font-bold hover:bg-[#FFB300] shadow-gold",
  secondary: "bg-transparent border-2 border-teal text-teal font-semibold hover:bg-teal-pale",
  ghost: "bg-transparent border border-gray-300 text-gray-600 hover:bg-gray-50",
  dark: "bg-navy text-white font-semibold hover:bg-navy-light",
};

export function Button({
  variant = "primary",
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return (
    <button
      {...props}
      className={`inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed ${VARIANT_CLASSES[variant]} ${className}`}
    />
  );
}
