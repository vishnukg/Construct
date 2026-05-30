import { describe, expect, it } from "vitest";
import makeRuleBasedInsightEngine from "../src/app/adapters/insights/makeRuleBasedInsightEngine.ts";

describe("rule based insight engine", () => {
  it("creates critical insights for metrics far outside target", async () => {
    const engine = makeRuleBasedInsightEngine();

    const insights = await engine.summarize([
      {
        id: "code-size",
        label: "Median PR size",
        value: 420,
        unit: "lines",
        target: 300,
        trend: "up",
        lowerIsBetter: true,
      },
    ]);

    expect(insights).toEqual([
      {
        title: "Median PR size needs attention",
        detail: "420 lines is above the target of 300 lines.",
        severity: "critical",
        relatedMetricIds: ["code-size"],
      },
    ]);
  });
});
