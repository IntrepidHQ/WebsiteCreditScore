import type { Metadata } from "next";

import { SeoProductPage } from "@/features/seo/components/seo-product-page";
import { getWorkspaceDashboardContext } from "@/lib/product/context";

export const metadata: Metadata = {
  title: "SEO | WebsiteCreditScore.com",
};

export default async function AppSeoPage() {
  const { workspace, dashboard } = await getWorkspaceDashboardContext();
  const report = dashboard.savedReports[0]?.reportSnapshot ?? null;

  return <SeoProductPage report={report} workspace={workspace} />;
}
