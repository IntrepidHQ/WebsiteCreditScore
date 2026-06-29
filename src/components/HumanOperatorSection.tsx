"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import {
  ExternalLink,
  Linkedin,
  Github,
  Mail,
  CheckCircle2,
  Radar,
  Workflow,
  Cpu,
  ArrowRight,
} from "lucide-react";

// ── Shared card shell ───────────────────────────────────────────────────────
const cardStyle = {
  border: "1px solid var(--theme-border)",
  backgroundColor: "var(--theme-panel)",
} as const;

const reveal = {
  hidden: { opacity: 0, y: 24 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] as const },
  }),
};

// ── 1. POV Matrix — bars that count up on view ──────────────────────────────
const POV_ROWS = [
  { label: "Trust", value: 88, color: "#4ade80" },
  { label: "Proof", value: 73, color: "#60a5fa" },
  { label: "Intent", value: 67, color: "#f7b21b" },
  { label: "Taste", value: 91, color: "#a78bfa" },
];

function PovMatrixGraphic({ active }: { active: boolean }) {
  return (
    <div
      className="rounded-xl p-4"
      style={{ border: "1px solid var(--theme-border)", backgroundColor: "var(--theme-background)" }}
    >
      <div className="mb-3 flex items-center justify-between">
        <span className="font-mono text-[10px] uppercase tracking-[0.18em]" style={{ color: "var(--theme-muted)" }}>
          POV Matrix
        </span>
        <Radar className="h-3.5 w-3.5" style={{ color: "var(--theme-accent)" }} aria-hidden />
      </div>
      <div className="space-y-2.5">
        {POV_ROWS.map((row, i) => (
          <div key={row.label}>
            <div className="mb-1 flex items-center justify-between text-[11px]">
              <span style={{ color: "var(--theme-foreground)" }}>{row.label}</span>
              <motion.span
                className="font-score"
                style={{ color: row.color }}
                initial={{ opacity: 0 }}
                animate={active ? { opacity: 1 } : { opacity: 0 }}
                transition={{ delay: 0.3 + i * 0.12 }}
              >
                {row.value}
              </motion.span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full" style={{ backgroundColor: "var(--theme-border)" }}>
              <motion.div
                className="h-full rounded-full"
                style={{ backgroundColor: row.color }}
                initial={{ width: 0 }}
                animate={active ? { width: `${row.value}%` } : { width: 0 }}
                transition={{ duration: 0.9, delay: 0.2 + i * 0.12, ease: [0.22, 1, 0.36, 1] }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── 2. Scan → Plan → Ship — auto-cycling pipeline ───────────────────────────
const PIPELINE = [
  { id: "scan", label: "Scan", desc: "Crawl + 10-angle research", color: "#60a5fa" },
  { id: "plan", label: "Plan", desc: "Prioritized redesign map", color: "#f7b21b" },
  { id: "ship", label: "Ship", desc: "Supervised build + publish", color: "#4ade80" },
] as const;

function ShipGraphic({ active }: { active: boolean }) {
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (!active) return;
    const id = window.setInterval(() => setStep((s) => (s + 1) % PIPELINE.length), 1800);
    return () => window.clearInterval(id);
  }, [active]);

  const current = PIPELINE[step];

  return (
    <div
      className="rounded-xl p-4"
      style={{ border: "1px solid var(--theme-border)", backgroundColor: "var(--theme-background)" }}
    >
      <div className="mb-3 flex items-center justify-between">
        <span className="font-mono text-[10px] uppercase tracking-[0.18em]" style={{ color: "var(--theme-muted)" }}>
          Pipeline
        </span>
        <Workflow className="h-3.5 w-3.5" style={{ color: "var(--theme-accent)" }} aria-hidden />
      </div>

      {/* node row */}
      <div className="relative mb-4 flex items-center justify-between">
        <div
          className="absolute left-4 right-4 top-1/2 h-px -translate-y-1/2"
          style={{ backgroundColor: "var(--theme-border)" }}
        />
        <motion.div
          className="absolute left-4 top-1/2 h-px -translate-y-1/2"
          style={{ backgroundColor: current.color }}
          animate={{ width: `${(step / (PIPELINE.length - 1)) * 80}%` }}
          transition={{ duration: 0.6 }}
        />
        {PIPELINE.map((node, i) => {
          const reached = i <= step;
          return (
            <div key={node.id} className="relative z-10 flex flex-col items-center gap-1.5">
              <motion.div
                className="flex h-7 w-7 items-center justify-center rounded-full text-[10px] font-bold"
                animate={{
                  backgroundColor: reached ? node.color : "var(--theme-panel)",
                  scale: i === step ? 1.15 : 1,
                }}
                transition={{ duration: 0.3 }}
                style={{ border: `1px solid ${reached ? node.color : "var(--theme-border)"}`, color: reached ? "#0a0a07" : "var(--theme-muted)" }}
              >
                {i + 1}
              </motion.div>
              <span
                className="text-[10px] font-semibold"
                style={{ color: i === step ? node.color : "var(--theme-muted)" }}
              >
                {node.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* status line */}
      <AnimatePresence mode="wait">
        <motion.div
          key={current.id}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.25 }}
          className="flex items-center justify-between rounded-lg px-3 py-2"
          style={{ backgroundColor: "var(--theme-panel)", border: "1px solid var(--theme-border)" }}
        >
          <span className="text-[11px]" style={{ color: "var(--theme-foreground)" }}>
            {current.desc}
          </span>
          <span className="flex items-center gap-1.5">
            <span className="relative flex h-2 w-2">
              <span
                className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-75"
                style={{ backgroundColor: current.color }}
              />
              <span className="relative inline-flex h-2 w-2 rounded-full" style={{ backgroundColor: current.color }} />
            </span>
            <span className="font-mono text-[10px]" style={{ color: current.color }}>
              {current.id === "ship" ? "PUBLISHED" : "RUNNING"}
            </span>
          </span>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

// ── 3. Agent Console — supervision toggle + agents coming online ────────────
const AGENTS = ["Research", "Taste", "Build", "Ship-ready"];

function AgentConsoleGraphic({ active }: { active: boolean }) {
  return (
    <div
      className="rounded-xl p-4"
      style={{ border: "1px solid var(--theme-border)", backgroundColor: "var(--theme-background)" }}
    >
      <div className="mb-3 flex items-center justify-between">
        <span className="font-mono text-[10px] uppercase tracking-[0.18em]" style={{ color: "var(--theme-muted)" }}>
          Agent Console
        </span>
        <Cpu className="h-3.5 w-3.5" style={{ color: "var(--theme-accent)" }} aria-hidden />
      </div>

      {/* supervision toggle */}
      <div
        className="mb-3 flex items-center justify-between rounded-lg px-3 py-2"
        style={{ backgroundColor: "var(--theme-panel)", border: "1px solid color-mix(in srgb, #4ade80 30%, var(--theme-border))" }}
      >
        <span className="flex items-center gap-2 text-[11px]" style={{ color: "var(--theme-foreground)" }}>
          <CheckCircle2 className="h-3.5 w-3.5" style={{ color: "#4ade80" }} aria-hidden />
          Human Supervision
        </span>
        <motion.div
          className="relative h-4 w-7 rounded-full"
          style={{ backgroundColor: "#4ade80" }}
          initial={{ opacity: 0.4 }}
          animate={active ? { opacity: 1 } : { opacity: 0.4 }}
        >
          <motion.span
            className="absolute top-0.5 h-3 w-3 rounded-full bg-white"
            initial={{ left: 2 }}
            animate={active ? { left: 14 } : { left: 2 }}
            transition={{ duration: 0.4, delay: 0.3 }}
          />
        </motion.div>
      </div>

      {/* agents coming online */}
      <div className="grid grid-cols-2 gap-2">
        {AGENTS.map((a, i) => (
          <motion.div
            key={a}
            className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5"
            style={{ backgroundColor: "var(--theme-panel)", border: "1px solid var(--theme-border)" }}
            initial={{ opacity: 0, x: -8 }}
            animate={active ? { opacity: 1, x: 0 } : { opacity: 0, x: -8 }}
            transition={{ delay: 0.4 + i * 0.15 }}
          >
            <motion.span
              className="h-1.5 w-1.5 rounded-full"
              style={{ backgroundColor: "#4ade80" }}
              animate={active ? { opacity: [0.3, 1, 0.3] } : {}}
              transition={{ duration: 1.6, repeat: Infinity, delay: i * 0.2 }}
            />
            <span className="text-[10px]" style={{ color: "var(--theme-foreground)" }}>
              {a}
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// ── Operator links ──────────────────────────────────────────────────────────
const OPERATOR_LINKS = [
  { label: "HansTurner.com", href: "https://hansturner.com", Icon: ExternalLink },
  { label: "LinkedIn", href: "https://www.linkedin.com/in/hans-turner", Icon: Linkedin },
  { label: "Public GitHub repo", href: "https://github.com/IntrepidHQ", Icon: Github },
];

export function HumanOperatorSection() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section
      className="px-6 py-20"
      style={{ borderTop: "1px solid var(--theme-border)", backgroundColor: "var(--theme-background)" }}
      aria-label="Human operator"
    >
      <div ref={ref} className="mx-auto max-w-7xl">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
          {/* Card 1 — operator intro */}
          <motion.div
            custom={0}
            variants={reveal}
            initial="hidden"
            animate={inView ? "show" : "hidden"}
            className="flex flex-col gap-5 rounded-2xl p-6 sm:p-7 lg:col-span-5"
            style={cardStyle}
          >
            <p className="text-xs font-semibold uppercase tracking-[0.2em]" style={{ color: "var(--theme-accent)" }}>
              Human Operator
            </p>
            <h2
              className="font-display leading-[1.05]"
              style={{ fontSize: "clamp(2.2rem, 3.6vw, 3.1rem)", color: "var(--theme-foreground)" }}
            >
              Real experience combined with the latest models.
            </h2>
            <p className="text-sm leading-relaxed" style={{ color: "var(--theme-muted)" }}>
              WebsiteCreditScore is shaped by how I evaluate websites after years of building, reviewing, and improving
              them for real businesses. The AI does the research quickly; the product is trained around my taste for
              clear positioning, visible proof, low-friction UX, and the technical decisions that make a site feel
              credible.
            </p>
            <div className="flex flex-wrap gap-2">
              {OPERATOR_LINKS.map(({ label, href, Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-opacity hover:opacity-80"
                  style={{ border: "1px solid var(--theme-border)", color: "var(--theme-foreground)" }}
                >
                  <Icon className="h-3.5 w-3.5" aria-hidden />
                  {label}
                </a>
              ))}
            </div>
            <a
              href="mailto:websitecreditscore@gmail.com"
              className="inline-flex w-fit items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-opacity hover:opacity-80"
              style={{ border: "1px solid rgba(247,178,27,0.3)", backgroundColor: "rgba(247,178,27,0.08)", color: "var(--theme-accent)" }}
            >
              <Mail className="h-3.5 w-3.5" aria-hidden />
              websitecreditscore@gmail.com
            </a>
          </motion.div>

          {/* Card 2 — POV matrix */}
          <motion.div
            custom={1}
            variants={reveal}
            initial="hidden"
            animate={inView ? "show" : "hidden"}
            className="flex flex-col gap-4 rounded-2xl p-5 sm:p-6 lg:col-span-3"
            style={cardStyle}
          >
            <PovMatrixGraphic active={inView} />
            <div>
              <h3 className="font-display text-xl leading-tight" style={{ color: "var(--theme-foreground)" }}>
                The score has a point of view
              </h3>
              <p className="mt-2 text-xs leading-relaxed" style={{ color: "var(--theme-muted)" }}>
                The rubric reflects how I judge trust, clarity, taste, and buyer momentum after years of shipping sites.
              </p>
            </div>
          </motion.div>

          {/* Card 3 — scan→plan→ship */}
          <motion.div
            custom={2}
            variants={reveal}
            initial="hidden"
            animate={inView ? "show" : "hidden"}
            className="flex flex-col gap-4 rounded-2xl p-5 sm:p-6 lg:col-span-2"
            style={cardStyle}
          >
            <ShipGraphic active={inView} />
            <div>
              <h3 className="font-display text-xl leading-tight" style={{ color: "var(--theme-foreground)" }}>
                From scan to sharper site
              </h3>
              <p className="mt-2 text-xs leading-relaxed" style={{ color: "var(--theme-muted)" }}>
                A report can become a supervised redesign plan: what to scan, map, improve, and publish first.
              </p>
              <a
                href="/docs"
                className="mt-2 inline-flex items-center gap-1 text-[11px] font-semibold transition-opacity hover:opacity-80"
                style={{ color: "var(--theme-accent)" }}
              >
                View methodology <ArrowRight className="h-3 w-3" aria-hidden />
              </a>
            </div>
          </motion.div>

          {/* Card 4 — agent console */}
          <motion.div
            custom={3}
            variants={reveal}
            initial="hidden"
            animate={inView ? "show" : "hidden"}
            className="flex flex-col gap-4 rounded-2xl p-5 sm:p-6 lg:col-span-2"
            style={cardStyle}
          >
            <AgentConsoleGraphic active={inView} />
            <div>
              <h3 className="font-display text-xl leading-tight" style={{ color: "var(--theme-foreground)" }}>
                Agents need direction
              </h3>
              <p className="mt-2 text-xs leading-relaxed" style={{ color: "var(--theme-muted)" }}>
                Real experience steering the latest models — a human operator on every report.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
