import type {
  DevmetricsReport,
  Insight,
  InsightSeverity,
  MetricStatus,
  MetricSummary,
} from "../app/core/index.ts";

const statusLabel: Record<MetricStatus, string> = {
  good: "Good",
  watch: "Watch",
  risk: "Risk",
};

const severityLabel: Record<InsightSeverity, string> = {
  info: "Info",
  warning: "Warning",
  critical: "Critical",
};

const trendLabel = {
  up: "Rising",
  down: "Falling",
  flat: "Stable",
};

const formatDate = (date: Date) =>
  new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);

const formatDelta = (metric: MetricSummary) => {
  const delta = Math.abs(metric.deltaFromTarget);

  if (delta === 0) {
    return `On target`;
  }

  const direction = metric.deltaFromTarget > 0 ? "over" : "under";
  return `${delta} ${metric.unit} ${direction}`;
};

const getProgressPercent = (metric: MetricSummary) => {
  if (metric.target === 0) {
    return metric.value === 0 ? 100 : 140;
  }

  const ratio = metric.lowerIsBetter
    ? metric.value / metric.target
    : metric.target / metric.value;

  return Math.min(Math.round(ratio * 100), 160);
};

const createElement = <K extends keyof HTMLElementTagNameMap>(
  tagName: K,
  className?: string,
  textContent?: string,
) => {
  const element = document.createElement(tagName);

  if (className) {
    element.className = className;
  }

  if (textContent) {
    element.textContent = textContent;
  }

  return element;
};

const appendChildren = (
  parent: HTMLElement,
  children: Array<HTMLElement | SVGElement>,
) => {
  for (const child of children) {
    parent.append(child);
  }
};

const renderMetric = (metric: MetricSummary) => {
  const item = createElement("article", `metric metric-${metric.status}`);
  const header = createElement("div", "metric-header");
  const title = createElement("h2", undefined, metric.label);
  const badge = createElement(
    "span",
    "status-badge",
    statusLabel[metric.status],
  );
  const value = createElement(
    "p",
    "metric-value",
    `${metric.value} ${metric.unit}`,
  );
  const meta = createElement(
    "p",
    "metric-meta",
    `Target ${metric.target} ${metric.unit} / ${trendLabel[metric.trend]} / ${formatDelta(metric)}`,
  );
  const track = createElement("div", "metric-track");
  const bar = createElement("div", "metric-bar");

  bar.style.width = `${getProgressPercent(metric)}%`;
  track.append(bar);
  appendChildren(header, [title, badge]);
  appendChildren(item, [header, value, meta, track]);

  return item;
};

const renderInsight = (insight: Insight) => {
  const item = createElement("article", `insight insight-${insight.severity}`);
  const severity = createElement(
    "span",
    "insight-severity",
    severityLabel[insight.severity],
  );
  const title = createElement("h3", undefined, insight.title);
  const detail = createElement("p", undefined, insight.detail);

  appendChildren(item, [severity, title, detail]);

  return item;
};

const renderSummary = (report: DevmetricsReport) => {
  const riskCount = report.metrics.filter(
    (metric) => metric.status === "risk",
  ).length;
  const watchCount = report.metrics.filter(
    (metric) => metric.status === "watch",
  ).length;
  const goodCount = report.metrics.filter(
    (metric) => metric.status === "good",
  ).length;

  const summary = createElement("section", "summary-strip");
  const items = [
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
