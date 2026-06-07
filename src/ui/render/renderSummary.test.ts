// @vitest-environment happy-dom

import { expect, test } from "vitest";
import renderSummary from "./renderSummary.ts";
import { testMetric, testReport } from "./testFixtures.ts";

test("renderSummary: given metrics of mixed statuses, counts risk, watch, good, and total correctly", () => {
  const report = testReport({
    metrics: [
      testMetric({ status: "risk" }),
      testMetric({ status: "risk" }),
      testMetric({ status: "watch" }),
      testMetric({ status: "good" }),
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
  const report = testReport({
    metrics: [testMetric({ status: "good" }), testMetric({ status: "good" })],
    insights: [],
  });

  const items = renderSummary(report).querySelectorAll(".summary-item");

  expect(items[0]?.querySelector("strong")?.textContent).toBe("0"); // Risk
  expect(items[1]?.querySelector("strong")?.textContent).toBe("0"); // Watch
  expect(items[2]?.querySelector("strong")?.textContent).toBe("2"); // Good
});

test("renderSummary: given no metrics, shows all zeros", () => {
  const report = testReport({ metrics: [], insights: [] });

  const items = renderSummary(report).querySelectorAll(".summary-item");

  expect(items[0]?.querySelector("strong")?.textContent).toBe("0");
  expect(items[1]?.querySelector("strong")?.textContent).toBe("0");
  expect(items[2]?.querySelector("strong")?.textContent).toBe("0");
  expect(items[3]?.querySelector("strong")?.textContent).toBe("0");
});
