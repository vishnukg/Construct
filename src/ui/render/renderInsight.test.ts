// @vitest-environment happy-dom

import { describe, expect, it } from "vitest";
import renderInsight from "./renderInsight.ts";
import { makeTestInsight } from "./testFixtures.ts";

describe("renderInsight", () => {
  describe("given an insight with 'info' severity", () => {
    it("when rendered, then the element has the insight-info modifier class", () => {
      // Arrange
      const insight = makeTestInsight({ severity: "info" });

      // Act
      const el = renderInsight(insight);

      // Assert
      expect(el.className).toContain("insight-info");
    });
  });

  describe("given an insight with 'warning' severity", () => {
    it("when rendered, then the element has the insight-warning modifier class", () => {
      // Arrange
      const insight = makeTestInsight({ severity: "warning" });

      // Act
      const el = renderInsight(insight);

      // Assert
      expect(el.className).toContain("insight-warning");
    });
  });

  describe("given an insight with 'critical' severity", () => {
    it("when rendered, then the element has the insight-critical modifier class", () => {
      // Arrange
      const insight = makeTestInsight({ severity: "critical" });

      // Act
      const el = renderInsight(insight);

      // Assert
      expect(el.className).toContain("insight-critical");
    });
  });

  describe("given an insight with a title and detail", () => {
    it("when rendered, then both the title and detail text are present in the element", () => {
      // Arrange
      const insight = makeTestInsight({
        title: "High cycle time",
        detail: "Exceeds target by 3 days.",
      });

      // Act
      const el = renderInsight(insight);

      // Assert
      expect(el.textContent).toContain("High cycle time");
      expect(el.textContent).toContain("Exceeds target by 3 days.");
    });
  });

  describe("given an insight with 'warning' severity", () => {
    it("when rendered, then the severity badge displays 'Warning'", () => {
      // Arrange
      const insight = makeTestInsight({ severity: "warning" });

      // Act
      const el = renderInsight(insight);

      // Assert
      expect(el.querySelector(".insight-severity")?.textContent).toBe("Warning");
    });
  });

  describe("given an insight with 'critical' severity", () => {
    it("when rendered, then the severity badge displays 'Critical'", () => {
      // Arrange
      const insight = makeTestInsight({ severity: "critical" });

      // Act
      const el = renderInsight(insight);

      // Assert
      expect(el.querySelector(".insight-severity")?.textContent).toBe("Critical");
    });
  });
});
