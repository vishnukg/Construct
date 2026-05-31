// @vitest-environment happy-dom

import { expect, test } from "vitest";
import renderInsight from "./renderInsight.ts";
import { makeTestInsight } from "./testFixtures.ts";

test("applies insight-info class for info severity", () => {
  expect(renderInsight(makeTestInsight({ severity: "info" })).className).toContain("insight-info");
});

test("applies insight-warning class for warning severity", () => {
  expect(renderInsight(makeTestInsight({ severity: "warning" })).className).toContain("insight-warning");
});

test("applies insight-critical class for critical severity", () => {
  expect(renderInsight(makeTestInsight({ severity: "critical" })).className).toContain("insight-critical");
});

test("displays the title and detail text", () => {
  const el = renderInsight(makeTestInsight({
    title: "High cycle time",
    detail: "Exceeds target by 3 days.",
  }));

  expect(el.textContent).toContain("High cycle time");
  expect(el.textContent).toContain("Exceeds target by 3 days.");
});

test("displays 'Warning' in the severity badge", () => {
  expect(renderInsight(makeTestInsight({ severity: "warning" })).querySelector(".insight-severity")?.textContent).toBe("Warning");
});

test("displays 'Critical' in the severity badge", () => {
  expect(renderInsight(makeTestInsight({ severity: "critical" })).querySelector(".insight-severity")?.textContent).toBe("Critical");
});
