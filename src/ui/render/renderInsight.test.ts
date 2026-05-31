// @vitest-environment happy-dom

import { expect, test } from "vitest";
import renderInsight from "./renderInsight.ts";
import { makeTestInsight } from "./testFixtures.ts";

test("renderInsight: given info severity, applies the insight-info modifier class", () => {
  expect(renderInsight(makeTestInsight({ severity: "info" })).className).toContain("insight-info");
});

test("renderInsight: given warning severity, applies the insight-warning modifier class", () => {
  expect(renderInsight(makeTestInsight({ severity: "warning" })).className).toContain("insight-warning");
});

test("renderInsight: given critical severity, applies the insight-critical modifier class", () => {
  expect(renderInsight(makeTestInsight({ severity: "critical" })).className).toContain("insight-critical");
});

test("renderInsight: given a title and detail, displays both in the element", () => {
  const el = renderInsight(makeTestInsight({
    title: "High cycle time",
    detail: "Exceeds target by 3 days.",
  }));

  expect(el.textContent).toContain("High cycle time");
  expect(el.textContent).toContain("Exceeds target by 3 days.");
});

test("renderInsight: given warning severity, displays 'Warning' in the severity badge", () => {
  expect(renderInsight(makeTestInsight({ severity: "warning" })).querySelector(".insight-severity")?.textContent).toBe("Warning");
});

test("renderInsight: given critical severity, displays 'Critical' in the severity badge", () => {
  expect(renderInsight(makeTestInsight({ severity: "critical" })).querySelector(".insight-severity")?.textContent).toBe("Critical");
});
