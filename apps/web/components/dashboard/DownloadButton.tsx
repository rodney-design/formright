const VARIANT_CLASSES: Record<"default" | "dark", string> = {
  default: "border border-gray-300 text-gray-700 hover:bg-gray-50",
  dark: "bg-navy text-white hover:bg-navy-light",
};

export default function DownloadButton({
  href,
  children,
  variant = "default",
}: {
  href: string;
  children: React.ReactNode;
  variant?: "default" | "dark";
}) {
  return (
    <a
      href={href}
      className={`inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-semibold shrink-0 transition-colors ${VARIANT_CLASSES[variant]}`}
    >
      {children}
    </a>
  );
}
