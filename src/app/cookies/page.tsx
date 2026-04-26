import type { Metadata } from "next";

/**
 * DRAFT cookies policy. Structural skeleton. Review with counsel and
 * confirm the actual cookies the production build sets before publishing.
 *
 * Placeholders:
 *   COMPANY_LEGAL_NAME, PRIVACY_EMAIL.
 */

export const metadata: Metadata = {
  title: "Cookies Policy (Draft) | WebsiteCreditScore.com",
  description:
    "Draft cookies policy for WebsiteCreditScore.com. Lists the cookies we set, their purpose, and how to opt out.",
};

export default function CookiesPage() {
  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <div
        role="alert"
        className="mb-8 rounded-lg border border-warning/40 bg-warning/10 p-4 text-sm text-foreground"
      >
        <strong className="font-semibold">DRAFT — REVIEW WITH COUNSEL BEFORE LAUNCH.</strong> This
        document is a structural placeholder. Replace every <code>{"{{PLACEHOLDER}}"}</code> value,
        confirm the actual cookie list in production, have qualified counsel review, and remove
        this banner before publishing.
      </div>

      <article className="prose prose-neutral max-w-none">
        <h1>Cookies Policy</h1>
        <p>
          <em>Last updated: {"{{LAST_UPDATED_DATE}}"}</em>
        </p>

        <p>
          This policy explains which cookies {"{{COMPANY_LEGAL_NAME}}"} sets on websitecreditscore.com,
          what each cookie does, and how you can manage or disable them.
        </p>

        <h2>What cookies we set</h2>

        <div className="not-prose overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border">
              <tr>
                <th className="py-2 pr-4 font-semibold">Name / prefix</th>
                <th className="py-2 pr-4 font-semibold">Purpose</th>
                <th className="py-2 pr-4 font-semibold">Duration</th>
                <th className="py-2 pr-4 font-semibold">Set by</th>
              </tr>
            </thead>
            <tbody className="[&>tr]:border-b [&>tr]:border-border/40">
              <tr>
                <td className="py-2 pr-4 font-mono text-xs">sb-*</td>
                <td className="py-2 pr-4">Authentication session (Supabase).</td>
                <td className="py-2 pr-4">Session / up to 7 days</td>
                <td className="py-2 pr-4">Supabase</td>
              </tr>
              <tr>
                <td className="py-2 pr-4 font-mono text-xs">craydl-demo-session</td>
                <td className="py-2 pr-4">
                  Demo session unlock for local preview environments. Not set in production.
                </td>
                <td className="py-2 pr-4">Session</td>
                <td className="py-2 pr-4">WebsiteCreditScore.com</td>
              </tr>
              <tr>
                <td className="py-2 pr-4 font-mono text-xs">__stripe_mid</td>
                <td className="py-2 pr-4">Stripe fraud prevention.</td>
                <td className="py-2 pr-4">1 year</td>
                <td className="py-2 pr-4">Stripe</td>
              </tr>
              <tr>
                <td className="py-2 pr-4 font-mono text-xs">__stripe_sid</td>
                <td className="py-2 pr-4">Stripe session tracking during checkout.</td>
                <td className="py-2 pr-4">30 minutes</td>
                <td className="py-2 pr-4">Stripe</td>
              </tr>
              <tr>
                <td className="py-2 pr-4 font-mono text-xs">_vercel_analytics</td>
                <td className="py-2 pr-4">Aggregate, privacy-friendly traffic analytics.</td>
                <td className="py-2 pr-4">24 hours</td>
                <td className="py-2 pr-4">Vercel</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h2>Categories</h2>
        <ul>
          <li>
            <strong>Strictly necessary:</strong> <code>sb-*</code>, <code>craydl-demo-session</code>
            — required for sign-in and session state. Disabling these will break authentication.
          </li>
          <li>
            <strong>Functional:</strong> <code>__stripe_mid</code>, <code>__stripe_sid</code> —
            required for secure checkout. Disabling them will prevent purchases.
          </li>
          <li>
            <strong>Analytics:</strong> <code>_vercel_analytics</code> — aggregate, anonymized
            metrics. Disabling is safe.
          </li>
        </ul>

        <h2>How to manage cookies</h2>
        <p>
          Most browsers allow you to view, delete, and block cookies via their settings.
          Disabling strictly necessary cookies will break sign-in and checkout. We respect the
          <em>Do Not Track</em> browser signal where technically feasible.
        </p>

        <h2>Third-party cookies</h2>
        <p>
          Stripe and Vercel set their own cookies when you interact with their embedded surfaces
          (checkout, analytics). Their own privacy policies describe those cookies in detail.
        </p>

        <h2>Contact</h2>
        <p>Questions: {"{{PRIVACY_EMAIL}}"}.</p>
      </article>
    </main>
  );
}
