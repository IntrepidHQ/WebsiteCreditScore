import type { Metadata } from "next";

/**
 * DRAFT privacy policy. This is a structural skeleton seeded with placeholders
 * a founder + counsel can fill in before launch. Every `{{PLACEHOLDER}}` must
 * be replaced with a real value — do NOT remove the review banner until counsel
 * has signed off.
 *
 * Placeholders to fill before launch:
 *   COMPANY_LEGAL_NAME, REGISTERED_ADDRESS, PRIVACY_EMAIL, SUPPORT_EMAIL,
 *   JURISDICTION, RETENTION_DAYS, DPO_CONTACT.
 */

export const metadata: Metadata = {
  title: "Privacy Policy (Draft) | WebsiteCreditScore.com",
  description:
    "Draft privacy policy for WebsiteCreditScore.com. Describes what we collect, how we use it, and the subprocessors that power the service.",
};

export default function PrivacyPage() {
  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <div
        role="alert"
        className="mb-8 rounded-lg border border-warning/40 bg-warning/10 p-4 text-sm text-foreground"
      >
        <strong className="font-semibold">DRAFT — REVIEW WITH COUNSEL BEFORE LAUNCH.</strong> This
        document is a structural placeholder. Replace every <code>{"{{PLACEHOLDER}}"}</code> value,
        have qualified counsel review, and remove this banner before publishing.
      </div>

      <article className="prose prose-neutral max-w-none">
        <h1>Privacy Policy</h1>
        <p>
          <em>Last updated: {"{{LAST_UPDATED_DATE}}"}</em>
        </p>

        <h2>Who we are</h2>
        <p>
          This site is operated by {"{{COMPANY_LEGAL_NAME}}"} (&ldquo;we,&rdquo; &ldquo;us,&rdquo;
          or &ldquo;our&rdquo;), registered at {"{{REGISTERED_ADDRESS}}"}. For privacy inquiries,
          contact {"{{PRIVACY_EMAIL}}"}.
        </p>

        <h2>Data we collect</h2>
        <h3>Account data</h3>
        <ul>
          <li>Email address and name (obtained via Google OAuth when you sign in).</li>
          <li>
            Workspace metadata (name, billing plan, entitlements, credit balance) that you or we
            generate as you use the service.
          </li>
        </ul>

        <h3>Scan data</h3>
        <ul>
          <li>URLs you submit for scanning.</li>
          <li>Screenshots and rendered HTML snapshots of those URLs.</li>
          <li>Performance metrics from Google PageSpeed Insights.</li>
          <li>Generated scoring reports and AI-written recommendations.</li>
        </ul>

        <h3>Billing data</h3>
        <ul>
          <li>Stripe customer ID and checkout session references.</li>
          <li>
            Payment method details are handled entirely by Stripe. We do not store full card numbers
            or CVVs on our systems.
          </li>
        </ul>

        <h3>Analytics</h3>
        <ul>
          <li>
            Aggregate, anonymized traffic analytics via Vercel Analytics. No cross-site tracking.
          </li>
        </ul>

        <h2>How we use your data</h2>
        <ul>
          <li>To deliver the scan results you requested.</li>
          <li>To operate your account and billing.</li>
          <li>To improve the scoring system (using anonymized aggregate data only).</li>
          <li>To communicate about your account when necessary (e.g. billing issues).</li>
        </ul>

        <h2>Lawful bases (where GDPR / UK GDPR applies)</h2>
        <ul>
          <li>
            <strong>Contract:</strong> data necessary to deliver the service you signed up for.
          </li>
          <li>
            <strong>Legitimate interest:</strong> security, fraud prevention, improving the
            scoring engine using aggregate anonymized inputs.
          </li>
          <li>
            <strong>Consent:</strong> any optional marketing communications.
          </li>
        </ul>

        <h2>Retention</h2>
        <p>
          Account records are retained while your account is active and for{" "}
          {"{{RETENTION_DAYS}}"} days after deletion for audit and legal purposes. Scan reports are
          retained for the life of the workspace unless you delete them earlier. Stripe retains
          billing data per its own policies.
        </p>

        <h2>Subprocessors</h2>
        <p>
          We use the following subprocessors. Each has its own privacy commitments, linked where
          available.
        </p>
        <ul>
          <li>
            <strong>Supabase</strong> — authentication, database, storage.
          </li>
          <li>
            <strong>Stripe</strong> — payments.
          </li>
          <li>
            <strong>Vercel</strong> — hosting, analytics.
          </li>
          <li>
            <strong>Anthropic</strong> — AI-generated recommendations and enrichment.
          </li>
          <li>
            <strong>Firecrawl</strong> — HTML content retrieval for scans.
          </li>
          <li>
            <strong>Browserless</strong> — headless browser screenshots.
          </li>
          <li>
            <strong>Google PageSpeed Insights</strong> — performance metrics.
          </li>
          <li>
            <strong>Resend</strong> — transactional email (where applicable).
          </li>
        </ul>

        <h2>Your rights</h2>
        <p>
          Depending on your jurisdiction, you may have the right to access, correct, delete,
          export, or restrict processing of your data. To exercise any of these rights, email{" "}
          {"{{PRIVACY_EMAIL}}"} from the email address on your account.
        </p>
        <p>
          If you are in the EEA or UK, our data protection contact is{" "}
          {"{{DPO_CONTACT}}"}.
        </p>

        <h2>International transfers</h2>
        <p>
          Our subprocessors may process data in countries outside your own. Where data is
          transferred out of the EEA or UK, we rely on the recipient's own SCCs, adequacy
          determinations, or equivalent safeguards.
        </p>

        <h2>Children</h2>
        <p>
          The service is not intended for children under 16. If you believe a child has signed up,
          email {"{{PRIVACY_EMAIL}}"} and we will delete the account.
        </p>

        <h2>Changes to this policy</h2>
        <p>
          We will post any material changes here and update the &ldquo;last updated&rdquo; date.
          Continued use after changes means you accept the updated policy.
        </p>

        <h2>Contact</h2>
        <p>
          Questions: {"{{PRIVACY_EMAIL}}"}. Support: {"{{SUPPORT_EMAIL}}"}. Registered address:{" "}
          {"{{REGISTERED_ADDRESS}}"}.
        </p>
      </article>
    </main>
  );
}
