import type { DevmetricsReport } from "../../app/core/index.ts";
import { createElement } from "./dom.ts";

const renderSummary = (report: DevmetricsReport): HTMLElement => {
  const metricsByStatus = Object.groupBy(report.metrics, (metric) => metric.status);
  const riskCount = metricsByStatus.risk?.length ?? 0;
  const watchCount = metricsByStatus.watch?.length ?? 0;
  const goodCount = metricsByStatus.good?.length ?? 0;

  const summary = createElement("section", "summary-strip");
  const items: [string, string][] = [
    ["Risk", riskCount.toString()],
    ["Watch", watchCount.toString()],
    ["Good", goodCount.toString()],
    ["Metrics", report.metrics.length.toString()],
  ];

  for (const [label, value] of items) {
    const item = createElement("div", "summary-item");
    item.append(createElement("span", undefined, label));
    item.append(createElement("strong", undefined, value));
    summary.append(item);
  }

  return summary;
};

export default renderSummary;
