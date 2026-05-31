// @vitest-environment happy-dom

import { describe, expect, it, vi } from "vitest";
import renderReport from "./renderReport.ts";
import { makeTestInsight, makeTestMetric, makeTestReport } from "./testFixtures.ts";

describe("renderReport", () => {
  describe("given a report with two metrics", () => {
    it("when rendered, then one metric card is created per metric", () => {
      // Arrange
      const report = makeTestReport({
        metrics: [makeTestMetric(), makeTestMetric()],
        insights: [],
      });
      const root = document.createElement("div");

      // Act
      renderReport(root, report, () => {});

      // Assert
      expect(root.querySelectorAll(".metric")).toHaveLength(2);
    });
  });

  describe("given a report with two insights", () => {
    it("when rendered, then one insight entry is created per insight", () => {
      // Arrange
      const report = makeTestReport({
        metrics: [],
        insights: [makeTestInsight(), makeTestInsight()],
      });
      const root = document.createElement("div");

      // Act
      renderReport(root, report, () => {});

      // Assert
      expect(root.querySelectorAll(".insight")).toHaveLength(2);
    });
  });

  describe("given a root element that already contains content", () => {
    it("when rendered, then the previous content is replaced", () => {
      // Arrange
      const report = makeTestReport({ metrics: [makeTestMetric()], insights: [] });
      const root = document.createElement("div");
      root.innerHTML = "<p class='stale'>old content</p>";

      // Act
      renderReport(root, report, () => {});

      // Assert
      expect(root.querySelector(".stale")).toBeNull();
    });
  });

  describe("given an onRefresh callback", () => {
    it("when the refresh button is clicked, then the callback is called once", () => {
      // Arrange
      const report = makeTestReport();
      const root = document.createElement("div");
      const onRefresh = vi.fn();

      // Act
      renderReport(root, report, onRefresh);
      root.querySelector<HTMLButtonElement>(".refresh-button")?.click();

      // Assert
      expect(onRefresh).toHaveBeenCalledOnce();
    });
  });

  describe("given any report", () => {
    it("when rendered, then the page title 'Construct' is visible", () => {
      // Arrange
      const root = document.createElement("div");

      // Act
      renderReport(root, makeTestReport(), () => {});

      // Assert
      expect(root.textContent).toContain("Construct");
    });
  });
});
