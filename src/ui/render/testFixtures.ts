import type {
  DevmetricsReport,
  Insight,
  MetricSummary,
} from "../../app/core/index.ts";

export const testMetric = (overrides: Partial<MetricSummary> = {}): MetricSummary => ({
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

export const testInsight = (overrides: Partial<Insight> = {}): Insight => ({
  title: "Test Insight",
  detail: "This is a test insight detail.",
  severity: "info",
  relatedMetricIds: [],
  ...overrides,
});

export const testReport = (overrides: Partial<DevmetricsReport> = {}): DevmetricsReport => ({
  generatedAt: new Date("2026-01-01T00:00:00Z"),
  metrics: [testMetric()],
  insights: [testInsight()],
  ...overrides,
});
