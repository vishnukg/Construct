import type { Insight, InsightSeverity } from "../../app/core/index.ts";
import { appendChildren, createElement } from "./dom.ts";

const severityLabel: Record<InsightSeverity, string> = {
  info: "Info",
  warning: "Warning",
  critical: "Critical",
};

const renderInsight = (insight: Insight): HTMLElement => {
  const item = createElement("article", `insight insight-${insight.severity}`);
  const severity = createElement("span", "insight-severity", severityLabel[insight.severity]);
  const title = createElement("h3", undefined, insight.title);
  const detail = createElement("p", undefined, insight.detail);

  appendChildren(item, [severity, title, detail]);

  return item;
};

export default renderInsight;
