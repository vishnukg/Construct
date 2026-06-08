import { expect, test, vi } from "vitest";
import { makeDevmetrics } from "../../index.ts";
import type { DevmetricsSource, InsightEngine } from "../../index.ts";
import makeNoOpLogger from "../../../adapters/logger/makeNoOpLogger.ts";

test("makeDevmetrics: given metrics at different distances from their targets, assigns the correct status to each", async () => {
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

  const report = await makeDevmetrics({
    source: stubSource,
    insightEngine: { summarize: async () => [] },
    logger: makeNoOpLogger(),
    now: () => new Date("2026-01-01T00:00:00Z"),
  })();

  expect(report.metrics.map((m) => m.status)).toEqual([
    "good",
    "watch",
    "risk",
  ]);
});

test("makeDevmetrics: given a metrics source, forwards raw metrics to the insight engine unchanged", async () => {
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
  const mockInsightEngine: InsightEngine = { summarize: vi.fn(async () => []) };

  await makeDevmetrics({
    source: stubSource,
    insightEngine: mockInsightEngine,
    logger: makeNoOpLogger(),
  })();

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

test("makeDevmetrics: when the source throws, logs the failure with context and re-throws", async () => {
  const failingSource: DevmetricsSource = {
    listMetrics: async () => {
      throw new Error("source unavailable");
    },
  };
  const logger = { info: vi.fn(), warn: vi.fn(), error: vi.fn() };

  const getReport = makeDevmetrics({
    source: failingSource,
    insightEngine: { summarize: async () => [] },
    logger,
  });

  await expect(getReport()).rejects.toThrow("source unavailable");
  expect(logger.error).toHaveBeenCalledWith(
    "devmetrics.report.failed",
    expect.objectContaining({ message: "source unavailable" }),
  );
});

test("makeDevmetrics: when the insight engine throws, logs the failure and re-throws", async () => {
  const stubSource: DevmetricsSource = { listMetrics: async () => [] };
  const failingEngine: InsightEngine = {
    summarize: async () => {
      throw new Error("engine down");
    },
  };
  const logger = { info: vi.fn(), warn: vi.fn(), error: vi.fn() };

  const getReport = makeDevmetrics({
    source: stubSource,
    insightEngine: failingEngine,
    logger,
  });

  await expect(getReport()).rejects.toThrow("engine down");
  expect(logger.error).toHaveBeenCalledWith(
    "devmetrics.report.failed",
    expect.objectContaining({ message: "engine down" }),
  );
});
