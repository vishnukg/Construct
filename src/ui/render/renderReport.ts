import type { DevmetricsReport } from "../../app/core/index.ts";
import { appendChildren, createElement } from "./dom.ts";
import renderInsight from "./renderInsight.ts";
import renderMetric from "./renderMetric.ts";
import renderSummary from "./renderSummary.ts";

const formatDate = (date: Date) =>
  new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);

const renderReport = (
  root: HTMLElement,
  report: DevmetricsReport,
  onRefresh: () => void,
) => {
  root.replaceChildren();

  const shell = createElement("main", "shell");
  const header = createElement("header", "topbar");
  const brand = createElement("div", "brand");
  const title = createElement("h1", undefined, "Construct");
  const timestamp = createElement(
    "p",
    undefined,
    `Generated ${formatDate(report.generatedAt)}`,
  );
  const refreshButton = createElement("button", "refresh-button", "Refresh");
  const content = createElement("section", "dashboard");
  const metrics = createElement("section", "metrics-grid");
  const insights = createElement("aside", "insights-panel");
  const insightsTitle = createElement("h2", undefined, "Insights");

  refreshButton.type = "button";
  refreshButton.addEventListener("click", onRefresh);

  for (const metric of report.metrics) {
    metrics.append(renderMetric(metric));
  }

  insights.append(insightsTitle);

  for (const insight of report.insights) {
    insights.append(renderInsight(insight));
  }

  appendChildren(brand, [title, timestamp]);
  appendChildren(header, [brand, refreshButton]);
  appendChildren(content, [metrics, insights]);
  appendChildren(shell, [header, renderSummary(report), content]);

  root.append(shell);
};

export default renderReport;
