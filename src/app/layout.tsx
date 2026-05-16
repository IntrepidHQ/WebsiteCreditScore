import type { Metadata } from "next";
import { Manrope, Instrument_Serif } from "next/font/google";
import { CookieConsent } from "@/components/CookieConsent";
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
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
};

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://websitecreditscore.com/#organization",
      name: "WebsiteCreditScore",
      url: "https://websitecreditscore.com",
      email: "hello@websitecreditscore.com",
      founder: {
        "@type": "Person",
        name: "Hans Turner",
        url: "https://hansturner.com",
      },
      sameAs: [
        "https://hansturner.com",
        "https://github.com/IntrepidHQ/WebsiteCreditScore",
      ],
      contactPoint: {
        "@type": "ContactPoint",
        contactType: "customer support",
        email: "hello@websitecreditscore.com",
        availableLanguage: "en",
      },
    },
    {
      "@type": "Service",
      "@id": "https://websitecreditscore.com/#service",
      name: "WebsiteCreditScore website trust reports",
      provider: { "@id": "https://websitecreditscore.com/#organization" },
      serviceType: "AI-powered website credibility audits",
      areaServed: "Worldwide",
      offers: {
        "@type": "Offer",
        priceCurrency: "USD",
        price: "1.00",
        url: "https://websitecreditscore.com/pricing",
      },
      termsOfService: "https://websitecreditscore.com/terms",
    },
    {
      "@type": "WebSite",
      "@id": "https://websitecreditscore.com/#website",
      name: "WebsiteCreditScore",
      url: "https://websitecreditscore.com",
      publisher: { "@id": "https://websitecreditscore.com/#organization" },
    },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${manrope.variable} ${instrumentSerif.variable}`}>
      <body className="min-h-screen antialiased">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
        {children}
        <CookieConsent />
      </body>
    </html>
  );
}
