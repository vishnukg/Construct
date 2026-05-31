// @vitest-environment happy-dom

import { describe, expect, it } from "vitest";
import renderMetric, { formatDelta, getProgressPercent } from "./renderMetric.ts";
import { makeTestMetric } from "./testFixtures.ts";

describe("formatDelta", () => {
  describe("given a metric that is exactly on target", () => {
    it("when called, then it returns 'On target'", () => {
      // Arrange
      const metric = makeTestMetric({ deltaFromTarget: 0 });

      // Act
      const result = formatDelta(metric);

      // Assert
      expect(result).toBe("On target");
    });
  });

  describe("given a metric that is over its target", () => {
    it("when called, then it reports the absolute delta and direction 'over'", () => {
      // Arrange
      const metric = makeTestMetric({ deltaFromTarget: 3, unit: "days" });

      // Act
      const result = formatDelta(metric);

      // Assert
      expect(result).toBe("3 days over");
    });
  });

  describe("given a metric that is under its target", () => {
    it("when called, then it reports the absolute delta and direction 'under'", () => {
      // Arrange
      const metric = makeTestMetric({ deltaFromTarget: -2, unit: "days" });

      // Act
      const result = formatDelta(metric);

      // Assert
      expect(result).toBe("2 days under");
    });
  });
});

describe("getProgressPercent", () => {
  describe("given a zero target with a zero value", () => {
    it("when called, then it returns 100", () => {
      // Arrange
      const metric = makeTestMetric({ target: 0, value: 0, lowerIsBetter: true });

      // Act
      const result = getProgressPercent(metric);

      // Assert
      expect(result).toBe(100);
    });
  });

  describe("given a zero target with a non-zero value", () => {
    it("when called, then it returns 140", () => {
      // Arrange
      const metric = makeTestMetric({ target: 0, value: 5, lowerIsBetter: true });

      // Act
      const result = getProgressPercent(metric);

      // Assert
      expect(result).toBe(140);
    });
  });

  describe("given a lower-is-better metric exactly on target", () => {
    it("when called, then it returns 100", () => {
      // Arrange
      const metric = makeTestMetric({ value: 10, target: 10, lowerIsBetter: true });

      // Act
      const result = getProgressPercent(metric);

      // Assert
      expect(result).toBe(100);
    });
  });

  describe("given a lower-is-better metric under its target", () => {
    it("when called, then it returns a percentage proportional to value over target", () => {
      // Arrange
      const metric = makeTestMetric({ value: 5, target: 10, lowerIsBetter: true });

      // Act
      const result = getProgressPercent(metric);

      // Assert
      expect(result).toBe(50);
    });
  });

  describe("given a higher-is-better metric exactly on target", () => {
    it("when called, then it returns 100", () => {
      // Arrange
      const metric = makeTestMetric({ value: 10, target: 10, lowerIsBetter: false });

      // Act
      const result = getProgressPercent(metric);

      // Assert
      expect(result).toBe(100);
    });
  });

  describe("given a metric so far from its target that the raw percentage exceeds 160", () => {
    it("when called, then the result is capped at 160", () => {
      // Arrange — value is double target: ratio = 2.0 → 200%, capped at 160
      const metric = makeTestMetric({ value: 20, target: 10, lowerIsBetter: true });

      // Act
      const result = getProgressPercent(metric);

      // Assert
      expect(result).toBe(160);
    });
  });
});

describe("renderMetric", () => {
  describe("given a metric with 'good' status", () => {
    it("when rendered, then the element has the metric-good modifier class", () => {
      // Arrange
      const metric = makeTestMetric({ status: "good" });

      // Act
      const el = renderMetric(metric);

      // Assert
      expect(el.className).toContain("metric-good");
    });
  });

  describe("given a metric with 'watch' status", () => {
    it("when rendered, then the element has the metric-watch modifier class", () => {
      // Arrange
      const metric = makeTestMetric({ status: "watch" });

      // Act
      const el = renderMetric(metric);

      // Assert
      expect(el.className).toContain("metric-watch");
    });
  });

  describe("given a metric with 'risk' status", () => {
    it("when rendered, then the element has the metric-risk modifier class", () => {
      // Arrange
      const metric = makeTestMetric({ status: "risk" });

      // Act
      const el = renderMetric(metric);

      // Assert
      expect(el.className).toContain("metric-risk");
    });
  });

  describe("given a metric with a label, value, and unit", () => {
    it("when rendered, then the label and formatted value are visible in the element", () => {
      // Arrange
      const metric = makeTestMetric({ label: "PR Cycle Time", value: 5, unit: "days" });

      // Act
      const el = renderMetric(metric);

      // Assert
      expect(el.textContent).toContain("PR Cycle Time");
      expect(el.textContent).toContain("5 days");
    });
  });

  describe("given a metric with 'risk' status", () => {
    it("when rendered, then the status badge displays 'Risk'", () => {
      // Arrange
      const metric = makeTestMetric({ status: "risk" });

      // Act
      const el = renderMetric(metric);

      // Assert
      expect(el.querySelector(".status-badge")?.textContent).toBe("Risk");
    });
  });

  describe("given any metric", () => {
    it("when rendered, then it contains a progress track and bar", () => {
      // Arrange
      const metric = makeTestMetric();

      // Act
      const el = renderMetric(metric);

      // Assert
      expect(el.querySelector(".metric-track")).not.toBeNull();
      expect(el.querySelector(".metric-bar")).not.toBeNull();
    });
  });
});
