import { describe, expect, it } from "vitest";
import makeRuleBasedInsightEngine from "./makeRuleBasedInsightEngine.ts";
import type { Devmetric } from "../../core/index.ts";

describe("makeRuleBasedInsightEngine", () => {
  describe("given a metric more than 25% above its target (lowerIsBetter)", () => {
    it("when summarized, then a critical insight is produced", async () => {
      // Arrange
      const engine = makeRuleBasedInsightEngine();
      const metrics: Devmetric[] = [
        {
          id: "code-size",
          label: "Median PR size",
          value: 420,
          unit: "lines",
          target: 300,
          trend: "up",
          lowerIsBetter: true,
        },
      ];

      // Act
      const insights = await engine.summarize(metrics);

      // Assert
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

  describe("given a metric within 25% above its target (lowerIsBetter)", () => {
    it("when summarized, then a warning insight is produced", async () => {
      // Arrange
      const engine = makeRuleBasedInsightEngine();
      const metrics: Devmetric[] = [
        {
          id: "pr-wait",
          label: "PR wait time",
          value: 9.5,
          unit: "hours",
          target: 8,
          trend: "flat",
          lowerIsBetter: true,
        },
      ];

      // Act
      const insights = await engine.summarize(metrics);

      // Assert
      expect(insights).toEqual([
        {
          title: "PR wait time is drifting",
          detail: "Current value is 9.5 hours; keep it near 8 hours.",
          severity: "warning",
          relatedMetricIds: ["pr-wait"],
        },
      ]);
    });
  });

  describe("given all metrics within their targets", () => {
    it("when summarized, then a single healthy info insight is produced", async () => {
      // Arrange
      const engine = makeRuleBasedInsightEngine();
      const metrics: Devmetric[] = [
        {
          id: "deploy-time",
          label: "Deployment time",
          value: 18,
          unit: "minutes",
          target: 20,
          trend: "down",
          lowerIsBetter: true,
        },
      ];

      // Act
      const insights = await engine.summarize(metrics);

      // Assert
      expect(insights).toEqual([
        {
          title: "Flow looks healthy",
          detail: "All tracked metrics are within their current targets.",
          severity: "info",
          relatedMetricIds: ["deploy-time"],
        },
      ]);
    });
  });

  describe("given a metric more than 25% below its target (higherIsBetter)", () => {
    it("when summarized, then a critical insight is produced", async () => {
      // Arrange
      const engine = makeRuleBasedInsightEngine();
      const metrics: Devmetric[] = [
        {
          id: "test-coverage",
          label: "Test coverage",
          value: 60,
          unit: "%",
          target: 80,
          trend: "down",
          lowerIsBetter: false,
        },
      ];

      // Act
      const insights = await engine.summarize(metrics);

      // Assert
      expect(insights).toEqual([
        {
          title: "Test coverage needs attention",
          detail: "60 % is below the target of 80 %.",
          severity: "critical",
          relatedMetricIds: ["test-coverage"],
        },
      ]);
    });
  });
});
