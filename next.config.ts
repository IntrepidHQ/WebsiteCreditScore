import type { NextConfig } from "next";

const cspHeader = {
  key: "Content-Security-Policy",
  value: [
    "default-src 'self'",
    // Next.js requires unsafe-inline for its runtime scripts/styles; nonce-based CSP requires framework changes
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com https://vercel.live https://va.vercel-scripts.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: blob: https:",
    "frame-src https://js.stripe.com",
    "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.stripe.com https://vitals.vercel-insights.com https://va.vercel-scripts.com",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join("; "),
};

const baseSecurityHeaders = [
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), browsing-topics=(), payment=()",
  },
  cspHeader,
];

const coopHeader = { key: "Cross-Origin-Opener-Policy", value: "same-origin" } as const;

const globalSecurityHeaders = [...baseSecurityHeaders, coopHeader];

if (process.env.NODE_ENV === "production") {
  baseSecurityHeaders.push({
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  });
  globalSecurityHeaders.push({
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  });
}

const nextConfig: NextConfig = {
  poweredByHeader: false,
  reactStrictMode: true,
  serverExternalPackages: ["playwright-core", "@sparticuz/chromium", "sharp"],
  experimental: {
    optimizePackageImports: ["lucide-react"],
  },

  async headers() {
    return [
      {
        source: "/auth/:path*",
        headers: baseSecurityHeaders,
      },
      {
        source: "/((?!auth/|_next/static|_next/image|favicon.ico).*)",
        headers: globalSecurityHeaders,
      },
      {
        source: "/api/preview",
        headers: [
          ...globalSecurityHeaders,
          { key: "Cross-Origin-Resource-Policy", value: "same-origin" },
        ],
      },
    ];
  },
};

export default nextConfig;
