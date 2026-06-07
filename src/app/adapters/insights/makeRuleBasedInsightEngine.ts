import type { Devmetric, Insight, InsightEngine } from "../../core/index.ts";

// These are plain transforms — they map a metric to Insight *data*. They close
// over no dependencies and return a value, so they are ordinary functions, not
// `make*` factories. Only makeRuleBasedInsightEngine (which returns the
// InsightEngine port) is a factory.

const riskInsight = (metric: Devmetric): Insight => ({
  title: `${metric.label} needs attention`,
  detail: metric.lowerIsBetter
    ? `${metric.value} ${metric.unit} is above the target of ${metric.target} ${metric.unit}.`
    : `${metric.value} ${metric.unit} is below the target of ${metric.target} ${metric.unit}.`,
  severity: "critical",
  relatedMetricIds: [metric.id],
});

const watchInsight = (metric: Devmetric): Insight => ({
  title: `${metric.label} is drifting`,
  detail: `Current value is ${metric.value} ${metric.unit}; keep it near ${metric.target} ${metric.unit}.`,
  severity: "warning",
  relatedMetricIds: [metric.id],
});

const getRatio = (metric: Devmetric) => {
  if (metric.target === 0) {
    return metric.value === 0 ? 1 : 2;
  }
  return metric.lowerIsBetter
    ? metric.value / metric.target
    : metric.target / metric.value;
};

const metricInsight = (metric: Devmetric): Insight[] => {
  const ratio = getRatio(metric);

  if (ratio > 1.25) {
    return [riskInsight(metric)];
  }

  if (ratio > 1) {
    return [watchInsight(metric)];
  }

  return [];
};

const getMetricId = (metric: Devmetric) => metric.id;

const healthyInsight = (metrics: Devmetric[]): Insight => ({
  title: "Flow looks healthy",
  detail: "All tracked metrics are within their current targets.",
  severity: "info",
  relatedMetricIds: metrics.map(getMetricId),
});

const makeRuleBasedInsightEngine = (): InsightEngine => {
  const summarizeMetrics = async (metrics: Devmetric[]) => {
    const insights = metrics.flatMap(metricInsight);

    if (insights.length > 0) {
      return insights;
    }

    return [healthyInsight(metrics)];
  };

  return {
    summarize: summarizeMetrics,
  };
};

export default makeRuleBasedInsightEngine;
