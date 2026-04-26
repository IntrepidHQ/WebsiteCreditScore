import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "WebsiteCreditScore — AI-Powered Website Trust Reports",
  description:
    "Get a deep credibility report for any website. Powered by Claude AI with live web research. Graded A+ to F across 8 dimensions. $1 per scan.",
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
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased min-h-screen bg-[#0A0A0B] text-white`}
      >
        {children}
        <Analytics />
      </body>
    </html>
  );
}
