import type { ClientProfile, ReportProfileType } from "@/lib/types/audit";

export const profileClientProfiles: Record<
  ReportProfileType,
  Omit<ClientProfile, "competitors">
> = {
  healthcare: {
    type: "healthcare",
    industryLabel: "Healthcare Provider",
    audience: "Patients comparing local care options and booking windows.",
    primaryGoal: "Increase appointment requests without sacrificing trust.",
    trustDrivers: [
      "Provider credibility",
      "Insurance clarity",
      "Patient-friendly mobile intake",
    ],
  },
  "local-service": {
    type: "local-service",
    industryLabel: "Local Service Business",
    audience: "Homeowners who need fast reassurance before they call.",
    primaryGoal: "Convert more local intent into booked estimates.",
    trustDrivers: [
      "Local proof",
      "Fast contact paths",
      "Visible process and guarantees",
    ],
  },
  saas: {
    type: "saas",
    industryLabel: "B2B SaaS",
    audience: "Buyers evaluating product fit, proof, and time-to-value.",
    primaryGoal: "Turn more curious traffic into qualified demos.",
    trustDrivers: [
      "Outcome-led messaging",
      "Product proof",
      "Clear next-step commitment",
    ],
  },
};

export const comparisonMetrics = [
  { id: "clarity", label: "Message Clarity" },
  { id: "trust", label: "Trust Depth" },
  { id: "mobile", label: "Mobile Polish" },
  { id: "seo", label: "Search Coverage" },
] as const;
