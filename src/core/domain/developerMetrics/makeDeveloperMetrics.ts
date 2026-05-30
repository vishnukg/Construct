import type {
    DeveloperMetric,
    DeveloperMetricsReport,
    GetDeveloperMetricsReportFn,
    MetricStatus,
    MetricSummary,
} from "./types.ts";
import type { DeveloperMetricsSource, InsightEngine, Logger } from "../../ports/index.ts";

type MakeDeveloperMetricsCfg = {
    source: DeveloperMetricsSource;
    insightEngine: InsightEngine;
    logger: Logger;
    now?: () => Date;
};

const getMetricRatio = ({ value, target, lowerIsBetter }: DeveloperMetric) => {
    if (target === 0) {
        return value === 0 ? 1 : 2;
    }

    return lowerIsBetter ? value / target : target / value;
};

const getStatus = (metric: DeveloperMetric): MetricStatus => {
    const ratio = getMetricRatio(metric);

    if (ratio <= 1) {
        return "good";
    }

    if (ratio <= 1.25) {
        return "watch";
    }

    return "risk";
};

const summarizeMetric = (metric: DeveloperMetric): MetricSummary => ({
    ...metric,
    status: getStatus(metric),
    deltaFromTarget: metric.value - metric.target,
});

const makeDeveloperMetrics = ({
    source,
    insightEngine,
    logger,
    now = () => new Date(),
}: MakeDeveloperMetricsCfg): GetDeveloperMetricsReportFn => {
    return async (): Promise<DeveloperMetricsReport> => {
        logger.info("developer_metrics.report.started");

        const rawMetrics = await source.listMetrics();
        const metrics = rawMetrics.map(summarizeMetric);
        const insights = await insightEngine.summarize(rawMetrics);

        logger.info("developer_metrics.report.completed", {
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

export default makeDeveloperMetrics;
