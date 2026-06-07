// @vitest-environment happy-dom

import { expect, test, vi } from "vitest";
import makeRenderApp from "./renderApp.ts";
import { testReport } from "./testFixtures.ts";

test("makeRenderApp: given a resolving getReport, sets data-state to loading before it resolves", async () => {
  const root = document.createElement("div");
  const renderApp = makeRenderApp(
    root,
    vi.fn(async () => testReport()),
  );

  const promise = renderApp();

  expect(root.dataset.state).toBe("loading");
  await promise;
});

test("makeRenderApp: given a resolving getReport, sets data-state to ready after it resolves", async () => {
  const root = document.createElement("div");
  const renderApp = makeRenderApp(
    root,
    vi.fn(async () => testReport()),
  );

  await renderApp();

  expect(root.dataset.state).toBe("ready");
});

test("makeRenderApp: given a resolving getReport, renders the report into the root element", async () => {
  const root = document.createElement("div");
  const renderApp = makeRenderApp(
    root,
    vi.fn(async () =>
      testReport({
        metrics: [
          {
            id: "m1",
            label: "Test",
            value: 5,
            unit: "days",
            target: 3,
            trend: "up",
            lowerIsBetter: true,
            status: "risk",
            deltaFromTarget: 2,
          },
        ],
        insights: [],
      }),
    ),
  );

  await renderApp();

  expect(root.querySelector(".metric")).not.toBeNull();
});

test("makeRenderApp: given getReport rejects with an Error, sets data-state to error", async () => {
  const root = document.createElement("div");
  const renderApp = makeRenderApp(
    root,
    vi.fn(async () => {
      throw new Error("Network failed");
    }),
  );

  await renderApp();

  expect(root.dataset.state).toBe("error");
});

test("makeRenderApp: given getReport rejects with an Error, displays the error message", async () => {
  const root = document.createElement("div");
  const renderApp = makeRenderApp(
    root,
    vi.fn(async () => {
      throw new Error("Network failed");
    }),
  );

  await renderApp();

  expect(root.textContent).toBe("Network failed");
});

test("makeRenderApp: given getReport rejects with a non-Error value, shows the fallback message", async () => {
  const root = document.createElement("div");
  const renderApp = makeRenderApp(
    root,
    vi.fn(async () => {
      throw "unexpected";
    }),
  );

  await renderApp();

  expect(root.dataset.state).toBe("error");
  expect(root.textContent).toBe("Failed to load metrics");
});

test("makeRenderApp: given a second invocation, calls getReport again", async () => {
  const root = document.createElement("div");
  const getReport = vi.fn(async () => testReport());
  const renderApp = makeRenderApp(root, getReport);

  await renderApp();
  await renderApp();

  expect(getReport).toHaveBeenCalledTimes(2);
});
