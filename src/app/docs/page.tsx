import type { Metadata } from "next";
import { DocsPage } from "@/features/docs/components/docs-page";

export const metadata: Metadata = {
  title: "Documentation & Knowledge Base",
  description:
    "Learn how WebsiteCreditScore.com works — the scoring system, benchmarks, the MAX workflow, and how to turn audit results into a build-ready brief.",
  openGraph: {
    title: "Documentation & Knowledge Base",
    description:
      "Everything you need to understand the scoring system, run audits, and turn results into actionable redesign direction.",
  },
};

export default function DocsRoutePage() {
  return <DocsPage />;
}
