import type { DevmetricsReport } from "../../app/core/index.ts";
import { createElement } from "./dom.ts";

const renderSummary = (report: DevmetricsReport): HTMLElement => {
  const riskCount = report.metrics.filter((m) => m.status === "risk").length;
  const watchCount = report.metrics.filter((m) => m.status === "watch").length;
  const goodCount = report.metrics.filter((m) => m.status === "good").length;

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
