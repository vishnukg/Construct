import type {
  DevmetricsReport,
  Insight,
  MetricSummary,
} from "../app/core/index.ts";

export const makeTestMetric = (overrides: Partial<MetricSummary> = {}): MetricSummary => ({
  id: "test-metric",
  label: "Test Metric",
  value: 8,
  unit: "days",
  target: 10,
  trend: "flat",
  lowerIsBetter: true,
  status: "good",
  deltaFromTarget: -2,
  ...overrides,
});

export const makeTestInsight = (overrides: Partial<Insight> = {}): Insight => ({
  title: "Test Insight",
  detail: "This is a test insight detail.",
  severity: "info",
  relatedMetricIds: [],
  ...overrides,
});

export const makeTestReport = (overrides: Partial<DevmetricsReport> = {}): DevmetricsReport => ({
  generatedAt: new Date("2026-01-01T00:00:00Z"),
  metrics: [makeTestMetric()],
  insights: [makeTestInsight()],
  ...overrides,
});
