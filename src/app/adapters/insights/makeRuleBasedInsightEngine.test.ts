import { expect, test } from "vitest";
import makeRuleBasedInsightEngine from "./makeRuleBasedInsightEngine.ts";
import type { Devmetric } from "../../core/index.ts";

test("produces a critical insight when metric is more than 25% above target (lower is better)", async () => {
  const metrics: Devmetric[] = [
    { id: "code-size", label: "Median PR size", value: 420, unit: "lines", target: 300, trend: "up", lowerIsBetter: true },
  ];

  const insights = await makeRuleBasedInsightEngine().summarize(metrics);

  expect(insights).toEqual([{
    title: "Median PR size needs attention",
    detail: "420 lines is above the target of 300 lines.",
    severity: "critical",
    relatedMetricIds: ["code-size"],
  }]);
});

test("produces a warning insight when metric is within 25% above target (lower is better)", async () => {
  const metrics: Devmetric[] = [
    { id: "pr-wait", label: "PR wait time", value: 9.5, unit: "hours", target: 8, trend: "flat", lowerIsBetter: true },
  ];

  const insights = await makeRuleBasedInsightEngine().summarize(metrics);

  expect(insights).toEqual([{
    title: "PR wait time is drifting",
    detail: "Current value is 9.5 hours; keep it near 8 hours.",
    severity: "warning",
    relatedMetricIds: ["pr-wait"],
  }]);
});

test("produces a healthy info insight when all metrics are within target", async () => {
  const metrics: Devmetric[] = [
    { id: "deploy-time", label: "Deployment time", value: 18, unit: "minutes", target: 20, trend: "down", lowerIsBetter: true },
  ];

  const insights = await makeRuleBasedInsightEngine().summarize(metrics);

  expect(insights).toEqual([{
    title: "Flow looks healthy",
    detail: "All tracked metrics are within their current targets.",
    severity: "info",
    relatedMetricIds: ["deploy-time"],
  }]);
});

test("produces a critical insight when metric is more than 25% below target (higher is better)", async () => {
  const metrics: Devmetric[] = [
    { id: "test-coverage", label: "Test coverage", value: 60, unit: "%", target: 80, trend: "down", lowerIsBetter: false },
  ];

  const insights = await makeRuleBasedInsightEngine().summarize(metrics);

  expect(insights).toEqual([{
    title: "Test coverage needs attention",
    detail: "60 % is below the target of 80 %.",
    severity: "critical",
    relatedMetricIds: ["test-coverage"],
  }]);
});
