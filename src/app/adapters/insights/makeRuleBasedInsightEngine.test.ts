import { expect, test } from "vitest";
import makeRuleBasedInsightEngine from "./makeRuleBasedInsightEngine.ts";
import type { Devmetric } from "../../core/index.ts";

test("makeRuleBasedInsightEngine: given a metric more than 25% above its target (lower is better), produces a critical insight", async () => {
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

  const insights = await makeRuleBasedInsightEngine().summarize(metrics);

  expect(insights).toEqual([
    {
      title: "Median PR size needs attention",
      detail: "420 lines is above the target of 300 lines.",
      severity: "critical",
      relatedMetricIds: ["code-size"],
    },
  ]);
});

test("makeRuleBasedInsightEngine: given a metric within 25% above its target (lower is better), produces a warning insight", async () => {
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

  const insights = await makeRuleBasedInsightEngine().summarize(metrics);

  expect(insights).toEqual([
    {
      title: "PR wait time is drifting",
      detail: "Current value is 9.5 hours; keep it near 8 hours.",
      severity: "warning",
      relatedMetricIds: ["pr-wait"],
    },
  ]);
});

test("makeRuleBasedInsightEngine: given all metrics within their targets, produces a healthy info insight", async () => {
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

  const insights = await makeRuleBasedInsightEngine().summarize(metrics);

  expect(insights).toEqual([
    {
      title: "Flow looks healthy",
      detail: "All tracked metrics are within their current targets.",
      severity: "info",
      relatedMetricIds: ["deploy-time"],
    },
  ]);
});

test("makeRuleBasedInsightEngine: given a metric more than 25% below its target (higher is better), produces a critical insight", async () => {
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

  const insights = await makeRuleBasedInsightEngine().summarize(metrics);

  expect(insights).toEqual([
    {
      title: "Test coverage needs attention",
      detail: "60 % is below the target of 80 %.",
      severity: "critical",
      relatedMetricIds: ["test-coverage"],
    },
  ]);
});
