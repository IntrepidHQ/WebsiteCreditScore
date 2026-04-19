import type { Metadata } from "next";

/**
 * DRAFT terms of service. Structural skeleton; every `{{PLACEHOLDER}}` must
 * be replaced before launch. Review with counsel.
 *
 * Placeholders:
 *   COMPANY_LEGAL_NAME, JURISDICTION, REFUND_WINDOW_DAYS, LIABILITY_CAP_USD,
 *   SUPPORT_EMAIL.
 */

export const metadata: Metadata = {
  title: "Terms of Service (Draft) | WebsiteCreditScore.com",
  description:
    "Draft terms of service for WebsiteCreditScore.com. Covers use of the service, credits, billing, and liability.",
};

export default function TermsPage() {
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
        <h1>Terms of Service</h1>
        <p>
          <em>Last updated: {"{{LAST_UPDATED_DATE}}"}</em>
        </p>

        <h2>1. Acceptance</h2>
        <p>
          By creating an account or using the service, you agree to these Terms. If you do not
          agree, do not use the service. If you are using the service on behalf of an organization,
          you represent that you have authority to bind that organization.
        </p>

        <h2>2. The service</h2>
        <p>
          WebsiteCreditScore.com (&ldquo;the service&rdquo;) provides automated website auditing,
          scoring, and related workflows. The service is operated by {"{{COMPANY_LEGAL_NAME}}"}.
          We may change, add, or remove features at any time.
        </p>

        <h2>3. Accounts</h2>
        <p>
          You are responsible for keeping your account credentials secure and for activity taken
          under your account. Notify us immediately at {"{{SUPPORT_EMAIL}}"} if you suspect
          unauthorized access.
        </p>

        <h2>4. Acceptable use</h2>
        <p>You agree not to:</p>
        <ul>
          <li>
            Scan websites that you do not own and do not have explicit permission to scan.
          </li>
          <li>Use the service to harass, defame, or harm others.</li>
          <li>Attempt to reverse-engineer, scrape, or bypass rate limits.</li>
          <li>Resell the service without a written agreement.</li>
          <li>Use the service to violate applicable law.</li>
        </ul>

        <h2>5. Credits and billing</h2>
        <p>
          Paid plans grant credits that you consume as you use the service. Credits are a balance
          meter — not cryptocurrency, not a stored-value product. Once a credit is consumed, it is
          non-refundable. Unused credits may be refunded within{" "}
          {"{{REFUND_WINDOW_DAYS}}"} days of purchase at our discretion.
        </p>
        <p>
          Payments are processed by Stripe. By providing payment information, you authorize us to
          charge the applicable amount for the plan or add-on you selected.
        </p>

        <h2>6. Intellectual property</h2>
        <p>
          You retain ownership of any content you submit (e.g. URLs you scan). We own the service
          itself, including the scoring engine, the rubric, generated prompts, and aggregated
          insights derived from multiple customers in anonymized form. You may use reports we
          produce for your own site (or sites you have permission to audit) for any lawful
          purpose, including client work.
        </p>

        <h2>7. AI output</h2>
        <p>
          Portions of the service use large language models to generate summaries and
          recommendations. AI output may contain inaccuracies. You are responsible for reviewing
          any AI-generated content before relying on it.
        </p>

        <h2>8. Warranty disclaimer</h2>
        <p>
          THE SERVICE IS PROVIDED &ldquo;AS IS&rdquo; AND &ldquo;AS AVAILABLE,&rdquo; WITHOUT
          WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING WARRANTIES OF MERCHANTABILITY,
          FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT. WE DO NOT WARRANT THAT THE
          SERVICE WILL BE UNINTERRUPTED, ERROR-FREE, OR THAT THE SCORING WILL BE ACCURATE FOR
          YOUR SPECIFIC CIRCUMSTANCES.
        </p>

        <h2>9. Limitation of liability</h2>
        <p>
          TO THE MAXIMUM EXTENT PERMITTED BY LAW, OUR TOTAL LIABILITY FOR ANY CLAIM ARISING OUT
          OF OR RELATING TO THE SERVICE IS LIMITED TO THE GREATER OF (A) THE AMOUNT YOU PAID US
          IN THE 12 MONTHS PRECEDING THE CLAIM, OR (B) {"{{LIABILITY_CAP_USD}}"} USD. WE ARE NOT
          LIABLE FOR INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES.
        </p>

        <h2>10. Indemnity</h2>
        <p>
          You agree to indemnify and hold us harmless from claims arising out of your use of the
          service in violation of these Terms or applicable law, including claims from owners of
          sites you scanned without permission.
        </p>

        <h2>11. Termination</h2>
        <p>
          You may cancel your account at any time. We may suspend or terminate your account for
          violations of these Terms. Unused credits at termination are forfeited unless required
          by law.
        </p>

        <h2>12. Governing law</h2>
        <p>
          These Terms are governed by the laws of {"{{JURISDICTION}}"}, without regard to
          conflicts-of-laws principles. Any dispute will be resolved in the courts of{" "}
          {"{{JURISDICTION}}"}.
        </p>

        <h2>13. Changes</h2>
        <p>
          We may update these Terms. Material changes will be noted on this page with a new
          &ldquo;last updated&rdquo; date. Continued use after changes means you accept them.
        </p>

        <h2>14. Contact</h2>
        <p>Questions: {"{{SUPPORT_EMAIL}}"}.</p>
      </article>
    </main>
  );
}
