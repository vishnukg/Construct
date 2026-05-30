import React from "react";
import { Box, Text } from "ink";
import type { DeveloperMetricsReport, InsightSeverity, MetricStatus } from "../../core/index.ts";

type AppProps = {
    report: DeveloperMetricsReport;
};

const statusColor: Record<MetricStatus, string> = {
    good: "green",
    watch: "yellow",
    risk: "red",
};

const severityColor: Record<InsightSeverity, string> = {
    info: "cyan",
    warning: "yellow",
    critical: "red",
};

const trendSymbol = {
    up: "^",
    down: "v",
    flat: "-",
};

const App = ({ report }: AppProps) => (
    <Box flexDirection="column" padding={1}>
        <Text bold color="cyan">
            Construct
        </Text>
        <Text color="gray">Generated {report.generatedAt.toLocaleString()}</Text>

        <Box flexDirection="column" marginTop={1}>
            {report.metrics.map((metric) => (
                <Box key={metric.id}>
                    <Box width={24}>
                        <Text>{metric.label}</Text>
                    </Box>
                    <Box width={14}>
                        <Text color={statusColor[metric.status]}>
                            {metric.value} {metric.unit}
                        </Text>
                    </Box>
                    <Box width={14}>
                        <Text color="gray">target {metric.target}</Text>
                    </Box>
                    <Text color={statusColor[metric.status]}>
                        {metric.status.toUpperCase()} {trendSymbol[metric.trend]}
                    </Text>
                </Box>
            ))}
        </Box>

        <Box flexDirection="column" marginTop={1}>
            <Text bold>AI-ish insights</Text>
            {report.insights.map((insight) => (
                <Box key={`${insight.title}-${insight.relatedMetricIds.join("-")}`} flexDirection="column">
                    <Text color={severityColor[insight.severity]}>{insight.title}</Text>
                    <Text color="gray">{insight.detail}</Text>
                </Box>
            ))}
        </Box>
    </Box>
);

export default App;
