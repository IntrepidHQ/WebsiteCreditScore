import type { PreviewDevice, ReportProfileType } from "@/lib/types/audit";

const blockedHostnamePatterns = [
  /^localhost$/i,
  /\.localhost$/i,
  /\.local$/i,
  /\.internal$/i,
  /^0\.0\.0\.0$/,
  /^127\./,
  /^10\./,
  /^169\.254\./,
  /^192\.168\./,
  /^172\.(1[6-9]|2\d|3[0-1])\./,
  /^\[::1\]$/i,
  /^\[?fe80:/i,
  /^\[?fc/i,
  /^\[?fd/i,
];

function hashString(input: string) {
  return [...input].reduce((acc, char) => acc + char.charCodeAt(0), 0);
}

function isBlockedHostname(hostname: string) {
  return blockedHostnamePatterns.some((pattern) => pattern.test(hostname));
}

export function normalizeUrl(input: string) {
  const trimmed = input.trim();

  if (!trimmed) {
    throw new Error("Enter a website URL to generate an audit.");
  }

  const candidate = /^https?:\/\//i.test(trimmed)
    ? trimmed
    : `https://${trimmed}`;

  let parsed: URL;

  try {
    parsed = new URL(candidate);
  } catch {
    throw new Error("Use a valid website URL, for example https://example.com.");
  }

  if (isBlockedHostname(parsed.hostname)) {
    throw new Error("Use a public website URL, not a local or private address.");
  }

  if (!parsed.hostname.includes(".")) {
    throw new Error("Use a public website URL with a valid domain.");
  }

  parsed.hash = "";
  parsed.search = "";
  parsed.pathname = parsed.pathname.replace(/\/+$/, "") || "/";
  parsed.protocol = "https:";
  parsed.hostname = parsed.hostname.toLowerCase().replace(/^www\./, "");

  return parsed.toString().replace(/\/$/, "");
}

export function slugFromUrl(input: string) {
  const hostname = new URL(input).hostname.replace(/^www\./, "");

  return hostname
    .replace(/[^a-z0-9]+/gi, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();
}

export function formatDomainTitle(input: string) {
  const hostname = new URL(input).hostname.replace(/^www\./, "");
  const base = hostname.split(".")[0];

  return base
    .split(/[-_]+/)
    .filter(Boolean)
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(" ");
}

export function inferProfileType(input: string): ReportProfileType {
  const hostname = new URL(input).hostname.toLowerCase();
  const root = hostname.replace(/^www\./, "").split(".")[0];

  const keywordMatches: Array<[ReportProfileType, RegExp]> = [
    [
      "healthcare",
      /(clinic|care|dental|med|health|wellness|ortho|therapy|doctor|hospital)/,
    ],
    [
      "local-service",
      /(roof|plumb|hvac|electric|landscap|remodel|clean|garage|service|repair)/,
    ],
    [
      "saas",
      /(app|cloud|crm|software|platform|hq|studio|system|suite|data|analytics)/,
    ],
  ];

  const matched = keywordMatches.find(([, regex]) => regex.test(hostname));

  if (matched) {
    return matched[0];
  }

  if (/^[a-z0-9]+$/.test(root) && root.length <= 10) {
    return "saas";
  }

  if (/-|_/.test(root)) {
    return "local-service";
  }

  const profiles: ReportProfileType[] = [
    "healthcare",
    "local-service",
    "saas",
  ];

  return profiles[hashString(hostname) % profiles.length];
}

export function createWebsiteScreenshotUrl(
  input: string,
  device: PreviewDevice = "desktop",
) {
  return `/api/preview?url=${encodeURIComponent(normalizeUrl(input))}&device=${device}&v=static-shot-2`;
}
