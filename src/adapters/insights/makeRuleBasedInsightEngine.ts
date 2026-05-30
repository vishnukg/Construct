import type { Devmetric, Insight, InsightEngine } from "../../core/index.ts";

const makeRiskInsight = (metric: Devmetric): Insight => ({
  title: `${metric.label} needs attention`,
  detail: `${metric.value} ${metric.unit} is above the target of ${metric.target} ${metric.unit}.`,
  severity: "critical",
  relatedMetricIds: [metric.id],
});

const makeWatchInsight = (metric: Devmetric): Insight => ({
  title: `${metric.label} is drifting`,
  detail: `Current value is ${metric.value} ${metric.unit}; keep it near ${metric.target} ${metric.unit}.`,
  severity: "warning",
  relatedMetricIds: [metric.id],
});

const getRatio = (metric: Devmetric) =>
  metric.lowerIsBetter
    ? metric.value / metric.target
    : metric.target / metric.value;

const makeMetricInsight = (metric: Devmetric): Insight[] => {
  const ratio = getRatio(metric);

  if (ratio > 1.25) {
    return [makeRiskInsight(metric)];
  }

  if (ratio > 1) {
    return [makeWatchInsight(metric)];
  }

  return [];
};

const getMetricId = (metric: Devmetric) => metric.id;

const makeHealthyInsight = (metrics: Devmetric[]): Insight => ({
  title: "Flow looks healthy",
  detail: "All tracked metrics are within their current targets.",
  severity: "info",
  relatedMetricIds: metrics.map(getMetricId),
});

const makeRuleBasedInsightEngine = (): InsightEngine => {
  const summarizeMetrics = async (metrics: Devmetric[]) => {
    const insights = metrics.flatMap(makeMetricInsight);

    if (insights.length > 0) {
      return insights;
    }

    return [makeHealthyInsight(metrics)];
  };

  return {
    summarize: summarizeMetrics,
  };
};

export default makeRuleBasedInsightEngine;
