// @vitest-environment happy-dom

import { expect, test, vi } from "vitest";
import makeRenderApp from "./renderApp.ts";
import { makeTestReport } from "./testFixtures.ts";

test("sets data-state to loading before getReport resolves", async () => {
  const root = document.createElement("div");
  const renderApp = makeRenderApp(root, vi.fn(async () => makeTestReport()));

  const promise = renderApp();

  expect(root.dataset.state).toBe("loading");
  await promise;
});

test("sets data-state to ready after getReport resolves", async () => {
  const root = document.createElement("div");
  const renderApp = makeRenderApp(root, vi.fn(async () => makeTestReport()));

  await renderApp();

  expect(root.dataset.state).toBe("ready");
});

test("renders the report into the root element", async () => {
  const root = document.createElement("div");
  const renderApp = makeRenderApp(root, vi.fn(async () => makeTestReport({
    metrics: [{ id: "m1", label: "Test", value: 5, unit: "days", target: 3, trend: "up", lowerIsBetter: true, status: "risk", deltaFromTarget: 2 }],
    insights: [],
  })));

  await renderApp();

  expect(root.querySelector(".metric")).not.toBeNull();
});

test("sets data-state to error when getReport rejects with an Error", async () => {
  const root = document.createElement("div");
  const renderApp = makeRenderApp(root, vi.fn(async () => { throw new Error("Network failed"); }));

  await renderApp();

  expect(root.dataset.state).toBe("error");
});

test("displays the error message when getReport rejects with an Error", async () => {
  const root = document.createElement("div");
  const renderApp = makeRenderApp(root, vi.fn(async () => { throw new Error("Network failed"); }));

  await renderApp();

  expect(root.textContent).toBe("Network failed");
});

test("shows the fallback message when getReport rejects with a non-Error value", async () => {
  const root = document.createElement("div");
  const renderApp = makeRenderApp(root, vi.fn(async () => { throw "unexpected"; }));

  await renderApp();

  expect(root.dataset.state).toBe("error");
  expect(root.textContent).toBe("Failed to load metrics");
});

test("calls getReport again on a second invocation", async () => {
  const root = document.createElement("div");
  const getReport = vi.fn(async () => makeTestReport());
  const renderApp = makeRenderApp(root, getReport);

  await renderApp();
  await renderApp();

  expect(getReport).toHaveBeenCalledTimes(2);
});
