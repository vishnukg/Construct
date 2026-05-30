import type {
  Devmetric,
  DevmetricsReport,
  GetDevmetricsReportFn,
  MetricStatus,
  MetricSummary,
} from "./types.ts";
import type {
  DevmetricsSource,
  InsightEngine,
  Logger,
} from "../../ports/index.ts";

type MakeDevmetricsCfg = {
  source: DevmetricsSource;
  insightEngine: InsightEngine;
  logger: Logger;
  now?: () => Date;
};

const getMetricRatio = ({ value, target, lowerIsBetter }: Devmetric) => {
  if (target === 0) {
    return value === 0 ? 1 : 2;
  }

  return lowerIsBetter ? value / target : target / value;
};

const getStatus = (metric: Devmetric): MetricStatus => {
  const ratio = getMetricRatio(metric);

  if (ratio <= 1) {
    return "good";
  }

  if (ratio <= 1.25) {
    return "watch";
  }

  return "risk";
};

const summarizeMetric = (metric: Devmetric): MetricSummary => ({
  ...metric,
  status: getStatus(metric),
  deltaFromTarget: metric.value - metric.target,
});

const makeDevmetrics = ({
  source,
  insightEngine,
  logger,
  now = () => new Date(),
}: MakeDevmetricsCfg): GetDevmetricsReportFn => {
  return async (): Promise<DevmetricsReport> => {
    logger.info("devmetrics.report.started");

    const rawMetrics = await source.listMetrics();
    const metrics = rawMetrics.map(summarizeMetric);
    const insights = await insightEngine.summarize(rawMetrics);

    logger.info("devmetrics.report.completed", {
      metricCount: metrics.length,
      insightCount: insights.length,
    });

    return {
      generatedAt: now(),
      metrics,
      insights,
    };
  };
};

export default makeDevmetrics;
