import type { Metadata } from "next";

import { BenchmarkLibraryPage } from "@/features/benchmarks/components/benchmark-library-page";
import { buildBenchmarkLibrarySnapshot, getBenchmarkVerticalLabel } from "@/lib/benchmarks/scans";
import { getPrimaryBenchmarkVerticals, getBenchmarkDesignNotes } from "@/lib/benchmarks/library";

export const metadata: Metadata = {
  title: "2026 Web Design Benchmarks",
};

export default async function AppBenchmarksPage() {
  const verticals = getPrimaryBenchmarkVerticals();
  const snapshots = await buildBenchmarkLibrarySnapshot(verticals);

  return (
    <BenchmarkLibraryPage
      fallbackImage="/previews/fallback-desktop.svg"
      snapshots={snapshots.map((snapshot) => ({
        ...snapshot,
        label: getBenchmarkVerticalLabel(snapshot.vertical),
        notes: getBenchmarkDesignNotes(snapshot.vertical),
      }))}
    />
  );
}
