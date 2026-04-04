/**
 * Demo workspace entry: enabled in development by default; in production only when
 * NEXT_PUBLIC_ENABLE_DEMO_WORKSPACE === "true".
 */
export const isDemoWorkspaceAllowed = (): boolean => {
  if (process.env.NEXT_PUBLIC_ENABLE_DEMO_WORKSPACE === "true") {
    return true;
  }

  if (process.env.NEXT_PUBLIC_ENABLE_DEMO_WORKSPACE === "false") {
    return false;
  }

  return process.env.NODE_ENV !== "production";
};
