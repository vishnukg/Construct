// @vitest-environment happy-dom

import { expect, test, vi } from "vitest";
import renderReport from "./renderReport.ts";
import { makeTestInsight, makeTestMetric, makeTestReport } from "./testFixtures.ts";

test("creates one metric card per metric", () => {
  const root = document.createElement("div");

  renderReport(root, makeTestReport({ metrics: [makeTestMetric(), makeTestMetric()], insights: [] }), () => {});

  expect(root.querySelectorAll(".metric")).toHaveLength(2);
});

test("creates one insight entry per insight", () => {
  const root = document.createElement("div");

  renderReport(root, makeTestReport({ metrics: [], insights: [makeTestInsight(), makeTestInsight()] }), () => {});

  expect(root.querySelectorAll(".insight")).toHaveLength(2);
});

test("replaces existing root content on render", () => {
  const root = document.createElement("div");
  root.innerHTML = "<p class='stale'>old content</p>";

  renderReport(root, makeTestReport({ metrics: [makeTestMetric()], insights: [] }), () => {});

  expect(root.querySelector(".stale")).toBeNull();
});

test("calls the refresh callback when the refresh button is clicked", () => {
  const root = document.createElement("div");
  const onRefresh = vi.fn();

  renderReport(root, makeTestReport(), onRefresh);
  root.querySelector<HTMLButtonElement>(".refresh-button")?.click();

  expect(onRefresh).toHaveBeenCalledOnce();
});

test("displays the Construct title", () => {
  const root = document.createElement("div");

  renderReport(root, makeTestReport(), () => {});

  expect(root.textContent).toContain("Construct");
});
