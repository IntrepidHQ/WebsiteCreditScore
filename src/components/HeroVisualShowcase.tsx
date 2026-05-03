"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { CheckCircle2, Layers, Sparkles } from "lucide-react";

export type HeroPreviewDimension = {
  key: string;
  label: string;
  score: number;
  color: string;
};

type VisualId = "snapshot" | "verdict" | "evidence";

const STORAGE_KEY = "wcs-hero-visual-v1";

const VARIANTS: { id: VisualId; label: string; hint: string }[] = [
  { id: "snapshot", label: "Snapshot", hint: "Live site + score overlay" },
  { id: "verdict", label: "Verdict", hint: "Big score + proof panel" },
  { id: "evidence", label: "Evidence", hint: "Sources + scan trail" },
];

function readSavedVisual(): VisualId {
  if (typeof window === "undefined") return "snapshot";
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    return saved === "snapshot" || saved === "verdict" || saved === "evidence"
      ? saved
      : "snapshot";
  } catch {
    return "snapshot";
  }
}

function BrowserChrome({ hostname }: { hostname: string }) {
  return (
    <div
      className="flex items-center gap-2 px-4 py-2.5"
      style={{ backgroundColor: "var(--theme-elevated)", borderBottom: "1px solid var(--theme-border)" }}
    >
      <div className="flex gap-1.5">
        <div className="h-2.5 w-2.5 rounded-full bg-red-500/60" />
        <div className="h-2.5 w-2.5 rounded-full bg-yellow-400/60" />
        <div className="h-2.5 w-2.5 rounded-full bg-green-500/60" />
      </div>
      <div
        className="mx-3 flex-1 rounded-md px-3 py-1 font-mono text-xs"
        style={{ backgroundColor: "var(--theme-panel)", color: "var(--theme-muted)" }}
      >
        {hostname}
      </div>
    </div>
  );
}

function VariantSnapshot({
  imageSrc,
  hostname,
  topTwo,
}: {
  imageSrc: string;
  hostname: string;
  topTwo: HeroPreviewDimension[];
}) {
  return (
    <div
      className="w-full max-w-lg overflow-hidden rounded-2xl"
      style={{
        border: "1px solid var(--theme-border)",
        backgroundColor: "var(--theme-panel)",
        boxShadow: "0 32px 80px rgba(0,0,0,0.4)",
      }}
    >
      <BrowserChrome hostname={hostname} />
      <div className="relative aspect-[16/10] w-full overflow-hidden">
        <Image
          src={imageSrc}
          alt={`Screenshot of ${hostname}`}
          fill
          sizes="(max-width: 1024px) 100vw, 50vw"
          className="object-cover object-top"
          priority
        />
        <div
          className="pointer-events-none absolute inset-0"
          style={{ background: "linear-gradient(180deg, rgba(0,0,0,0) 58%, rgba(0,0,0,0.68) 100%)" }}
        />
        <div
          className="absolute right-3 top-3 rounded-full px-2.5 py-1 text-[10px] font-semibold tracking-wide"
          style={{ border: "1px solid #4ade8055", backgroundColor: "#4ade801e", color: "#86efac" }}
        >
          LIVE SNAPSHOT
        </div>
        <div
          className="absolute bottom-3 left-3 rounded-xl px-3 py-2"
          style={{
            border: "1px solid color-mix(in srgb, var(--theme-border) 80%, #ffffff 20%)",
            backgroundColor: "color-mix(in srgb, var(--theme-panel) 72%, transparent)",
            backdropFilter: "blur(8px)",
            WebkitBackdropFilter: "blur(8px)",
          }}
        >
          <p className="text-[10px] uppercase tracking-widest" style={{ color: "var(--theme-muted)" }}>
            Confidence score
          </p>
          <div className="flex items-end gap-2">
            <span className="font-score text-3xl leading-none" style={{ color: "#4ade80" }}>
              9.6
            </span>
            <span className="font-score pb-0.5 text-xs" style={{ color: "var(--theme-muted)" }}>
              /10
            </span>
          </div>
        </div>
      </div>
      <div className="space-y-3 px-5 py-4" style={{ borderTop: "1px solid var(--theme-border)" }}>
        <div className="flex items-center justify-between text-xs">
          <p style={{ color: "var(--theme-muted)" }}>Evidence gathered from live sources</p>
          <p className="font-mono" style={{ color: "var(--theme-accent)" }}>
            27 sources
          </p>
        </div>
        {topTwo.map((dim) => (
          <div key={dim.key}>
            <div className="mb-1 flex items-center justify-between">
              <span className="text-xs" style={{ color: "var(--theme-foreground)" }}>
                {dim.label}
              </span>
              <span className="font-score text-xs" style={{ color: dim.color }}>
                {(dim.score / 10).toFixed(1)}/10
              </span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full" style={{ backgroundColor: "var(--theme-border)" }}>
              <div
                className="h-full rounded-full"
                style={{ width: `${dim.score}%`, backgroundColor: dim.color, opacity: 0.85 }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function VariantVerdict({
  imageSrc,
  hostname,
  topTwo,
}: {
  imageSrc: string;
  hostname: string;
  topTwo: HeroPreviewDimension[];
}) {
  return (
    <div
      className="grid w-full max-w-lg gap-0 overflow-hidden rounded-2xl sm:grid-cols-5"
      style={{
        border: "1px solid var(--theme-border)",
        backgroundColor: "var(--theme-panel)",
        boxShadow: "0 32px 80px rgba(0,0,0,0.4)",
      }}
    >
      <div
        className="flex flex-col justify-between gap-6 p-6 sm:col-span-2"
        style={{
          background:
            "linear-gradient(165deg, color-mix(in srgb, var(--theme-accent) 14%, var(--theme-panel)), var(--theme-panel))",
          borderRight: "1px solid var(--theme-border)",
        }}
      >
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em]" style={{ color: "var(--theme-muted)" }}>
            Example verdict
          </p>
          <p className="font-display mt-2 text-2xl" style={{ color: "var(--theme-foreground)" }}>
            {hostname}
          </p>
          <p className="mt-2 text-xs leading-relaxed" style={{ color: "var(--theme-muted)" }}>
            Ten live angles. One number leadership can trust.
          </p>
        </div>
        <div>
          <div className="flex items-end gap-2">
            <span className="font-score text-5xl leading-none" style={{ color: "#4ade80" }}>
              9.6
            </span>
            <span className="font-score pb-1 text-sm" style={{ color: "var(--theme-muted)" }}>
              /10
            </span>
          </div>
          <span
            className="mt-3 inline-block rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide"
            style={{
              border: "1px solid #4ade8055",
              backgroundColor: "#4ade8018",
              color: "#86efac",
            }}
          >
            Excellent
          </span>
        </div>
        <div className="space-y-2">
          {topTwo.map((d) => (
            <div key={d.key} className="flex items-center justify-between text-[11px]">
              <span style={{ color: "var(--theme-muted)" }}>{d.label}</span>
              <span className="font-score" style={{ color: d.color }}>
                {(d.score / 10).toFixed(1)}
              </span>
            </div>
          ))}
        </div>
      </div>
      <div className="relative aspect-[4/5] min-h-[220px] sm:col-span-3 sm:aspect-auto sm:min-h-[280px]">
        <Image src={imageSrc} alt={`Screenshot of ${hostname}`} fill className="object-cover object-top" sizes="400px" priority />
        <div
          className="pointer-events-none absolute inset-0"
          style={{ background: "linear-gradient(90deg, rgba(0,0,0,0.35) 0%, transparent 55%)" }}
        />
      </div>
    </div>
  );
}

function VariantEvidence({ imageSrc, hostname }: { imageSrc: string; hostname: string }) {
  const pills = [
    { label: "Google Reviews", sub: "Reputation signal" },
    { label: "BBB + press", sub: "Legitimacy trail" },
    { label: "SSL + PageSpeed", sub: "Technical proof" },
  ];
  return (
    <div
      className="w-full max-w-lg overflow-hidden rounded-2xl"
      style={{
        border: "1px solid var(--theme-border)",
        backgroundColor: "var(--theme-panel)",
        boxShadow: "0 32px 80px rgba(0,0,0,0.4)",
      }}
    >
      <BrowserChrome hostname={hostname} />
      <div className="relative aspect-[16/11] w-full overflow-hidden">
        <Image
          src={imageSrc}
          alt={`Screenshot of ${hostname}`}
          fill
          sizes="(max-width: 1024px) 100vw, 50vw"
          className="object-cover object-top"
          priority
        />
        <div
          className="pointer-events-none absolute inset-0"
          style={{ background: "linear-gradient(180deg, rgba(0,0,0,0.15) 0%, rgba(14,14,7,0.92) 100%)" }}
        />
        <div className="absolute bottom-0 left-0 right-0 space-y-2 p-4">
          <p className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: "var(--theme-accent)" }}>
            Evidence trail (sample)
          </p>
          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
            {pills.map((p) => (
              <div
                key={p.label}
                className="flex flex-1 items-start gap-2 rounded-xl px-3 py-2 sm:min-w-[140px]"
                style={{
                  border: "1px solid color-mix(in srgb, var(--theme-border) 85%, #fff 8%)",
                  backgroundColor: "color-mix(in srgb, var(--theme-panel) 55%, transparent)",
                  backdropFilter: "blur(10px)",
                  WebkitBackdropFilter: "blur(10px)",
                }}
              >
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" style={{ color: "#4ade80" }} aria-hidden />
                <div>
                  <p className="text-xs font-semibold" style={{ color: "var(--theme-foreground)" }}>
                    {p.label}
                  </p>
                  <p className="text-[10px]" style={{ color: "var(--theme-muted)" }}>
                    {p.sub}
                  </p>
                </div>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between pt-1">
            <p className="text-xs" style={{ color: "var(--theme-muted)" }}>
              Your scan compiles citations like these — then grades each angle.
            </p>
            <span className="font-mono text-xs font-semibold" style={{ color: "var(--theme-accent)" }}>
              27 sources
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export function HeroVisualShowcase({
  exampleHref,
  imageSrc,
  hostname,
  topDimensions,
}: {
  exampleHref: string;
  imageSrc: string;
  hostname: string;
  topDimensions: HeroPreviewDimension[];
}) {
  const [visual, setVisual] = useState<VisualId>("snapshot");

  useEffect(() => {
    const id = window.setTimeout(() => {
      setVisual(readSavedVisual());
    }, 0);
    return () => window.clearTimeout(id);
  }, []);

  const handleSelect = (id: VisualId) => {
    setVisual(id);
    try {
      localStorage.setItem(STORAGE_KEY, id);
    } catch {
      /* ignore */
    }
  };

  const topTwo = topDimensions.slice(0, 2);

  return (
    <div className="w-full max-w-lg space-y-3">
      <div
        className="flex flex-col gap-2 rounded-2xl p-1 sm:flex-row"
        style={{
          border: "1px solid var(--theme-border)",
          backgroundColor: "color-mix(in srgb, var(--theme-panel) 70%, transparent)",
        }}
        role="tablist"
        aria-label="Hero graphic style"
      >
        {VARIANTS.map((v) => {
          const selected = visual === v.id;
          const Icon = v.id === "snapshot" ? Layers : v.id === "verdict" ? Sparkles : CheckCircle2;
          return (
            <button
              key={v.id}
              type="button"
              role="tab"
              aria-selected={selected}
              tabIndex={selected ? 0 : -1}
              onClick={() => handleSelect(v.id)}
              className="flex min-w-0 flex-1 items-center gap-2 rounded-xl px-3 py-2 text-left transition-colors"
              style={{
                backgroundColor: selected ? "var(--theme-accent)" : "transparent",
                color: selected ? "var(--theme-accent-foreground)" : "var(--theme-muted)",
              }}
            >
              <Icon className="h-4 w-4 shrink-0 opacity-90" aria-hidden />
              <span className="min-w-0">
                <span className="block text-xs font-semibold">{v.label}</span>
                <span
                  className="block truncate text-[10px] leading-tight sm:text-[11px]"
                  style={{ color: selected ? "color-mix(in srgb, var(--theme-accent-foreground) 75%, transparent)" : undefined }}
                >
                  {v.hint}
                </span>
              </span>
            </button>
          );
        })}
      </div>

      <Link
        href={exampleHref}
        className="group relative block rounded-2xl transition-transform duration-300 hover:scale-[1.01] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--theme-accent)] focus-visible:ring-offset-4 focus-visible:ring-offset-[var(--theme-background)]"
        aria-label="Open full example scan report (demo data)"
      >
        <span
          className="absolute right-3 top-3 z-20 rounded-full px-3 py-1 text-xs font-semibold opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-visible:opacity-100"
          style={{
            backgroundColor: "color-mix(in srgb, var(--theme-accent) 92%, transparent)",
            color: "var(--theme-accent-foreground)",
            border: "1px solid color-mix(in srgb, var(--theme-accent) 40%, transparent)",
          }}
        >
          Full example →
        </span>
        {visual === "snapshot" && <VariantSnapshot imageSrc={imageSrc} hostname={hostname} topTwo={topTwo} />}
        {visual === "verdict" && <VariantVerdict imageSrc={imageSrc} hostname={hostname} topTwo={topTwo} />}
        {visual === "evidence" && <VariantEvidence imageSrc={imageSrc} hostname={hostname} />}
      </Link>

      <div className="flex justify-center">
        <Link
          href={exampleHref}
          className="text-center text-xs font-medium underline-offset-4 transition-colors hover:underline hover:[color:var(--theme-accent)]"
          style={{ color: "var(--theme-muted)" }}
        >
          Full example report (demo data) →
        </Link>
      </div>
    </div>
  );
}
