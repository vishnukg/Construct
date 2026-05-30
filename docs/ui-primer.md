# UI Primer

This project has a small browser UI built with Vite and vanilla TypeScript.
There is no React, router, state library, or component framework yet.

The goal is to keep the UI understandable while the product surface is still small.

## Mental Model

The UI has four layers:

```text
index.html
  creates the browser page and #app mount point

src/ui/index.ts
  browser entrypoint; starts the UI

src/ui/compose.ts
  wires app dependencies for the browser

src/ui/renderReport.ts
  turns a DevmetricsReport into DOM elements

src/ui/styles.css
  controls layout, spacing, color, and responsive behavior
```

The UI reuses the same application layer as the CLI:

```text
src/app/core      report logic and ports
src/app/adapters  current sample metrics, insights, and logger
```

That means CLI and UI share the same report behavior, but render it differently.

## HTML

The browser starts at `index.html`.

The important part is:

```html
<div id="app"></div>
<script type="module" src="/src/ui/index.ts"></script>
```

`#app` is an empty mount point.
The TypeScript entrypoint finds that element and fills it with UI.

`type="module"` lets the browser load modern JavaScript modules.
Vite handles TypeScript, CSS imports, and bundling during dev/build.

## TypeScript Entry

`src/ui/index.ts` is the browser entrypoint.

It does this:

```text
import CSS
create the UI app from src/ui/compose.ts
load the report
render the report into #app
handle loading/error states
```

The entrypoint should stay small.
It should coordinate startup, not contain layout details, business logic, or concrete adapter setup.

## Compose

`src/ui/compose.ts` is the UI composition root.

It builds the default browser dependencies, wires the shared app use case, and returns the UI app surface:

```ts
const source = makeSampleDevmetricsSource();
const insightEngine = makeRuleBasedInsightEngine();
const logger = makeNoOpLogger();
const getReport = makeDevmetrics({ source, insightEngine, logger });

return { getReport };
```

This mirrors `src/cli/compose.ts`.

If the UI later needs browser-specific dependencies, add them here or behind small adapter factories.

Examples:

```text
localStorage settings adapter
HTTP metrics source
browser analytics logger
```

## Rendering

`src/ui/renderReport.ts` converts a `DevmetricsReport` into DOM nodes.

It uses browser APIs directly:

```ts
document.createElement("section");
element.className = "metrics-grid";
element.textContent = "Construct";
parent.append(child);
```

The current render flow is:

```text
renderReport(root, report, onRefresh)
  clears root
  creates the page shell
  creates the top bar
  creates the summary strip
  renders each metric card
  renders each insight
  appends everything to root
```

Keep business rules out of rendering.
If report status logic changes, update `src/app/core`.
If the display changes, update `src/ui/renderReport.ts` and `src/ui/styles.css`.

## CSS

`src/ui/styles.css` controls the visual design.

The main classes are:

```text
.shell           page width and outer spacing
.topbar          title and refresh button layout
.summary-strip   high-level counts
.dashboard       two-column desktop layout
.metrics-grid    metric card grid
.metric          individual metric card
.insights-panel  insights column
.insight         individual insight
```

CSS is class-based.
TypeScript creates elements with class names, and CSS styles those classes.

Example:

```ts
const item = createElement("article", `metric metric-${metric.status}`);
```

That produces classes like:

```html
<article class="metric metric-risk"></article>
```

CSS can then style different statuses:

```css
.metric-risk .status-badge {
  color: #8e241e;
  background: #ffe0dc;
}
```

## Responsive Layout

The UI uses a media query near the bottom of `styles.css`:

```css
@media (max-width: 820px) {
  ...
}
```

Desktop uses a two-column dashboard:

```text
metrics grid | insights panel
```

Small screens collapse to one column:

```text
metrics grid
insights panel
```

When changing layout, check both desktop and narrow widths.

## Dev Server

Run the UI locally with:

```sh
npm run ui
```

or through Docker:

```sh
make ui
```

The dev server is available at:

```text
http://localhost:5173
```

Vite reloads the browser when UI files change.

## Production Build

Build the browser UI with:

```sh
npm run ui:build
```

or:

```sh
make ui-build
```

This emits static files into `dist/`:

```text
dist/ui/index.html
dist/ui/assets/*.js
dist/ui/assets/*.css
```

Those files can be deployed separately from the CLI.
The CLI build produces a Node executable; the UI build produces browser assets.

## Safe Change Guide

To change text or layout:

```text
src/ui/renderReport.ts
src/ui/styles.css
```

To change metric data:

```text
src/app/adapters/devmetrics/
```

To change status rules:

```text
src/app/core/domain/devmetrics/makeDevmetrics.ts
```

To change insights:

```text
src/app/adapters/insights/
```

To add browser-specific wiring:

```text
src/ui/compose.ts
```

## When To Add A Framework

Stay with vanilla TypeScript while the UI is mostly:

```text
load report
render report
refresh report
```

Consider React, Svelte, or another framework when the UI needs:

```text
routing
forms
complex user state
interactive charts
many reusable components
client-side data fetching states
```

Until then, vanilla TypeScript keeps the moving parts low.
