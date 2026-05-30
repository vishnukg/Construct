import { describe, expect, it, vi } from "vitest";
import { makeDevmetrics } from "../src/core/index.ts";
import type { DevmetricsSource, InsightEngine } from "../src/core/index.ts";
import silentLogger from "./helpers/silentLogger.ts";

describe("devmetrics report", () => {
  it("marks metrics as good, watch, or risk from their targets", async () => {
    const source: DevmetricsSource = {
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
    const insightEngine: InsightEngine = { summarize: async () => [] };

    const getReport = makeDevmetrics({
      source,
      insightEngine,
      logger: silentLogger,
      now: () => new Date("2026-01-01T00:00:00Z"),
    });

    const report = await getReport();

    expect(report.metrics.map((metric) => metric.status)).toEqual([
      "good",
      "watch",
      "risk",
    ]);
  });

  it("passes raw metrics to the insight engine", async () => {
    const source: DevmetricsSource = {
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
    const insightEngine: InsightEngine = { summarize: vi.fn(async () => []) };

    const getReport = makeDevmetrics({
      source,
      insightEngine,
      logger: silentLogger,
    });

    await getReport();

    expect(insightEngine.summarize).toHaveBeenCalledWith([
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
