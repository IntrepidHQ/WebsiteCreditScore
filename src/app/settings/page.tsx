import Link from "next/link";

import { PublicThemeSettingsScope } from "@/features/theme/components/public-theme-settings-scope";
import { SettingsPanel } from "@/features/theme/components/settings-panel";

export const metadata = {
  title: "Theme & branding · WebsiteCreditScore.com",
  description: "Customize accent, typography, and motion. Saved in this browser.",
};

export default function PublicThemeSettingsPage() {
  return (
    <PublicThemeSettingsScope>
      <div className="mx-auto w-full max-w-8xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-8 space-y-3">
          <Link className="text-sm text-muted transition hover:text-foreground" href="/">
            ← Back to home
          </Link>
          <h1 className="font-display text-[clamp(2rem,1.5rem+1.2vw,2.75rem)] leading-tight tracking-tight text-foreground">
            Theme &amp; branding
          </h1>
          <p className="max-w-2xl text-sm leading-7 text-muted">
            Adjust the live preview for this site on <strong className="text-foreground">this device</strong>.
            Preferences are stored in your browser. When you use the workspace, the same controls are available
            under{" "}
            <Link className="text-accent underline underline-offset-2" href="/app/settings">
              Workspace → Settings
            </Link>{" "}
            after sign-in (saved under your account scope on this device).
          </p>
        </div>
        <SettingsPanel />
      </div>
    </PublicThemeSettingsScope>
  );
}
