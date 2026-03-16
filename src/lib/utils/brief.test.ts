import { describe, expect, it } from "vitest";

import {
  createDefaultQuestionnaire,
  generateCreativeBrief,
  generateWireframeHandoff,
} from "@/lib/utils/brief";
import { buildAuditReportFromUrl } from "@/lib/mock/report-builder";

describe("brief utilities", () => {
  const report = buildAuditReportFromUrl("https://maplegroveclinic.com");

  it("creates a default questionnaire from the report context", () => {
    const questionnaire = createDefaultQuestionnaire(report);

    expect(questionnaire.primaryGoal).toMatch(/appointment/i);
    expect(questionnaire.mustHavePages).toMatch(/Homepage/);
  });

  it("generates a creative brief and handoff outline", () => {
    const questionnaire = createDefaultQuestionnaire(report);
    const brief = generateCreativeBrief(report, questionnaire);
    const handoff = generateWireframeHandoff(report, brief, true);

    expect(brief.goals.length).toBeGreaterThan(1);
    expect(handoff.projectStage).toBe("approved-for-wireframes");
    expect(handoff.approvalNote).toMatch(/can begin/i);
  });
});
