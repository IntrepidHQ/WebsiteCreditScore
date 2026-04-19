/**
 * Shared privacy-redaction helpers used by both the mock and live admin
 * data sources. Keeping them in one place ensures redaction behaviour is
 * identical whether we're rendering seed data or Supabase rows.
 */

import type { AdminCustomer, AdminScan } from "./mock-data";

export const applyPrivacyToCustomer = (customer: AdminCustomer): AdminCustomer => {
  if (!customer.isPrivacyProtected) {
    return customer;
  }
  return {
    ...customer,
    displayName: "Private account",
    email: `•••@${customer.email.split("@")[1] ?? "hidden"}`,
  };
};

export const applyPrivacyToScan = (
  scan: AdminScan,
  customer: Pick<AdminCustomer, "isPrivacyProtected">,
): AdminScan => {
  if (!customer.isPrivacyProtected) {
    return scan;
  }
  try {
    const host = new URL(scan.url).hostname;
    const [first, ...rest] = host.split(".");
    const masked =
      first && first.length > 1
        ? `${first[0]}${"•".repeat(Math.max(1, first.length - 1))}`
        : "•••";
    return { ...scan, url: `https://${masked}${rest.length ? "." + rest.join(".") : ""}` };
  } catch {
    return { ...scan, url: "https://•••.hidden" };
  }
};
