// @vitest-environment happy-dom

import { describe, expect, it } from "vitest";
import renderMetric, { formatDelta, getProgressPercent } from "./renderMetric.ts";
import { makeTestMetric } from "./testFixtures.ts";

describe("formatDelta", () => {
  it("returns 'On target' when delta is zero", () => {
    expect(formatDelta(makeTestMetric({ deltaFromTarget: 0 }))).toBe("On target");
  });

  it("returns absolute delta with direction 'over' when positive", () => {
    expect(formatDelta(makeTestMetric({ deltaFromTarget: 3, unit: "days" }))).toBe("3 days over");
  });

  it("returns absolute delta with direction 'under' when negative", () => {
    expect(formatDelta(makeTestMetric({ deltaFromTarget: -2, unit: "days" }))).toBe("2 days under");
  });
});

describe("getProgressPercent", () => {
  it("returns 100 when target and value are both zero", () => {
    expect(getProgressPercent(makeTestMetric({ target: 0, value: 0, lowerIsBetter: true }))).toBe(100);
  });

  it("returns 140 when target is zero but value is non-zero", () => {
    expect(getProgressPercent(makeTestMetric({ target: 0, value: 5, lowerIsBetter: true }))).toBe(140);
  });

  it("returns 100 when a lower-is-better metric is exactly on target", () => {
    expect(getProgressPercent(makeTestMetric({ value: 10, target: 10, lowerIsBetter: true }))).toBe(100);
  });

  it("returns a percentage proportional to value over target for lower-is-better", () => {
    expect(getProgressPercent(makeTestMetric({ value: 5, target: 10, lowerIsBetter: true }))).toBe(50);
  });

  it("returns 100 when a higher-is-better metric is exactly on target", () => {
    expect(getProgressPercent(makeTestMetric({ value: 10, target: 10, lowerIsBetter: false }))).toBe(100);
  });

  it("caps at 160 when the ratio would exceed it", () => {
    expect(getProgressPercent(makeTestMetric({ value: 20, target: 10, lowerIsBetter: true }))).toBe(160);
  });
});

describe("renderMetric", () => {
  it("applies metric-good class for good status", () => {
    expect(renderMetric(makeTestMetric({ status: "good" })).className).toContain("metric-good");
  });

  it("applies metric-watch class for watch status", () => {
    expect(renderMetric(makeTestMetric({ status: "watch" })).className).toContain("metric-watch");
  });

  it("applies metric-risk class for risk status", () => {
    expect(renderMetric(makeTestMetric({ status: "risk" })).className).toContain("metric-risk");
  });

  it("displays the metric label and formatted value", () => {
    const el = renderMetric(makeTestMetric({ label: "PR Cycle Time", value: 5, unit: "days" }));

    expect(el.textContent).toContain("PR Cycle Time");
    expect(el.textContent).toContain("5 days");
  });

  it("displays the correct status badge text", () => {
    expect(renderMetric(makeTestMetric({ status: "risk" })).querySelector(".status-badge")?.textContent).toBe("Risk");
  });

  it("contains a progress track and bar", () => {
    const el = renderMetric(makeTestMetric());

    expect(el.querySelector(".metric-track")).not.toBeNull();
    expect(el.querySelector(".metric-bar")).not.toBeNull();
  });
});
