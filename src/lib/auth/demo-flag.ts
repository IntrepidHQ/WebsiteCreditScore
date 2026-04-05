/**
 * Controls whether the "Continue in demo workspace" option is shown on the
 * login page. Set NEXT_PUBLIC_DEMO_WORKSPACE=false to hide it in production.
 * Defaults to true so the app is always accessible without auth.
 */
export function isDemoWorkspaceAllowed(): boolean {
  return process.env.NEXT_PUBLIC_DEMO_WORKSPACE !== "false";
}
