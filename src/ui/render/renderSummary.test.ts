// @vitest-environment happy-dom

import { describe, expect, it } from "vitest";
import renderSummary from "./renderSummary.ts";
import { makeTestMetric, makeTestReport } from "./testFixtures.ts";

describe("renderSummary", () => {
  describe("given a report with metrics of mixed statuses", () => {
    it("when rendered, then each status count and the total are correct", () => {
      // Arrange
      const report = makeTestReport({
        metrics: [
          makeTestMetric({ status: "risk" }),
          makeTestMetric({ status: "risk" }),
          makeTestMetric({ status: "watch" }),
          makeTestMetric({ status: "good" }),
        ],
        insights: [],
      });

      // Act
      const el = renderSummary(report);
      const items = el.querySelectorAll(".summary-item");

      // Assert
      expect(items[0]?.querySelector("strong")?.textContent).toBe("2"); // Risk
      expect(items[1]?.querySelector("strong")?.textContent).toBe("1"); // Watch
      expect(items[2]?.querySelector("strong")?.textContent).toBe("1"); // Good
      expect(items[3]?.querySelector("strong")?.textContent).toBe("4"); // Total
    });
  });

  describe("given a report with only good metrics", () => {
    it("when rendered, then risk and watch counts are zero and good count matches", () => {
      // Arrange
      const report = makeTestReport({
        metrics: [
          makeTestMetric({ status: "good" }),
          makeTestMetric({ status: "good" }),
        ],
        insights: [],
      });

      // Act
      const el = renderSummary(report);
      const items = el.querySelectorAll(".summary-item");

      // Assert
      expect(items[0]?.querySelector("strong")?.textContent).toBe("0"); // Risk
      expect(items[1]?.querySelector("strong")?.textContent).toBe("0"); // Watch
      expect(items[2]?.querySelector("strong")?.textContent).toBe("2"); // Good
    });
  });

  describe("given a report with no metrics", () => {
    it("when rendered, then all counts are zero", () => {
      // Arrange
      const report = makeTestReport({ metrics: [], insights: [] });

      // Act
      const el = renderSummary(report);
      const items = el.querySelectorAll(".summary-item");

      // Assert
      expect(items[0]?.querySelector("strong")?.textContent).toBe("0"); // Risk
      expect(items[1]?.querySelector("strong")?.textContent).toBe("0"); // Watch
      expect(items[2]?.querySelector("strong")?.textContent).toBe("0"); // Good
      expect(items[3]?.querySelector("strong")?.textContent).toBe("0"); // Total
    });
  });
});
