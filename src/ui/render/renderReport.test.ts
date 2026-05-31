// @vitest-environment happy-dom

import { expect, test, vi } from "vitest";
import renderReport from "./renderReport.ts";
import { makeTestInsight, makeTestMetric, makeTestReport } from "./testFixtures.ts";

test("renderReport: given two metrics, creates one card per metric", () => {
  const root = document.createElement("div");

  renderReport(root, makeTestReport({ metrics: [makeTestMetric(), makeTestMetric()], insights: [] }), () => {});

  expect(root.querySelectorAll(".metric")).toHaveLength(2);
});

test("renderReport: given two insights, creates one entry per insight", () => {
  const root = document.createElement("div");

  renderReport(root, makeTestReport({ metrics: [], insights: [makeTestInsight(), makeTestInsight()] }), () => {});

  expect(root.querySelectorAll(".insight")).toHaveLength(2);
});

test("renderReport: given existing root content, replaces it on render", () => {
  const root = document.createElement("div");
  root.innerHTML = "<p class='stale'>old content</p>";

  renderReport(root, makeTestReport({ metrics: [makeTestMetric()], insights: [] }), () => {});

  expect(root.querySelector(".stale")).toBeNull();
});

test("renderReport: given a refresh callback, calls it when the refresh button is clicked", () => {
  const root = document.createElement("div");
  const onRefresh = vi.fn();

  renderReport(root, makeTestReport(), onRefresh);
  root.querySelector<HTMLButtonElement>(".refresh-button")?.click();

  expect(onRefresh).toHaveBeenCalledOnce();
});

test("renderReport: given any report, displays the Construct title", () => {
  const root = document.createElement("div");

  renderReport(root, makeTestReport(), () => {});

  expect(root.textContent).toContain("Construct");
});
