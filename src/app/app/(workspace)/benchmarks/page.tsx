import { BenchmarkLibraryPage } from "@/features/benchmarks/components/benchmark-library-page";
import { getWorkspaceAppContext } from "@/lib/product/context";
import {
  getPrimaryBenchmarkVerticals,
  getBenchmarkDesignNotes,
} from "@/lib/benchmarks/library";
import { buildBenchmarkLibrarySnapshot } from "@/lib/benchmarks/scans";

export const dynamic = "force-dynamic";

export default async function BenchmarksRoutePage() {
  await getWorkspaceAppContext();
  const snapshots = await buildBenchmarkLibrarySnapshot([
    ...getPrimaryBenchmarkVerticals(),
    "product-saas",
    "fintech",
  ]);

  return (
    <BenchmarkLibraryPage
      fallbackImage="/previews/fallback-desktop.svg"
      snapshots={snapshots.map((snapshot) => ({
        ...snapshot,
        label:
          snapshot.vertical === "service-providers"
            ? "Home & Commercial Services"
            : snapshot.vertical === "private-healthcare"
              ? "Private Dental & Healthcare"
              : snapshot.vertical === "fintech"
                ? "Fintech"
                : "Product & SaaS",
        notes: getBenchmarkDesignNotes(snapshot.vertical),
        rubric: {
          ...snapshot.rubric,
          title:
            snapshot.vertical === "service-providers"
              ? "Home and Commercial Services"
              : snapshot.vertical === "private-healthcare"
                ? "Private Dental and Healthcare"
                : snapshot.vertical === "fintech"
                  ? "Fintech"
                : snapshot.rubric.title,
        },
      }))}
    />
  );
}
