"use client";

import { useState } from "react";
import type { CSSProperties } from "react";
import {
  Building2,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  Dumbbell,
  HardHat,
  Home,
  Monitor,
  Scale,
  ShoppingBag,
  Smile,
  Sparkles,
  Stethoscope,
  UtensilsCrossed,
  X,
  type LucideIcon,
} from "lucide-react";
import { getBenchmarkRubric } from "@/lib/benchmarks/library";
import type { BenchmarkVertical } from "@/lib/types/audit";

type IndustryCard = {
  id: BenchmarkVertical;
  label: string;
  icon: LucideIcon;
  color: string;
  photo: string;
};

const industries: IndustryCard[] = [
  {
    id: "service-providers",
    label: "Home & Service",
    icon: Home,
    color: "#60a5fa",
    photo: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=900&q=72",
  },
  {
    id: "private-healthcare",
    label: "Private Care",
    icon: Stethoscope,
    color: "#4ade80",
    photo: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=900&q=72",
  },
  {
    id: "product-saas",
    label: "Product & SaaS",
    icon: Monitor,
    color: "#818cf8",
    photo: "https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=900&q=72",
  },
  {
    id: "fintech",
    label: "Fintech",
    icon: CreditCard,
    color: "#f7b21b",
    photo: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=900&q=72",
  },
  {
    id: "legal",
    label: "Law Firms",
    icon: Scale,
    color: "#34d399",
    photo: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=900&q=72",
  },
  {
    id: "real-estate",
    label: "Real Estate",
    icon: Building2,
    color: "#fb923c",
    photo: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=900&q=72",
  },
  {
    id: "fitness",
    label: "Fitness & Studios",
    icon: Dumbbell,
    color: "#f472b6",
    photo: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=900&q=72",
  },
  {
    id: "beauty-wellness",
    label: "Beauty & Wellness",
    icon: Sparkles,
    color: "#38bdf8",
    photo: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=900&q=72",
  },
  {
    id: "construction-trades",
    label: "Construction & Trades",
    icon: HardHat,
    color: "#a78bfa",
    photo: "https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?auto=format&fit=crop&w=900&q=72",
  },
  {
    id: "restaurant-hospitality",
    label: "Restaurants",
    icon: UtensilsCrossed,
    color: "#facc15",
    photo: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=900&q=72",
  },
  {
    id: "dental",
    label: "Dental Practices",
    icon: Smile,
    color: "#4ade80",
    photo: "https://images.unsplash.com/photo-1606811971618-4486d14f3f99?auto=format&fit=crop&w=900&q=72",
  },
  {
    id: "retail-ecommerce",
    label: "Retail & E-commerce",
    icon: ShoppingBag,
    color: "#f7b21b",
    photo: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=900&q=72",
  },
];

function IndustryPhoto({ industry }: { industry: IndustryCard }) {
  return (
    <div
      className="relative h-36 overflow-hidden rounded-xl"
      style={{
        border: "1px solid color-mix(in srgb, var(--theme-border) 80%, transparent)",
        backgroundImage: `linear-gradient(180deg, rgba(12,12,6,0.12), rgba(12,12,6,0.72)), url(${industry.photo})`,
        backgroundPosition: "center",
        backgroundSize: "cover",
      }}
    >
      <div
        className="absolute inset-x-0 bottom-0 h-20"
        style={{
          background: `linear-gradient(0deg, color-mix(in srgb, ${industry.color} 30%, rgba(12,12,6,0.92)), transparent)`,
        }}
      />
    </div>
  );
}

export function IndustryStandards() {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const activeIndustry = activeIndex === null ? null : industries[activeIndex];
  const activeRubric = activeIndustry ? getBenchmarkRubric(activeIndustry.id) : null;

  const openIndustry = (index: number) => setActiveIndex(index);
  const closeIndustry = () => setActiveIndex(null);
  const stepIndustry = (direction: -1 | 1) => {
    setActiveIndex((current) => {
      const safeCurrent = current ?? 0;
      return (safeCurrent + direction + industries.length) % industries.length;
    });
  };

  return (
    <section
      className="px-6 py-16"
      style={{ borderBottom: "1px solid var(--theme-border)", backgroundColor: "var(--theme-background-alt)" }}
    >
      <div className="mx-auto max-w-5xl">
        <div className="mb-10 grid gap-5 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] lg:items-end">
          <div>
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.18em]" style={{ color: "var(--theme-accent)" }}>
              Calibrated by market
            </p>
            <h2 className="font-display leading-tight" style={{ fontSize: "clamp(2rem, 3.5vw, 2.75rem)", color: "var(--theme-foreground)" }}>
              Industry-specific standards
            </h2>
          </div>
          <p className="text-sm leading-relaxed sm:text-base" style={{ color: "var(--theme-muted)" }}>
            The score is not one generic website checklist. Each vertical changes what proof matters most: care providers need reassurance and credentials, SaaS needs product clarity and security signals, local services need fast contact and area proof.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {industries.map((industry, index) => {
            const rubric = getBenchmarkRubric(industry.id);
            const Icon = industry.icon;
            return (
              <button
                key={industry.id}
                type="button"
                onClick={() => openIndustry(index)}
                aria-label={`Open ${industry.label} industry rubric`}
                className="group rounded-2xl p-3 text-left transition-transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[var(--theme-background-alt)]"
                style={{
                  border: `1px solid ${industry.color}28`,
                  backgroundColor: `color-mix(in srgb, var(--theme-panel) 90%, ${industry.color}08)`,
                  "--tw-ring-color": industry.color,
                } as CSSProperties}
              >
                <IndustryPhoto industry={industry} />
                <div className="mt-4 flex items-start gap-3">
                  <span
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                    style={{ backgroundColor: `${industry.color}18`, border: `1px solid ${industry.color}28`, color: industry.color }}
                  >
                    <Icon className="h-5 w-5" strokeWidth={1.75} aria-hidden />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-semibold" style={{ color: "var(--theme-foreground)" }}>
                      {industry.label}
                    </span>
                    <span className="mt-1 line-clamp-2 block text-xs leading-relaxed" style={{ color: "var(--theme-muted)" }}>
                      {rubric.summary}
                    </span>
                  </span>
                </div>
                <span className="mt-4 inline-flex text-xs font-semibold" style={{ color: industry.color }}>
                  View rubric details →
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {activeIndustry && activeRubric ? (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/75 px-4 py-8 backdrop-blur-sm" onClick={closeIndustry}>
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="industry-rubric-title"
            className="max-h-[min(92vh,48rem)] w-full max-w-4xl overflow-y-auto rounded-2xl border shadow-2xl"
            style={{
              borderColor: `color-mix(in srgb, ${activeIndustry.color} 34%, var(--theme-border))`,
              background:
                "linear-gradient(180deg, color-mix(in srgb, var(--theme-panel) 96%, transparent), var(--theme-background-alt))",
            }}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="grid gap-0 md:grid-cols-[20rem_minmax(0,1fr)]">
              <div className="relative min-h-64 overflow-hidden md:min-h-full">
                <div
                  className="absolute inset-0"
                  style={{
                    backgroundImage: `linear-gradient(180deg, rgba(10,10,5,0.1), rgba(10,10,5,0.86)), url(${activeIndustry.photo})`,
                    backgroundPosition: "center",
                    backgroundSize: "cover",
                  }}
                />
                <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, ${activeIndustry.color}44, transparent 60%)` }} />
                <div className="relative flex h-full min-h-64 flex-col justify-end p-5">
                  <p className="text-xs font-bold uppercase tracking-[0.18em]" style={{ color: activeIndustry.color }}>
                    {activeIndex! + 1} / {industries.length}
                  </p>
                  <h2 id="industry-rubric-title" className="mt-2 font-display text-4xl leading-none" style={{ color: "var(--theme-foreground)" }}>
                    {activeIndustry.label}
                  </h2>
                </div>
              </div>

              <div className="p-5 sm:p-7">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.18em]" style={{ color: activeIndustry.color }}>
                      Rubric details
                    </p>
                    <h3 className="mt-2 text-xl font-semibold" style={{ color: "var(--theme-foreground)" }}>
                      {activeRubric.title}
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={closeIndustry}
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border transition-opacity hover:opacity-80"
                    style={{ borderColor: "var(--theme-border)", color: "var(--theme-muted)" }}
                    aria-label="Close industry rubric"
                  >
                    <X className="h-4 w-4" aria-hidden />
                  </button>
                </div>

                <p className="mt-4 text-sm leading-relaxed" style={{ color: "var(--theme-muted)" }}>
                  {activeRubric.summary}
                </p>

                {activeRubric.fastLifts.length > 0 ? (
                  <div className="mt-6 rounded-2xl border p-4" style={{ borderColor: `${activeIndustry.color}24`, backgroundColor: "var(--theme-panel)" }}>
                    <p className="text-xs font-bold uppercase tracking-[0.14em]" style={{ color: activeIndustry.color }}>
                      Fast improvements
                    </p>
                    <ul className="mt-3 space-y-2">
                      {activeRubric.fastLifts.map((lift) => (
                        <li key={lift} className="flex gap-2 text-sm leading-relaxed" style={{ color: "var(--theme-muted)" }}>
                          <span style={{ color: activeIndustry.color }}>→</span>
                          <span>{lift}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}

                <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {activeRubric.criteria.slice(0, 4).map((criterion) => (
                    <div key={criterion.id} className="rounded-xl border p-4" style={{ borderColor: `${activeIndustry.color}18`, backgroundColor: "var(--theme-panel)" }}>
                      <div className="mb-3 h-0.5 w-full rounded-full" style={{ backgroundColor: activeIndustry.color, opacity: 0.45 }} />
                      <p className="text-sm font-semibold" style={{ color: "var(--theme-foreground)" }}>
                        {criterion.title}
                      </p>
                      <p className="mt-2 text-xs leading-relaxed" style={{ color: "var(--theme-muted)" }}>
                        {criterion.description}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="mt-6 flex items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => stepIndustry(-1)}
                    aria-label="Show previous industry rubric"
                    className="inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold transition-opacity hover:opacity-85"
                    style={{ borderColor: "var(--theme-border)", color: "var(--theme-foreground)" }}
                  >
                    <ChevronLeft className="h-4 w-4" aria-hidden />
                    Previous
                  </button>
                  <button
                    type="button"
                    onClick={() => stepIndustry(1)}
                    aria-label="Show next industry rubric"
                    className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition-opacity hover:opacity-90"
                    style={{ backgroundColor: activeIndustry.color, color: "#090904" }}
                  >
                    Next
                    <ChevronRight className="h-4 w-4" aria-hidden />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
