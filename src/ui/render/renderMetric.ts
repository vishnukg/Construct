import type { MetricStatus, MetricSummary } from "../../app/core/index.ts";
import { appendChildren, createElement } from "./dom.ts";

const statusLabel: Record<MetricStatus, string> = {
  good: "Good",
  watch: "Watch",
  risk: "Risk",
};

const trendLabel = {
  up: "Rising",
  down: "Falling",
  flat: "Stable",
};

export const formatDelta = (metric: MetricSummary): string => {
  const delta = Math.abs(metric.deltaFromTarget);

  if (delta === 0) {
    return "On target";
  }

  const direction = metric.deltaFromTarget > 0 ? "over" : "under";
  return `${+delta.toFixed(2)} ${metric.unit} ${direction}`;
};

export const getProgressPercent = (metric: MetricSummary): number => {
  if (metric.target === 0) {
    return metric.value === 0 ? 100 : 140;
  }

  const ratio = metric.lowerIsBetter
    ? metric.value / metric.target
    : metric.target / metric.value;

  return Math.min(Math.round(ratio * 100), 160);
};

const renderMetric = (metric: MetricSummary): HTMLElement => {
  const item = createElement("article", `metric metric-${metric.status}`);
  const header = createElement("div", "metric-header");
  const title = createElement("h2", undefined, metric.label);
  const badge = createElement("span", "status-badge", statusLabel[metric.status]);
  const value = createElement("p", "metric-value", `${metric.value} ${metric.unit}`);
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

export default renderMetric;
