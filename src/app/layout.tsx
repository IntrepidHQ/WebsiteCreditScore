import type { Metadata } from "next";
import { Manrope, Instrument_Serif } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import "./globals.css";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  display: "swap",
});

const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "WebsiteCreditScore — AI-Powered Website Trust Reports",
    template: "%s | WebsiteCreditScore",
  },
  description:
    "Get a deep credibility report for any website. Powered by Claude AI with live web research. Graded A+ to F across 8 dimensions. $1 per scan.",
  metadataBase: new URL("https://websitecreditscore.com"),
  openGraph: {
    title: "WebsiteCreditScore",
    description: "AI-powered credibility reports for any website. $1 per scan.",
    siteName: "WebsiteCreditScore",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "WebsiteCreditScore",
    description: "AI-powered credibility reports for any website. $1 per scan.",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${manrope.variable} ${instrumentSerif.variable}`}>
      <body className="min-h-screen antialiased">
        {children}
        <Analytics />
      </body>
    </html>
  );
}
