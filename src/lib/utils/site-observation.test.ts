import { describe, expect, it } from "vitest";

import {
  extractVerifiedFacts,
  trimToSentenceBoundary,
} from "@/lib/utils/site-observation";

describe("site observation helpers", () => {
  it("prefers tel links over noisier page text for phone facts", () => {
    const html = `
      <html>
        <body>
          <p>Office: 1003158908</p>
          <a href="tel:+18437674700">Call now</a>
          <script type="application/ld+json">
            { "telephone": "(843) 000-0000" }
          </script>
        </body>
      </html>
    `;

    const facts = extractVerifiedFacts(html, ["Office: 1003158908"], "");
    const phone = facts.find((fact) => fact.type === "phone");

    expect(phone?.value).toBe("(843) 767-4700");
    expect(phone?.source).toBe("tel-link");
    expect(phone?.confidence).toBe("verified");
  });

  it("does not create a phone fact from a naked 10-digit string", () => {
    const html = `
      <html>
        <body>
          <p>Tracking ID 1003158908</p>
        </body>
      </html>
    `;

    const facts = extractVerifiedFacts(html, ["Tracking ID 1003158908"], "");

    expect(facts.some((fact) => fact.type === "phone")).toBe(false);
  });

  it("trims text at sentence boundaries instead of clipping mid-word", () => {
    const text =
      "Mark Deford M.D. specializes in Physical Medicine and Rehabilitation and practices in North Charleston, SC 29406-9164. This second sentence should not be clipped awkwardly.";

    expect(trimToSentenceBoundary(text, 120)).toBe(
      "Mark Deford M.D. specializes in Physical Medicine and Rehabilitation and practices in North Charleston, SC 29406-9164.",
    );
  });
});
