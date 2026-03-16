import { Suspense } from "react";
import type { Metadata } from "next";
import { Manrope, Space_Grotesk } from "next/font/google";

import { ContactModal } from "@/components/common/contact-modal";
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

export const metadata: Metadata = {
  title: "Craydl Web Design Agency",
  description:
    "Craydl helps web product providers turn prospect sites into sharper outreach packets, scoped proposals, and approved web engagements.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${manrope.variable} ${spaceGrotesk.variable} min-h-screen bg-background text-foreground antialiased`}
      >
        <ThemeStyleProvider>
          <div className="relative min-h-screen overflow-x-hidden">
            <div aria-hidden="true" className="ambient-orb left-0 top-16" />
            <div aria-hidden="true" className="ambient-orb ambient-orb-2 right-0 top-[28rem]" />
            <Suspense fallback={null}>
              <SiteHeader />
            </Suspense>
            {children}
            <SiteFooter />
            <ContactModal />
          </div>
        </ThemeStyleProvider>
      </body>
    </html>
  );
}
