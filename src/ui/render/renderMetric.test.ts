// @vitest-environment happy-dom

import { describe, expect, it } from "vitest";
import renderMetric, { formatDelta, getProgressPercent } from "./renderMetric.ts";
import { testMetric } from "./testFixtures.ts";

describe("formatDelta", () => {
  it("given delta is zero, returns 'On target'", () => {
    expect(formatDelta(testMetric({ deltaFromTarget: 0 }))).toBe("On target");
  });

  it("given a positive delta, returns the absolute value with direction 'over'", () => {
    expect(formatDelta(testMetric({ deltaFromTarget: 3, unit: "days" }))).toBe("3 days over");
  });

  it("given a negative delta, returns the absolute value with direction 'under'", () => {
    expect(formatDelta(testMetric({ deltaFromTarget: -2, unit: "days" }))).toBe("2 days under");
  });
});

describe("getProgressPercent", () => {
  it("given target and value are both zero, returns 100", () => {
    expect(getProgressPercent(testMetric({ target: 0, value: 0, lowerIsBetter: true }))).toBe(100);
  });

  it("given target is zero but value is non-zero, returns 140", () => {
    expect(getProgressPercent(testMetric({ target: 0, value: 5, lowerIsBetter: true }))).toBe(140);
  });

  it("given a lower-is-better metric exactly on target, returns 100", () => {
    expect(getProgressPercent(testMetric({ value: 10, target: 10, lowerIsBetter: true }))).toBe(100);
  });

  it("given a lower-is-better metric under its target, returns a proportional percentage", () => {
    expect(getProgressPercent(testMetric({ value: 5, target: 10, lowerIsBetter: true }))).toBe(50);
  });

  it("given a higher-is-better metric exactly on target, returns 100", () => {
    expect(getProgressPercent(testMetric({ value: 10, target: 10, lowerIsBetter: false }))).toBe(100);
  });

  it("given a ratio that exceeds the cap, returns 160", () => {
    expect(getProgressPercent(testMetric({ value: 20, target: 10, lowerIsBetter: true }))).toBe(160);
  });
});

describe("renderMetric", () => {
  it("given good status, applies the metric-good modifier class", () => {
    expect(renderMetric(testMetric({ status: "good" })).className).toContain("metric-good");
  });

  it("given watch status, applies the metric-watch modifier class", () => {
    expect(renderMetric(testMetric({ status: "watch" })).className).toContain("metric-watch");
  });

  it("given risk status, applies the metric-risk modifier class", () => {
    expect(renderMetric(testMetric({ status: "risk" })).className).toContain("metric-risk");
  });

  it("given a label, value, and unit, displays them in the element", () => {
    const el = renderMetric(testMetric({ label: "PR Cycle Time", value: 5, unit: "days" }));

    expect(el.textContent).toContain("PR Cycle Time");
    expect(el.textContent).toContain("5 days");
  });

  it("given risk status, displays 'Risk' in the status badge", () => {
    expect(renderMetric(testMetric({ status: "risk" })).querySelector(".status-badge")?.textContent).toBe("Risk");
  });

  it("given any metric, contains a progress track and bar", () => {
    const el = renderMetric(testMetric());

    expect(el.querySelector(".metric-track")).not.toBeNull();
    expect(el.querySelector(".metric-bar")).not.toBeNull();
  });
});
