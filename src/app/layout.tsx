import { Suspense } from "react";
import type { Metadata } from "next";
import { Instrument_Serif, Manrope, Space_Grotesk } from "next/font/google";

import { ContactModal } from "@/components/common/contact-modal";
import { RouteScrollReset } from "@/components/common/route-scroll-reset";
import { SiteFooter } from "@/components/common/site-footer";
import { SiteHeader } from "@/components/common/site-header";
import { ThemeStyleProvider } from "@/components/common/theme-style-provider";
import { getOptionalWorkspaceSession } from "@/lib/auth/session";

import "./globals.css";

export const dynamic = "force-dynamic";

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

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getOptionalWorkspaceSession();
  const isAuthenticated = Boolean(session);
  const accountHint = session?.name?.trim() || session?.email?.split("@")[0] || null;

  return (
    <html data-scroll-behavior="smooth" lang="en" suppressHydrationWarning>
      <body
        className={`${manrope.variable} ${spaceGrotesk.variable} ${instrumentSerif.variable} min-h-screen overflow-x-clip bg-background text-foreground antialiased`}
      >
        <ThemeStyleProvider>
          {/* overflow-x must not clip the main column or sticky header will not stick to the viewport */}
          <div className="relative isolate min-h-screen">
            <div className="relative z-10 flex min-h-screen flex-col">
              <Suspense fallback={null}>
                <SiteHeader accountHint={accountHint} isAuthenticated={isAuthenticated} />
              </Suspense>
              <Suspense fallback={null}>
                <RouteScrollReset />
              </Suspense>
              {children}
              <SiteFooter isAuthenticated={isAuthenticated} />
            </div>
            <ContactModal />
          </div>
        </ThemeStyleProvider>
      </body>
    </html>
  );
}
