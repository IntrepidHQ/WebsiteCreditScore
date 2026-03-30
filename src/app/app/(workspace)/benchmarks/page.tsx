import { BenchmarkLibraryPage } from "@/features/benchmarks/components/benchmark-library-page";
import { getWorkspaceAppContext } from "@/lib/product/context";
import {
  getPrimaryBenchmarkVerticals,
  getDesignPatternNotesForProfile,
} from "@/lib/benchmarks/library";
import { buildBenchmarkLibrarySnapshot } from "@/lib/benchmarks/scans";

export const dynamic = "force-dynamic";

export default async function BenchmarksRoutePage() {
  await getWorkspaceAppContext();
  const snapshots = await buildBenchmarkLibrarySnapshot([
    ...getPrimaryBenchmarkVerticals(),
    "product-saas",
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
              : "Product & SaaS",
        notes: getDesignPatternNotesForProfile(
          snapshot.vertical === "service-providers"
            ? "local-service"
            : snapshot.vertical === "private-healthcare"
              ? "healthcare"
              : "saas",
        ),
        rubric: {
          ...snapshot.rubric,
          title:
            snapshot.vertical === "service-providers"
              ? "Home and Commercial Services"
              : snapshot.vertical === "private-healthcare"
                ? "Private Dental and Healthcare"
                : snapshot.rubric.title,
        },
      }))}
    />
  );
}
