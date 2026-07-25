import type { Metadata } from "next";
import { Fraunces, Outfit } from "next/font/google";
import PostHogInit from "@/components/analytics/PostHogInit";
import "./globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-fraunces",
  display: "swap",
});

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-outfit",
  display: "swap",
});

export const metadata: Metadata = {
  title: "FormRight, PBC — Business Formation for Every Founder",
  description:
    "From LLCs to Nonprofits, C-Corps to Benefit Corporations — FormRight guides you through every step of U.S. business formation with intelligence, accuracy, and plain-language clarity.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${fraunces.variable} ${outfit.variable} font-sans antialiased`}
      >
        <PostHogInit />
        {children}
      </body>
    </html>
  );
}
