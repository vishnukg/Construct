export type MetricTrend = "up" | "down" | "flat";
export type MetricStatus = "good" | "watch" | "risk";

export type DeveloperMetric = {
    id: string;
    label: string;
    value: number;
    unit: string;
    target: number;
    trend: MetricTrend;
    lowerIsBetter: boolean;
};

export type MetricSummary = DeveloperMetric & {
    status: MetricStatus;
    deltaFromTarget: number;
};

export type InsightSeverity = "info" | "warning" | "critical";

export type Insight = {
    title: string;
    detail: string;
    severity: InsightSeverity;
    relatedMetricIds: string[];
};

export type DeveloperMetricsReport = {
    generatedAt: Date;
    metrics: MetricSummary[];
    insights: Insight[];
};

export type GetDeveloperMetricsReportFn = () => Promise<DeveloperMetricsReport>;
