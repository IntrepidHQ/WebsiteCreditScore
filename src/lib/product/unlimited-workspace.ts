/**
 * When true (e.g. Vercel: WCS_UNLIMITED_WORKSPACE=true), workspace token checks
 * and deductions are skipped and new workspaces get pro-style defaults.
 */
export const isUnlimitedWorkspace = (): boolean => {
  const v = process.env.WCS_UNLIMITED_WORKSPACE?.trim().toLowerCase();
  return v === "true" || v === "1" || v === "yes";
};
