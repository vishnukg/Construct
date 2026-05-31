// @vitest-environment happy-dom

import { describe, expect, it, vi } from "vitest";
import makeRenderApp from "./renderApp.ts";
import { makeTestReport } from "./testFixtures.ts";

describe("makeRenderApp", () => {
  describe("given a getReport function that resolves successfully", () => {
    it("when called, then data-state transitions from loading to ready", async () => {
      // Arrange
      const root = document.createElement("div");
      const getReport = vi.fn(async () => makeTestReport());
      const renderApp = makeRenderApp(root, getReport);

      // Act
      const promise = renderApp();

      // Assert — loading is set synchronously before the first await
      expect(root.dataset.state).toBe("loading");
      await promise;
      expect(root.dataset.state).toBe("ready");
    });

    it("when called, then the report is rendered into the root", async () => {
      // Arrange
      const root = document.createElement("div");
      const getReport = vi.fn(async () => makeTestReport({ metrics: [
        { id: "m1", label: "Test", value: 5, unit: "days", target: 3, trend: "up", lowerIsBetter: true, status: "risk", deltaFromTarget: 2 },
      ], insights: [] }));
      const renderApp = makeRenderApp(root, getReport);

      // Act
      await renderApp();

      // Assert
      expect(root.querySelector(".metric")).not.toBeNull();
    });
  });

  describe("given a getReport function that rejects with an Error", () => {
    it("when called, then data-state is set to error", async () => {
      // Arrange
      const root = document.createElement("div");
      const getReport = vi.fn(async () => { throw new Error("Network failed"); });
      const renderApp = makeRenderApp(root, getReport);

      // Act
      await renderApp();

      // Assert
      expect(root.dataset.state).toBe("error");
    });

    it("when called, then the error message is displayed", async () => {
      // Arrange
      const root = document.createElement("div");
      const getReport = vi.fn(async () => { throw new Error("Network failed"); });
      const renderApp = makeRenderApp(root, getReport);

      // Act
      await renderApp();

      // Assert
      expect(root.textContent).toBe("Network failed");
    });
  });

  describe("given a getReport function that rejects with a non-Error value", () => {
    it("when called, then data-state is error and the fallback message is shown", async () => {
      // Arrange
      const root = document.createElement("div");
      const getReport = vi.fn(async () => { throw "unexpected string throw"; });
      const renderApp = makeRenderApp(root, getReport);

      // Act
      await renderApp();

      // Assert
      expect(root.dataset.state).toBe("error");
      expect(root.textContent).toBe("Failed to load metrics");
    });
  });

  describe("given a successful first render", () => {
    it("when renderApp is called again, then getReport is called a second time", async () => {
      // Arrange
      const root = document.createElement("div");
      const getReport = vi.fn(async () => makeTestReport());
      const renderApp = makeRenderApp(root, getReport);

      // Act
      await renderApp();
      await renderApp();

      // Assert
      expect(getReport).toHaveBeenCalledTimes(2);
    });
  });
});
