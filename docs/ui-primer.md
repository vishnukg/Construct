# UI Primer

This document has five parts:

1. **How browser UIs work** — what HTML, CSS, and JS are and how a browser uses them.
2. **UI architecture patterns** — how to structure UI code so it stays understandable as it grows.
3. **Vanilla TypeScript and functional programming for UI** — whether you can build real UIs without a framework.
4. **How this project's UI is built** — the specific files, patterns, and wiring in Construct.
5. **Testing the UI** — how to unit test render functions, what tools are involved, and what not to test.

---

## Part 1: How Browser UIs Work

### The three building blocks

Every web page is made of three things:

| Thing                   | What it does                                         | File type     |
| ----------------------- | ---------------------------------------------------- | ------------- |
| HTML                    | Describes the structure — what elements exist        | `.html`       |
| CSS                     | Describes the appearance — colors, layout, spacing   | `.css`        |
| JavaScript / TypeScript | Describes behavior — what happens when things change | `.ts` / `.js` |

A browser reads all three and combines them into a visual page.

### The DOM

When the browser reads your HTML, it builds an in-memory tree of objects called the **DOM** (Document Object Model). Every element in the HTML file becomes a node in that tree:

```text
document
└── html
    └── body
        └── div#app
```

JavaScript can read and change this tree at any time:

```ts
const el = document.createElement("p"); // create a new node
el.textContent = "Hello"; // set its text
document.body.append(el); // add it to the tree
```

The browser immediately reflects those changes on screen. This is how UIs become dynamic — instead of reloading the whole page, JavaScript rewrites the parts that changed.

### How CSS connects to elements

CSS does not know about your TypeScript code directly. It only sees class names and element types. TypeScript creates elements with class names, and CSS provides styles for those names.

```ts
// TypeScript creates the element with a class
const card = document.createElement("article");
card.className = "metric metric-risk";
```

```css
/* CSS targets that class */
.metric-risk .status-badge {
  color: #8e241e;
  background: #ffe0dc;
}
```

If you want something to look different, add or remove a class name in TypeScript. CSS handles the rest.

### Why a dev server?

Browsers can open a plain `.html` file from disk, but they block many features for security:

- `import` statements between files are blocked
- TypeScript must be compiled to JavaScript first
- CSS `@import` across files does not work in the same way

A dev server solves this. It intercepts browser requests, compiles TypeScript on the fly, handles module imports, and serves everything over `http://`. This is what Vite does.

For production, Vite bundles all the files into a small set of optimized `.js` and `.css` files that any web server can serve statically.

### Frameworks vs vanilla

Popular UI frameworks like React, Svelte, and Vue sit on top of the DOM. They add:

- **Reactivity** — automatically re-render when data changes, instead of manually calling render functions.
- **Components** — reusable UI pieces with their own logic and styles scoped together.
- **Routing** — show different UI for different URLs without reloading the page.

This project uses **vanilla TypeScript** instead. There is no framework. TypeScript calls browser APIs directly. This keeps the code simple while the UI is small — there is only one page and one data flow. See [Part 3](#part-3-vanilla-typescript-and-functional-programming-for-ui) for a thorough treatment of when this is appropriate.

---

## Part 2: UI Architecture Patterns

These three patterns govern how this project's UI is structured. They are independent of any framework — they are principles, not library features.

### Pattern 1: Component decomposition

A **component** in vanilla TypeScript is a function that:

- Takes data as its input (function arguments)
- Returns a DOM element as its output
- Has no side effects beyond building that element — it does not fetch data, read global state, or directly modify anything outside itself

```ts
// This is a component
const renderMetric = (metric: MetricSummary): HTMLElement => {
  const card = createElement("article", `metric metric-${metric.status}`);
  // ... build and return the element ...
  return card;
};
```

The key property is self-containment. `renderMetric` does not know that `renderReport` exists. It does not know about `renderInsight`. It only knows: given a `MetricSummary`, produce this DOM structure.

**Why this matters: understandability**

You can read `renderMetric.ts` and understand it completely without reading any other file. The function signature tells you everything going in and everything coming out. There are no hidden dependencies.

**Why this matters: testability**

Because the function takes data and returns an element, you can test it directly:

```ts
const el = renderMetric({ label: "PR Cycle Time", value: 5, target: 3, status: "risk", ... });
// assert el has class "metric-risk"
// assert el contains the text "5 days"
```

No mocking, no setup, no browser simulation required beyond a DOM environment.

**Why this matters: replaceability**

If you want to redesign the metric card, you change `renderMetric.ts`. Nothing else needs to change because nothing else knows how a metric is rendered.

**The anti-pattern: the monolith render function**

Imagine if `renderReport` built every element inline — the topbar, the summary strip, every metric card, every insight — all in one 300-line function. A single change to how an insight looks requires you to find the right 10 lines inside that 300. There are no clear units to understand, test, or replace. Components are the solution: they give the UI the same single-responsibility discipline that the core domain code already has.

**The render tree**

Components compose into a tree, exactly like the DOM itself:

```text
renderReport(root, report, onRefresh)
  └── renderSummary(report)         → section element
  └── renderMetric(metric)          → article element, one per metric
  └── renderInsight(insight)        → article element, one per insight
```

Each node in the tree is a self-contained function. The parent composes them; the children know nothing about each other.

---

### Pattern 2: Data flows down

In this UI, data only moves in one direction: **from parent to child, as function arguments**.

`renderReport` receives the full report and passes slices of it down:

```ts
const renderReport = (
  root: HTMLElement,
  report: DevmetricsReport,
  onRefresh: () => void,
) => {
  // ...
  for (const metric of report.metrics) {
    metrics.append(renderMetric(metric)); // passes one MetricSummary down
  }
  for (const insight of report.insights) {
    insights.append(renderInsight(insight)); // passes one Insight down
  }
  // ...
};
```

`renderMetric` and `renderInsight` receive exactly the data they need and nothing more. They never reach upward to get more data themselves.

**Why this matters: render functions become pure functions**

A pure function is one where the same input always produces the same output, with no hidden dependencies on external state. Every render function in this project is a pure function in this sense.

This is functional programming applied to UI. The benefit is predictability: if `renderMetric` ever produces wrong output, you only have to look at its input to understand why. There is no hidden state to investigate, no shared mutable object that might have been modified elsewhere.

**Why this matters: the data flow is traceable**

Because data only flows in one direction, you can always answer "where does this value come from?" by reading upward through the call stack. The value in the metric card came from `renderMetric(metric)`, which was called by `renderReport`, which received `report` from `index.ts`, which got it from `getReport()`. That chain is completely explicit.

**The anti-pattern: a render function that fetches its own data**

Imagine if `renderMetric` called `getReport()` directly to look up its own data. Now:

- `renderMetric` is no longer self-contained — it depends on a function that hits an adapter
- You cannot test it without setting up the full app composition
- Two different places in the tree could call `getReport()` and get inconsistent results
- The data flow is no longer traceable — data enters the tree from multiple points

The rule is: render functions receive data. They do not acquire it.

---

### Pattern 3: Events bubble up

While data flows down, user actions flow upward through **callback functions**.

A child component signals that something happened by calling a function it was given as an argument. The parent defines what that function does. The child does not know what the parent will do — it only knows that something happened and it should report it.

```ts
// renderReport does not know what "refresh" means
const renderReport = (
  root: HTMLElement,
  report: DevmetricsReport,
  onRefresh: () => void,
) => {
  const refreshButton = createElement("button", "refresh-button", "Refresh");
  refreshButton.addEventListener("click", onRefresh); // calls the callback, that's all
  // ...
};

// index.ts defines what refresh means
const renderApp = async () => {
  appRoot.dataset.state = "loading";
  try {
    const report = await app.getReport();
    renderReport(appRoot, report, renderApp); // passes renderApp as the onRefresh callback
    appRoot.dataset.state = "ready";
  } catch (caught) {
    appRoot.dataset.state = "error";
  }
};
```

`renderReport` contains the button. `index.ts` contains the behavior. The callback is the wire between them.

**Why this matters: render functions stay presentational**

If the refresh button's click handler were inside `renderReport`, it would need to call `getReport()`, manage the loading state, and handle errors. `renderReport` would be doing two jobs: building the UI and orchestrating application behavior. Those two jobs have different reasons to change and belong in different places.

By accepting a callback, `renderReport` stays purely presentational. It says: "a refresh was requested." It leaves the meaning of "refresh" entirely to the caller.

**Why this matters: the parent stays in control**

The parent (`index.ts`) is the place that knows about loading state, error handling, and the app's data source. It makes sense that the parent also defines what happens when a user action occurs. Callbacks preserve that ownership.

**The anti-pattern: a child that reaches up**

Imagine if the refresh button's handler directly called `composeApp()` from inside `renderReport`. Now:

- `renderReport` imports from `src/app/compose.ts`, coupling a display function to the app's wiring
- There is no way to test the refresh button without a full browser environment and the real app composition
- The behavior of the button is hidden inside a render function where no one would think to look for it

Callbacks keep behavior ownership explicit and at the right level.

---

### Pattern 4: State lives at the boundary

**What is state?**

State is any value that changes over time and affects what is displayed. In a simple UI like this one, there are three states:

- `loading` — data is being fetched
- `ready` — data arrived, report is displayed
- `error` — something went wrong

**What is the boundary?**

The boundary is the point where the outside world enters your app. Here, the outside world is the async call to `getReport()`. Before it resolves, the UI is in loading state. After it resolves, the UI is in ready state. If it rejects, the UI is in error state.

The boundary is always where state should live — because state changes _because_ of what happens at the boundary.

```ts
// index.ts: owns the boundary, owns the state
const renderApp = async () => {
  appRoot.dataset.state = "loading"; // state transition 1

  try {
    const report = await app.getReport(); // the boundary — async I/O
    renderReport(appRoot, report, renderApp);
    appRoot.dataset.state = "ready"; // state transition 2
  } catch (caught) {
    appRoot.dataset.state = "error"; // state transition 3
    appRoot.textContent = caught instanceof Error ? caught.message : "Failed";
  }
};
```

Render functions receive already-resolved data. They display state; they do not manage it.

**The `data-state` pattern**

Rather than adding and removing DOM elements to show a loading spinner, the state is stored on the existing `#app` element as a data attribute. CSS then controls visibility:

```css
#app[data-state="loading"]::before {
  content: "Loading Construct...";
}
```

This is a deliberate choice: there is only one place where state lives (the `#app` element's `dataset.state`), and CSS responds to it declaratively. There is no spinner element to remember to remove, and no risk of showing both the spinner and the content simultaneously.

**The anti-pattern: state inside a render function**

Imagine if `renderReport` received a `Promise<DevmetricsReport>` instead of a resolved report, and managed its own loading spinner internally. Now:

- `renderReport` is no longer a pure function — it contains a pending async operation and its own internal state
- You cannot test it without waiting for the promise to resolve
- The loading state lives inside a render function, making it invisible to `index.ts`
- If two things can update state (the render function's spinner and `index.ts`'s `data-state`), they can contradict each other

The rule is: render functions receive complete, resolved data. They do not wait for anything.

---

## Part 3: Vanilla TypeScript and Functional Programming for UI

### Is this a legitimate approach?

Yes, fully. Vanilla TypeScript with functional principles is a legitimate, professional approach to building browser UIs. It is not a workaround or a stepping stone. It is appropriate for any UI that does not need the specific capabilities that frameworks provide.

The render functions in this project are pure functions. They take data, return elements, have no side effects. That is not "basic" UI programming — it is UI programming done in a functional style, and it has real advantages.

### How functional programming maps to UI

The same principles that make the core domain code clean apply directly to the UI layer:

**Pure functions**

A render function that takes data and returns a DOM element with no side effects is a pure function. Given the same report, `renderMetric` always produces the same card. This makes the UI predictable in the same way that `makeDevmetrics` is predictable — the output is fully determined by the input.

**Immutability**

Render functions do not mutate their input. They receive a `MetricSummary` and build a new element from it. The original data is untouched. This matters because multiple render functions might receive the same data, and you never want one render function's side effects to affect another's output.

**Function composition**

`renderReport` is composed from `renderMetric`, `renderInsight`, `renderSummary`, and the DOM helpers in `dom.ts`. Small, single-purpose functions are combined into larger ones. This is function composition applied to UI, the same pattern used throughout the app core.

**Separation of data and display**

The core domain owns how metrics are classified (good/watch/risk). The render layer owns how those classifications are displayed (green/amber/red badges). These concerns are fully separated. Changing the color of a risk badge does not require touching `makeDevmetrics.ts`. Changing the threshold for "watch" status does not require touching `renderMetric.ts`.

### What vanilla TS handles perfectly

- Loading data once, rendering it, letting the user refresh
- Static layouts where structure does not change, only content does
- Simple interactions: button clicks, form submissions that trigger a data reload
- Any UI that is fundamentally "fetch data, display data" — which covers a large fraction of real dashboards and internal tools

### What gets harder without a framework

**Surgical DOM updates**

If a single metric changes its status, re-rendering the whole report is the simplest approach (which this project does via `root.replaceChildren()`). This works fine at small scales. A framework's virtual DOM diffing would update only the changed card without touching anything else. At large scales — hundreds of items updating frequently — full re-renders become noticeably slow.

**Scoped styles**

CSS class names in this project are global. `.metric` in `styles.css` applies to every element with that class anywhere on the page. Frameworks like React and Svelte support scoped styles where `.metric` inside a component only applies to that component's elements. In vanilla CSS, you manage this through naming discipline — if you add a new section with its own kind of "metric," you need to name it differently to avoid collision.

**Complex interactive state**

If the UI grows to include which panel is expanded, which filter is active, which row is selected, and those states interact with each other, managing them manually in vanilla TypeScript becomes error-prone. Frameworks provide tools (useState, stores, signals) that handle this systematically.

### How to handle more complexity without a framework

If the UI grows but you want to stay with vanilla TypeScript, the functional pattern scales by centralizing state explicitly:

```ts
// one state object, one update function, one render call
type AppState = {
  status: "loading" | "ready" | "error";
  report: DevmetricsReport | null;
  filter: "all" | "risk" | "watch";
  error: string | null;
};

const update = (state: AppState, newState: Partial<AppState>): AppState => ({
  ...state,
  ...newState,
});

const render = (root: HTMLElement, state: AppState) => {
  root.replaceChildren();
  // build UI from state
};

// every user action produces a new state and triggers a re-render
const onFilterChange = (filter: AppState["filter"]) => {
  appState = update(appState, { filter });
  render(appRoot, appState);
};
```

This is the same unidirectional pattern: state flows down into render, user actions produce new state at the top. It is essentially what Redux and similar libraries formalize. You can do it without them.

### The honest limits

Vanilla TypeScript reaches its natural limits when:

- The UI has many independently-updating regions and full re-renders produce visible flicker
- Multiple views or routes need to be managed
- Components need to be reused with isolated state (e.g., a dropdown that tracks its own open/closed state and is used in 20 places)

At that point, a framework is not a concession — it is the right tool. But those limits are not close for a dashboard that loads a report and displays it.

---

## Part 4: How This Project's UI Is Built

### Mental model

The UI has four layers:

```text
src/ui/index.html
  the browser page structure and mount point

src/ui/index.ts
  browser entrypoint; owns state and the async boundary

src/ui/render/*.ts
  pure functions: take report data, return DOM elements

src/ui/styles.css
  controls layout, spacing, color, and responsive behavior
```

The UI reuses the same application layer as the CLI, including the single
composition root:

```text
src/app/core      report logic and types
src/app/adapters  sample metrics source, insight engine, logger
src/app/compose.ts  wires adapters into the core use case (shared by CLI and UI)
```

CLI and UI share the same report-building behavior. They differ only in how they display the result: CLI prints plain text, UI builds DOM nodes.

### How a render cycle works

When the page loads, this sequence runs:

```text
1. Browser loads index.html
2. Browser sees <script type="module" src="/index.ts">
3. Vite compiles index.ts and its imports
4. index.ts finds the #app element
5. index.ts calls composeApp() (from src/app/compose.ts) to get getReport()
6. index.ts sets data-state="loading" on #app
7. index.ts calls getReport(), which fetches metrics and insights from adapters
8. index.ts sets data-state="ready" and passes the report to renderReport()
9. renderReport() creates DOM nodes and appends them to #app
10. The page is visible
```

When the user clicks Refresh, steps 6–9 repeat. The root element is cleared and rebuilt from scratch.

### HTML (`src/ui/index.html`)

```html
<div id="app"></div>
<script type="module" src="/index.ts"></script>
```

`#app` is an empty mount point. TypeScript finds it by ID and fills it with content.

`type="module"` tells the browser to treat the script as an ES module, which enables `import` statements. Vite intercepts the request for `/index.ts` and compiles it.

The `data-state` attribute on `#app` is set by TypeScript during loading and error states:

```ts
appRoot.dataset.state = "loading"; // shows "Loading Construct..." via CSS
appRoot.dataset.state = "ready"; // hides the loading message
appRoot.dataset.state = "error"; // shows an error message
```

CSS uses attribute selectors to respond:

```css
#app[data-state="loading"]::before {
  content: "Loading Construct...";
}
```

This pattern avoids adding and removing elements for loading states — the state lives on the existing element and CSS handles the display.

### Compose (`src/app/compose.ts`, shared)

```ts
const composeApp = (cfg: Partial<AppCfg> = {}) => {
  const source = cfg.source ?? makeSampleDevmetricsSource();
  const insightEngine = cfg.insightEngine ?? makeRuleBasedInsightEngine();
  const logger = cfg.logger ?? makeConsoleLogger();

  const getReport = makeDevmetrics({ source, insightEngine, logger });

  return { getReport };
};
```

`src/app/compose.ts` is the single place where dependencies are wired together —
the CLI and UI share it, because they wire the app identically and differ only
in how they present the report. `src/ui/index.ts` is the only file in `src/ui/`
that imports it; all render files receive data as function arguments and do not
touch the app layer directly.

If the UI later needs genuinely browser-specific adapters (ones the CLI must not
use), pass them in via `composeApp(cfg)` from `src/ui/index.ts` rather than
re-introducing a per-edge compose file:

```text
localStorage settings adapter
HTTP metrics source (fetches from a real API)
browser analytics logger
```

### Rendering (`src/ui/render*.ts`)

Each render file is a pure function: it receives data and returns a DOM element. It does not fetch data, hold state, or know about other parts of the UI.

```text
renderReport(root, report, onRefresh)
  clears root
  creates the page shell (main.shell)
  creates the top bar (header.topbar)
    brand (div.brand) — title + timestamp
    refresh button (calls onRefresh on click)
  calls renderSummary(report) → section.summary-strip
  calls renderMetric(metric) for each metric → article.metric
  calls renderInsight(insight) for each insight → article.insight
  appends everything to root
```

The DOM helpers in `src/ui/dom.ts` keep element creation concise:

```ts
// Without helpers
const el = document.createElement("article");
el.className = "insight";
el.textContent = "...";

// With helpers
const el = createElement("article", "insight", "...");
```

### CSS (`src/ui/styles.css`)

The main layout classes:

```text
.shell           page width cap and outer padding
.topbar          title and refresh button, flex row
.summary-strip   4-column counts grid
.dashboard       two-column layout: metrics left, insights right
.metrics-grid    2-column metric card grid
.metric          individual metric card
.insights-panel  insights sidebar
.insight         individual insight entry
```

Status-specific styling uses modifier classes appended by TypeScript:

```text
.metric-good     green badge and progress bar
.metric-watch    amber badge and progress bar
.metric-risk     red badge and progress bar

.insight-info      blue severity label
.insight-warning   amber severity label
.insight-critical  red severity label
```

### Responsive layout

The dashboard is two columns on desktop and one column on small screens:

```css
/* desktop: metrics grid | insights panel */
.dashboard {
  grid-template-columns: minmax(0, 1fr) minmax(280px, 360px);
}

/* small screen: stack vertically */
@media (max-width: 820px) {
  .dashboard {
    grid-template-columns: 1fr;
  }
}
```

When adding new layout sections, check both widths.

### Vite config (`vite.config.ts`)

```ts
export default defineConfig({
  root: "src/ui", // where index.html lives
  build: {
    outDir: "../../dist/ui", // where to emit production files
  },
});
```

`root: "src/ui"` tells Vite to treat `src/ui/` as the project root. This means:

- The dev server looks for `index.html` in `src/ui/`
- Absolute paths in HTML (like `/index.ts`) resolve from `src/ui/`
- `outDir` is relative to `root`, so `../../dist/ui` resolves to `dist/ui` at the repo root

### Running the UI

```sh
npm run ui          # dev server at http://localhost:5173 with hot reload
npm run ui:build    # production build to dist/ui/
npm run ui:preview  # preview the production build locally
```

Or via Docker:

```sh
make ui
make ui-build
```

### Safe change guide

| What to change                 | Where to change it                                                                                  |
| ------------------------------ | --------------------------------------------------------------------------------------------------- |
| Text, layout, colors           | `src/ui/render/renderReport.ts`, `src/ui/styles.css`                                                |
| A specific render piece        | `src/ui/render/renderMetric.ts`, `src/ui/render/renderInsight.ts`, `src/ui/render/renderSummary.ts` |
| Metric data                    | `src/app/adapters/devmetrics/`                                                                      |
| Status rules (good/watch/risk) | `src/app/core/domain/devmetrics/makeDevmetrics.ts`                                                  |
| Insights                       | `src/app/adapters/insights/`                                                                        |
| App wiring / default adapters  | `src/app/compose.ts` (shared by CLI and UI)                                                         |

### When to add a framework

Stay with vanilla TypeScript while the UI is mostly:

```text
load report
render report
refresh report
```

Consider React, Svelte, or another framework when the UI needs:

```text
routing (multiple pages or views)
forms with complex validation
interactive state that changes without a data reload
components with isolated internal state reused in many places
large item lists that update frequently and need surgical DOM updates
```

Until then, vanilla TypeScript with functional principles is a complete and appropriate choice.

---

## Part 5: Testing the UI

### The DOM problem

Most unit tests run in Node.js, which has no browser APIs. There is no `document`, no `window`, no `createElement`. If you try to call `renderMetric()` in a plain Node test, it crashes immediately because those APIs don't exist.

The solution is a **DOM simulation** — a JavaScript library that implements browser APIs inside Node.js. This project uses **happy-dom**. It is fast and lightweight, handles the DOM APIs needed for building and querying elements, and integrates directly with Vitest.

To activate it for a test file, add this comment at the very top:

```ts
// @vitest-environment happy-dom
```

Vitest sees that comment and initialises a happy-dom environment for that file before any tests run. Files without the comment run in plain Node.

### What happy-dom can and cannot do

happy-dom implements the DOM tree: creating elements, setting classes and text, appending children, querying with `querySelector`. This is all you need to test render functions.

What it does **not** do:

- **Layout and paint** — elements have no computed dimensions or positions. `getBoundingClientRect()` returns zeroes.
- **Computed styles** — CSS from stylesheets is not applied. A `.metric-risk` element does not turn red. `getComputedStyle()` returns defaults.
- **Visual correctness** — happy-dom cannot tell you whether the page looks right. That is the job of screenshot testing and manual review.

The practical rule: test structure and content (class names, text, element existence). Do not test visual appearance.

### The three tiers of testability

#### Tier 1: Pure functions — no DOM needed

Some functions in the UI layer take data and return a primitive. They do not touch the DOM at all. Test them exactly like domain logic — no environment comment required.

`formatDelta` and `getProgressPercent` in `renderMetric.ts` are both exported and both purely functional:

```ts
// No @vitest-environment comment needed — no DOM involved
describe("formatDelta", () => {
  describe("given a metric that is exactly on target", () => {
    it("when called, then it returns 'On target'", () => {
      const metric = testMetric({ deltaFromTarget: 0 });
      expect(formatDelta(metric)).toBe("On target");
    });
  });
});
```

If a function takes data and returns a string or number, it belongs here regardless of which file it lives in.

#### Tier 2: Render functions — need happy-dom

Render functions call `document.createElement`, so they need the environment comment. The test pattern is always the same:

1. **Arrange** — build the input data with a fixture builder
2. **Act** — call the render function and capture the returned element
3. **Assert** — query the element and check its structure

```ts
// @vitest-environment happy-dom

describe("renderInsight", () => {
  describe("given an insight with 'critical' severity", () => {
    it("when rendered, then the element has the insight-critical modifier class", () => {
      // Arrange
      const insight = testInsight({ severity: "critical" });

      // Act
      const el = renderInsight(insight);

      // Assert
      expect(el.className).toContain("insight-critical");
    });
  });
});
```

The test asks three questions:

- Does the right element exist? (`querySelector` returning non-null)
- Does it have the right class? (`el.className`, `.toContain`)
- Does it show the right text? (`el.textContent`, `querySelector(".x")?.textContent`)

This works cleanly because render functions are pure: same input → same output. There is no state to set up, no async to await, no mocking of external services. The architecture from Part 2 is what makes this straightforward.

#### Tier 3: Orchestration — async boundary and state transitions

`index.ts` owns the async boundary and the loading/error/ready state transitions. Testing it means:

- Stubbing `getReport` with `vi.fn()` to return controlled data or throw
- Creating a real `#app` element
- Calling the async render function
- Asserting on the element's `dataset.state`

This is more involved than a pure render test, but it follows the same AAA structure. The key point is that `index.ts` is the only place where this complexity lives — it has been deliberately pushed there so everything else stays simple.

### Fixture builders

Hard-coding full `MetricSummary` and `Insight` objects in every test is noisy and makes tests brittle when types change. The project uses fixture builders in `tests/helpers/testFixtures.ts`:

```ts
export const testMetric = (
  overrides: Partial<MetricSummary> = {},
): MetricSummary => ({
  id: "test-metric",
  label: "Test Metric",
  value: 8,
  unit: "days",
  target: 10,
  trend: "flat",
  lowerIsBetter: true,
  status: "good",
  deltaFromTarget: -2,
  ...overrides,
});
```

The function provides sensible defaults for every field. Tests pass only what they care about:

```ts
// Only the status matters for this test — everything else is irrelevant
const metric = testMetric({ status: "risk" });
```

If the `MetricSummary` type gains a new required field, you update `testMetric` in one place and all tests continue to work. Without this, adding a field would require updating every test file that creates metric data.

The same pattern exists for `testInsight` and `testReport`.

### Testing callbacks

The event callback pattern from Part 2 (events bubble up) is directly testable with `vi.fn()`:

```ts
describe("given an onRefresh callback", () => {
  it("when the refresh button is clicked, then the callback is called once", () => {
    // Arrange
    const onRefresh = vi.fn();
    const root = document.createElement("div");

    // Act
    renderReport(root, testReport(), onRefresh);
    root.querySelector<HTMLButtonElement>(".refresh-button")?.click();

    // Assert
    expect(onRefresh).toHaveBeenCalledOnce();
  });
});
```

`vi.fn()` creates a spy — a function that records every call made to it. You can then assert how many times it was called, with what arguments, and in what order.

This test verifies that `renderReport` correctly wires the button to the callback. It does not test what the callback does — that belongs in the test for `index.ts`, where the callback is defined.

### What not to test

**Do not test CSS visual outcomes.** Class names confirm that the right CSS hook is present. Whether the badge is actually red is a visual question that requires a real browser or a screenshot tool.

**Do not exhaustively test element structure.** If `renderMetric` creates an `article` element, you do not need a test that asserts `el.tagName === "ARTICLE"`. Test the meaningful behavior: the right class for the right status, the right text for the label and value. Trust `createElement` — it is already tested in `dom.test.ts`.

**Do not test `src/app/compose.ts`.** It wires known-good pieces together. The composition is validated by the app running correctly. A unit test here would just duplicate what the other tests already cover.

### Test file map

| Test file                                                      | What it covers                                                        |
| -------------------------------------------------------------- | --------------------------------------------------------------------- |
| `src/ui/render/dom.test.ts`                                    | `createElement`, `appendChildren`                                     |
| `src/ui/render/renderApp.test.ts`                              | `makeRenderApp` — loading/ready/error state transitions, refresh loop |
| `src/ui/render/renderMetric.test.ts`                           | `formatDelta`, `getProgressPercent`, `renderMetric`                   |
| `src/ui/render/renderInsight.test.ts`                          | `renderInsight`                                                       |
| `src/ui/render/renderSummary.test.ts`                          | `renderSummary`                                                       |
| `src/ui/render/renderReport.test.ts`                           | `renderReport`, refresh callback wiring                               |
| `src/app/core/domain/devmetrics/makeDevmetrics.test.ts`        | `makeDevmetrics` (core domain)                                        |
| `src/app/adapters/insights/makeRuleBasedInsightEngine.test.ts` | `makeRuleBasedInsightEngine` (adapter)                                |

Test fixtures shared across the UI tests live in `src/ui/render/testFixtures.ts`.
