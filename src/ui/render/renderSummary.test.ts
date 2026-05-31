// @vitest-environment happy-dom

import { expect, test } from "vitest";
import renderSummary from "./renderSummary.ts";
import { makeTestMetric, makeTestReport } from "./testFixtures.ts";

test("renderSummary: given metrics of mixed statuses, counts risk, watch, good, and total correctly", () => {
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

test("renderSummary: given all good metrics, shows zero for risk and watch", () => {
  const report = makeTestReport({
    metrics: [makeTestMetric({ status: "good" }), makeTestMetric({ status: "good" })],
    insights: [],
  });

  const items = renderSummary(report).querySelectorAll(".summary-item");

  expect(items[0]?.querySelector("strong")?.textContent).toBe("0"); // Risk
  expect(items[1]?.querySelector("strong")?.textContent).toBe("0"); // Watch
  expect(items[2]?.querySelector("strong")?.textContent).toBe("2"); // Good
});

test("renderSummary: given no metrics, shows all zeros", () => {
  const report = makeTestReport({ metrics: [], insights: [] });

  const items = renderSummary(report).querySelectorAll(".summary-item");

  expect(items[0]?.querySelector("strong")?.textContent).toBe("0");
  expect(items[1]?.querySelector("strong")?.textContent).toBe("0");
  expect(items[2]?.querySelector("strong")?.textContent).toBe("0");
  expect(items[3]?.querySelector("strong")?.textContent).toBe("0");
});
