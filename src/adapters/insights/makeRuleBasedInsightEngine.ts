import type { DeveloperMetric, Insight, InsightEngine } from "../../core/index.ts";

const makeRiskInsight = (metric: DeveloperMetric): Insight => ({
    title: `${metric.label} needs attention`,
    detail: `${metric.value} ${metric.unit} is above the target of ${metric.target} ${metric.unit}.`,
    severity: "critical",
    relatedMetricIds: [metric.id],
});

const makeWatchInsight = (metric: DeveloperMetric): Insight => ({
    title: `${metric.label} is drifting`,
    detail: `Current value is ${metric.value} ${metric.unit}; keep it near ${metric.target} ${metric.unit}.`,
    severity: "warning",
    relatedMetricIds: [metric.id],
});

const getRatio = (metric: DeveloperMetric) =>
    metric.lowerIsBetter ? metric.value / metric.target : metric.target / metric.value;

const makeRuleBasedInsightEngine = (): InsightEngine => ({
    summarize: async (metrics) => {
        const insights = metrics.flatMap((metric) => {
            const ratio = getRatio(metric);

            if (ratio > 1.25) {
                return [makeRiskInsight(metric)];
            }

            if (ratio > 1) {
                return [makeWatchInsight(metric)];
            }

            return [];
        });

        if (insights.length > 0) {
            return insights;
        }

        return [
            {
                title: "Flow looks healthy",
                detail: "All tracked metrics are within their current targets.",
                severity: "info",
                relatedMetricIds: metrics.map((metric) => metric.id),
            },
        ];
    },
});

export default makeRuleBasedInsightEngine;
