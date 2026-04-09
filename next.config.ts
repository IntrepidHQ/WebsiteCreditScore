import type { NextConfig } from "next";

const baseSecurityHeaders = [
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), browsing-topics=(), payment=()",
  },
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
