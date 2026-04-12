import { Suspense } from "react";
import type { Metadata } from "next";
import {
  DM_Sans,
  Instrument_Serif,
  Inter,
  JetBrains_Mono,
  Manrope,
  Playfair_Display,
  Space_Grotesk,
} from "next/font/google";

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
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  display: "swap",
});

const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const playfairDisplay = Playfair_Display({
  variable: "--font-playfair-display",
  subsets: ["latin"],
  display: "swap",
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  display: "swap",
});

const fontVariableClassName = [
  manrope.variable,
  spaceGrotesk.variable,
  instrumentSerif.variable,
  inter.variable,
  playfairDisplay.variable,
  dmSans.variable,
  jetbrainsMono.variable,
].join(" ");

export const metadata: Metadata = {
  title: "WebsiteCreditScore.com",
  description:
    "WebsiteCreditScore.com turns prospect sites into sharper audits, clearer redesign direction, and measurable design benchmarks.",
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
  },
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
    <html
      className={fontVariableClassName}
      data-scroll-behavior="smooth"
      lang="en"
      suppressHydrationWarning
    >
      <body className="min-h-screen overflow-x-clip bg-background text-foreground antialiased">
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
