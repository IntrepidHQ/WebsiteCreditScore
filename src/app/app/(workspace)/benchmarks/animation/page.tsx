import type { Metadata } from "next";

import { BenchmarkAnimationPage } from "@/features/benchmarks/components/benchmark-animation-page";

export const metadata: Metadata = {
  title: "Animation | 2026 Web Design Benchmarks",
};

export default function AppBenchmarkAnimationPage() {
  return <BenchmarkAnimationPage />;
}
