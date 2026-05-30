import { describe, expect, it, vi } from "vitest";
import { makeDevmetrics } from "../src/app/core/index.ts";
import type { DevmetricsSource, InsightEngine } from "../src/app/core/index.ts";
import silentLogger from "./helpers/silentLogger.ts";

describe("makeDevmetrics", () => {
  describe("given metrics at different distances from their targets", () => {
    it("when the report is generated, then each metric receives the correct status", async () => {
      // Arrange
      const stubSource: DevmetricsSource = {
        listMetrics: async () => [
          {
            id: "good",
            label: "Good",
            value: 8,
            unit: "hours",
            target: 10,
            trend: "down",
            lowerIsBetter: true,
          },
          {
            id: "watch",
            label: "Watch",
            value: 11,
            unit: "hours",
            target: 10,
            trend: "flat",
            lowerIsBetter: true,
          },
          {
            id: "risk",
            label: "Risk",
            value: 14,
            unit: "hours",
            target: 10,
            trend: "up",
            lowerIsBetter: true,
          },
        ],
      };
      const stubInsightEngine: InsightEngine = { summarize: async () => [] };

      const getReport = makeDevmetrics({
        source: stubSource,
        insightEngine: stubInsightEngine,
        logger: silentLogger,
        now: () => new Date("2026-01-01T00:00:00Z"),
      });

      // Act
      const report = await getReport();

      // Assert
      expect(report.metrics.map((m) => m.status)).toEqual(["good", "watch", "risk"]);
    });
  });

  describe("given a metrics source with one metric", () => {
    it("when the report is generated, then the raw metrics are forwarded to the insight engine unchanged", async () => {
      // Arrange
      const stubSource: DevmetricsSource = {
        listMetrics: async () => [
          {
            id: "dlt",
            label: "Delivery lead time",
            value: 4,
            unit: "days",
            target: 3,
            trend: "up",
            lowerIsBetter: true,
          },
        ],
      };
      const mockInsightEngine: InsightEngine = {
        summarize: vi.fn(async () => []),
      };

      const getReport = makeDevmetrics({
        source: stubSource,
        insightEngine: mockInsightEngine,
        logger: silentLogger,
      });

      // Act
      await getReport();

      // Assert
      expect(mockInsightEngine.summarize).toHaveBeenCalledWith([
        {
          id: "dlt",
          label: "Delivery lead time",
          value: 4,
          unit: "days",
          target: 3,
          trend: "up",
          lowerIsBetter: true,
        },
      ]);
    });
  });
});
