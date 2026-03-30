import { Suspense } from "react";
import type { Metadata } from "next";
import { Instrument_Serif, Manrope, Space_Grotesk } from "next/font/google";

import { ContactModal } from "@/components/common/contact-modal";
import { RouteScrollReset } from "@/components/common/route-scroll-reset";
import { SiteFooter } from "@/components/common/site-footer";
import { SiteHeader } from "@/components/common/site-header";
import { ThemeStyleProvider } from "@/components/common/theme-style-provider";

import "./globals.css";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  subsets: ["latin"],
  weight: "400",
});

export const metadata: Metadata = {
  title: "WebsiteCreditScore.com",
  description:
    "WebsiteCreditScore.com turns prospect sites into sharper audits, clearer redesign direction, and measurable design benchmarks.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${manrope.variable} ${spaceGrotesk.variable} ${instrumentSerif.variable} min-h-screen bg-background text-foreground antialiased`}
      >
        <ThemeStyleProvider>
          <div className="relative isolate min-h-screen overflow-x-hidden">
            <div className="relative z-10 flex min-h-screen flex-col">
              <Suspense fallback={null}>
                <SiteHeader />
              </Suspense>
              <Suspense fallback={null}>
                <RouteScrollReset />
              </Suspense>
              {children}
              <SiteFooter />
            </div>
            <ContactModal />
          </div>
        </ThemeStyleProvider>
      </body>
    </html>
  );
}
