// @vitest-environment happy-dom

import { expect, test } from "vitest";
import renderSummary from "./renderSummary.ts";
import { makeTestMetric, makeTestReport } from "./testFixtures.ts";

test("counts risk, watch, good, and total metrics correctly", () => {
  const report = makeTestReport({
    metrics: [
      makeTestMetric({ status: "risk" }),
      makeTestMetric({ status: "risk" }),
      makeTestMetric({ status: "watch" }),
      makeTestMetric({ status: "good" }),
    ],
    insights: [],
  });

  const items = renderSummary(report).querySelectorAll(".summary-item");

  expect(items[0]?.querySelector("strong")?.textContent).toBe("2"); // Risk
  expect(items[1]?.querySelector("strong")?.textContent).toBe("1"); // Watch
  expect(items[2]?.querySelector("strong")?.textContent).toBe("1"); // Good
  expect(items[3]?.querySelector("strong")?.textContent).toBe("4"); // Total
});

test("shows zero for risk and watch when all metrics are good", () => {
  const report = makeTestReport({
    metrics: [makeTestMetric({ status: "good" }), makeTestMetric({ status: "good" })],
    insights: [],
  });

  const items = renderSummary(report).querySelectorAll(".summary-item");

  expect(items[0]?.querySelector("strong")?.textContent).toBe("0"); // Risk
  expect(items[1]?.querySelector("strong")?.textContent).toBe("0"); // Watch
  expect(items[2]?.querySelector("strong")?.textContent).toBe("2"); // Good
});

test("shows all zeros when there are no metrics", () => {
  const report = makeTestReport({ metrics: [], insights: [] });

  const items = renderSummary(report).querySelectorAll(".summary-item");

  expect(items[0]?.querySelector("strong")?.textContent).toBe("0");
  expect(items[1]?.querySelector("strong")?.textContent).toBe("0");
  expect(items[2]?.querySelector("strong")?.textContent).toBe("0");
  expect(items[3]?.querySelector("strong")?.textContent).toBe("0");
});
