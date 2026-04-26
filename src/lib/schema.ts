import { z } from "zod";

// ── Letter grades ──────────────────────────────────────────────────────────
export const GRADES = ["A+", "A", "A-", "B+", "B", "B-", "C+", "C", "C-", "D+", "D", "D-", "F"] as const;
export type Grade = (typeof GRADES)[number];

export const DIMENSION_KEYS = [
  "legitimacy",
  "reputation",
  "visual_design",
  "ux_conversion",
  "transparency",
  "technical",
  "content",
  "social_presence",
  "longevity",
  "financial_signals",
] as const;
export type DimensionKey = (typeof DIMENSION_KEYS)[number];

export const DIMENSION_LABELS: Record<DimensionKey, string> = {
  legitimacy: "Business Legitimacy",
  reputation: "Online Reputation",
  visual_design: "Visual Design",
  ux_conversion: "UX / Conversion",
  transparency: "Transparency & Disclosure",
  technical: "Technical Health",
  content: "Content Quality",
  social_presence: "Social & Press Presence",
  longevity: "Domain & Company Longevity",
  financial_signals: "Financial Signals",
};

export const DIMENSION_WEIGHTS: Record<DimensionKey, number> = {
  legitimacy: 0.18,
  reputation: 0.15,
  visual_design: 0.14,
  ux_conversion: 0.12,
  transparency: 0.10,
  technical: 0.08,
  content: 0.08,
  social_presence: 0.07,
  longevity: 0.05,
  financial_signals: 0.03,
};

export const DIMENSION_COLORS: Record<DimensionKey, string> = {
  legitimacy: "#4ade80",
  reputation: "#60a5fa",
  visual_design: "#818cf8",
  ux_conversion: "#f7b21b",
  transparency: "#34d399",
  technical: "#fb923c",
  content: "#f472b6",
  social_presence: "#38bdf8",
  longevity: "#a78bfa",
  financial_signals: "#facc15",
};

// ── Zod schema ─────────────────────────────────────────────────────────────
const EvidenceItemSchema = z.object({
  claim: z.string(),
  url: z.string().url(),
  title: z.string().optional(),
});

const DimensionSchema = z.object({
  key: z.enum(DIMENSION_KEYS),
  label: z.string(),
  score: z.number().int().min(0).max(100),
  grade: z.enum(GRADES),
  weight: z.number(),
  verdict: z.string(),
  evidence: z.array(EvidenceItemSchema),
});

const FlagSchema = z.object({
  title: z.string(),
  detail: z.string(),
  url: z.string().url().optional(),
});

const RedFlagSchema = FlagSchema.extend({
  severity: z.enum(["low", "medium", "high", "critical"]),
});

const TimelineItemSchema = z.object({
  year: z.number().int(),
  event: z.string(),
  url: z.string().url().optional(),
});

const PeerSchema = z.object({
  domain: z.string(),
  comparison: z.string(),
});

const SourceSchema = z.object({
  url: z.string().url(),
  title: z.string(),
  domain: z.string().optional(),
});

export const WCSReportSchema = z.object({
  domain: z.string(),
  company_name: z.string().optional(),
  scanned_at: z.string().datetime(),
  overall: z.object({
    score: z.number().int().min(0).max(100),
    grade: z.enum(GRADES),
    headline: z.string(),
    one_liner: z.string(),
  }),
  dimensions: z.array(DimensionSchema).length(10),
  red_flags: z.array(RedFlagSchema),
  green_flags: z.array(FlagSchema),
  timeline: z.array(TimelineItemSchema).optional(),
  peers: z.array(PeerSchema).optional(),
  sources: z.array(SourceSchema).min(12),
  summary: z.string(),
});

export type WCSReport = z.infer<typeof WCSReportSchema>;
export type Dimension = z.infer<typeof DimensionSchema>;
export type EvidenceItem = z.infer<typeof EvidenceItemSchema>;
export type RedFlag = z.infer<typeof RedFlagSchema>;
export type TimelineItem = z.infer<typeof TimelineItemSchema>;

// ── JSON Schema for the Anthropic tool input ──────────────────────────────
export const WCS_REPORT_JSON_SCHEMA = {
  type: "object",
  required: ["domain", "scanned_at", "overall", "dimensions", "red_flags", "green_flags", "sources", "summary"],
  properties: {
    domain: { type: "string" },
    company_name: { type: "string" },
    scanned_at: { type: "string", format: "date-time" },
    overall: {
      type: "object",
      required: ["score", "grade", "headline", "one_liner"],
      properties: {
        score: { type: "integer", minimum: 0, maximum: 100 },
        grade: { type: "string", enum: GRADES },
        headline: { type: "string", description: "5-8 word verdict" },
        one_liner: { type: "string", description: "1-2 sentence narrative" },
      },
    },
    dimensions: {
      type: "array",
      minItems: 10,
      maxItems: 10,
      items: {
        type: "object",
        required: ["key", "label", "score", "grade", "weight", "verdict", "evidence"],
        properties: {
          key: { type: "string", enum: [...DIMENSION_KEYS] },
          label: { type: "string" },
          score: { type: "integer", minimum: 0, maximum: 100 },
          grade: { type: "string", enum: GRADES },
          weight: { type: "number" },
          verdict: { type: "string" },
          evidence: {
            type: "array",
            items: {
              type: "object",
              required: ["claim", "url"],
              properties: {
                claim: { type: "string" },
                url: { type: "string", format: "uri" },
                title: { type: "string" },
              },
            },
          },
        },
      },
    },
    red_flags: {
      type: "array",
      items: {
        type: "object",
        required: ["title", "detail", "severity"],
        properties: {
          title: { type: "string" },
          detail: { type: "string" },
          severity: { type: "string", enum: ["low", "medium", "high", "critical"] },
          url: { type: "string", format: "uri" },
        },
      },
    },
    green_flags: {
      type: "array",
      items: {
        type: "object",
        required: ["title", "detail"],
        properties: {
          title: { type: "string" },
          detail: { type: "string" },
          url: { type: "string", format: "uri" },
        },
      },
    },
    timeline: {
      type: "array",
      items: {
        type: "object",
        required: ["year", "event"],
        properties: {
          year: { type: "integer" },
          event: { type: "string" },
          url: { type: "string", format: "uri" },
        },
      },
    },
    peers: {
      type: "array",
      items: {
        type: "object",
        properties: {
          domain: { type: "string" },
          comparison: { type: "string" },
        },
      },
    },
    sources: {
      type: "array",
      minItems: 12,
      items: {
        type: "object",
        required: ["url", "title"],
        properties: {
          url: { type: "string", format: "uri" },
          title: { type: "string" },
          domain: { type: "string" },
        },
      },
    },
    summary: { type: "string", description: "300-500 word executive summary, written like a credit analyst." },
  },
} as const;

// ── Grade helpers ──────────────────────────────────────────────────────────
export function gradeColor(grade: Grade): string {
  if (grade === "A+" || grade === "A") return "#4ade80";
  if (grade === "A-") return "#34d399";
  if (grade === "B+" || grade === "B") return "#38bdf8";
  if (grade === "B-") return "#60a5fa";
  if (grade === "C+" || grade === "C") return "#facc15";
  if (grade === "C-") return "#fbbf24";
  if (grade === "D+" || grade === "D" || grade === "D-") return "#fb923c";
  return "#f87171"; // F
}

export function gradeLabel(grade: Grade): string {
  if (grade === "A+" || grade === "A") return "EXCELLENT";
  if (grade === "A-" || grade === "B+" || grade === "B") return "GREAT";
  if (grade === "B-" || grade === "C+" || grade === "C" || grade === "C-") return "AVERAGE";
  return "BELOW AVERAGE";
}

export function scoreToGrade(score: number): Grade {
  if (score >= 97) return "A+";
  if (score >= 93) return "A";
  if (score >= 90) return "A-";
  if (score >= 87) return "B+";
  if (score >= 83) return "B";
  if (score >= 80) return "B-";
  if (score >= 77) return "C+";
  if (score >= 73) return "C";
  if (score >= 70) return "C-";
  if (score >= 67) return "D+";
  if (score >= 63) return "D";
  if (score >= 60) return "D-";
  return "F";
}
