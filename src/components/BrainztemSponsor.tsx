"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowUpRight, BrainCircuit, Check, X } from "lucide-react";

type SponsorUnlockProps = {
  domain: string;
  compact?: boolean;
  onUnlocked?: (token: string) => void;
  onClose?: () => void;
};

function BrainBuild({ active }: { active: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const points = Array.from({ length: 330 }, (_, index) => {
      const theta = index * 2.399963;
      const seed = ((index * 73) % 101) / 101;
      const lobe = index % 3;
      const radius = 0.28 + seed * 0.7;
      const x = Math.cos(theta) * radius * (lobe === 1 ? 0.9 : 1.1);
      const y = Math.sin(theta) * radius * 0.68 + (lobe === 2 ? 0.16 : -0.04);
      return { x, y, phase: seed * Math.PI * 2, gate: (index / 330) * 24 };
    });
    let raf = 0;
    const draw = (now: number) => {
      const time = now / 1000;
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const width = Math.max(1, Math.round(rect.width));
      const height = Math.max(1, Math.round(rect.height));
      if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
        canvas.width = width * dpr;
        canvas.height = height * dpr;
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, width, height);
      const scale = Math.min(width / 2.45, height / 1.7);
      for (const point of points) {
        const rotation = reduced ? 0 : Math.sin(time * 0.35) * 0.12;
        const x = width / 2 + (point.x * Math.cos(rotation) - point.y * Math.sin(rotation)) * scale;
        const y = height / 2 + (point.x * Math.sin(rotation) + point.y * Math.cos(rotation)) * scale;
        const landed = active ? Math.min(1, Math.max(0, (time % 25 - point.gate) / 1.8)) : 0.38;
        const pulse = reduced ? 1 : 0.68 + 0.32 * Math.sin(time * 2 + point.phase);
        const color = point.y < 0 ? "214,167,74" : "92,224,190";
        ctx.fillStyle = `rgba(${color},${(0.05 + landed * 0.72 * pulse).toFixed(3)})`;
        ctx.fillRect(x - 1.2, y - 1.2, 2.4, 2.4);
      }
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, [active]);
  return <canvas ref={canvasRef} aria-hidden className="absolute inset-0 h-full w-full" />;
}

export function BrainztemSponsor({ domain, compact = false, onUnlocked, onClose }: SponsorUnlockProps) {
  const [seconds, setSeconds] = useState(0);
  const [started, setStarted] = useState(false);
  const [complete, setComplete] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!started || complete) return;
    const id = window.setInterval(() => setSeconds((value) => Math.min(30, value + 1)), 1000);
    return () => window.clearInterval(id);
  }, [started, complete]);

  useEffect(() => {
    if (!started || seconds !== 30 || complete) return;
    void (async () => {
      const response = await fetch("/api/scan/sponsor", {
        method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ action: "complete", domain }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data.sponsorToken) {
        setError(data.error ?? "Sponsor unlock could not be completed");
        return;
      }
      setComplete(true);
      onUnlocked?.(data.sponsorToken);
    })();
  }, [complete, domain, onUnlocked, seconds, started]);

  const begin = async () => {
    setError("");
    const response = await fetch("/api/scan/sponsor", {
      method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ action: "start", domain }),
    });
    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      setError(data.error ?? "Sponsor preview is unavailable");
      return;
    }
    setSeconds(0);
    setStarted(true);
  };

  const canSkip = seconds >= 10;
  const label = complete ? "Aerial scan unlocked" : started ? seconds < 10 ? `Skip available in ${10 - seconds}s` : seconds < 30 ? `Keep watching · ${30 - seconds}s` : "Unlocking scan…" : "Watch Brainztem to cover this scan";
  return (
    <aside className={`relative overflow-hidden rounded-xl border ${compact ? "p-3" : "p-5 sm:p-6"}`} style={{ borderColor: "color-mix(in srgb, var(--theme-accent) 30%, var(--theme-border))", background: "linear-gradient(115deg, #111714, color-mix(in srgb, var(--theme-panel) 84%, #15251e))" }}>
      <div className="pointer-events-none absolute inset-0 opacity-80"><BrainBuild active={started && !complete} /></div>
      <div className="relative z-10 flex min-h-28 flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div className="max-w-md">
          <p className="text-[10px] font-bold uppercase tracking-[0.16em]" style={{ color: "#82e2be" }}>Sponsored by Brainztem</p>
          <h2 className={`${compact ? "mt-1 text-base" : "mt-2 text-2xl sm:text-3xl"} font-display leading-none`} style={{ color: "var(--theme-foreground)" }}>Turn a website into a working brain.</h2>
          <p className="mt-2 text-xs leading-relaxed" style={{ color: "color-mix(in srgb, var(--theme-foreground) 72%, transparent)" }}>
            {compact ? "Your scan is still running. See what a private Brainztem can become from the same public evidence." : "Watch the full 30-second preview and this public Aerial scan is sponsored. Skip after 10 seconds with no charge and no reward."}
          </p>
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          {complete ? <span className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-bold" style={{ color: "#82e2be", backgroundColor: "rgba(74,222,128,0.12)" }}><Check className="h-3.5 w-3.5" /> {label}</span> : !started ? <button type="button" onClick={() => void begin()} className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-bold" style={{ backgroundColor: "var(--theme-accent)", color: "var(--theme-accent-foreground)" }}><BrainCircuit className="h-3.5 w-3.5" /> {label}</button> : <><span className="text-xs font-semibold" style={{ color: "#dbeade" }}>{label}</span>{canSkip && onClose ? <button type="button" onClick={onClose} className="inline-flex items-center gap-1 rounded-lg border px-3 py-2 text-xs font-semibold" style={{ borderColor: "rgba(255,255,255,0.2)", color: "var(--theme-foreground)" }}>Skip <X className="h-3.5 w-3.5" /></button> : null}</>}
          {compact && !started && <a href="https://brainztem.com" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs font-semibold" style={{ color: "#82e2be" }}>Explore <ArrowUpRight className="h-3.5 w-3.5" /></a>}
        </div>
      </div>
      {started && <div className="relative z-10 mt-4 h-1 overflow-hidden rounded-full" style={{ backgroundColor: "rgba(255,255,255,0.12)" }}><div className="h-full rounded-full transition-[width] duration-1000" style={{ width: `${(seconds / 30) * 100}%`, backgroundColor: "#82e2be" }} /></div>}
      {error ? <p className="relative z-10 mt-3 text-xs text-red-300">{error}</p> : null}
    </aside>
  );
}
