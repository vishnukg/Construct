import type {
  DevmetricsReport,
  InsightSeverity,
  MetricStatus,
} from "../app/core/index.ts";

const statusLabel: Record<MetricStatus, string> = {
  good: "GOOD",
  watch: "WATCH",
  risk: "RISK",
} satisfies Record<MetricStatus, string>;

const severityPrefix: Record<InsightSeverity, string> = {
  info: "info",
  warning: "warning",
  critical: "critical",
} satisfies Record<InsightSeverity, string>;

const trendSymbol = {
  up: "^",
  down: "v",
  flat: "-",
};

const pad = (value: string, width: number) => value.padEnd(width, " ");

const formatReport = (report: DevmetricsReport) => {
  const metricLines = report.metrics.map((metric) => {
    const value = `${metric.value} ${metric.unit}`;
    const target = `target ${metric.target}`;
    const status = `${statusLabel[metric.status]} ${trendSymbol[metric.trend]}`;

    return ` ${pad(metric.label, 24)} ${pad(value, 13)} ${pad(target, 11)} ${status}`;
  });

  const insightLines = report.insights.flatMap((insight) => [
    ` ${severityPrefix[insight.severity]}: ${insight.title}`,
    `   ${insight.detail}`,
  ]);

  return [
    "",
    " Construct",
    ` Generated ${report.generatedAt.toLocaleString()}`,
    "",
    ...metricLines,
    "",
    " Insights",
    ...insightLines,
    "",
  ].join("\n");
};

export default formatReport;
