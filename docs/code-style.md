# Code Style

Construct uses a functional ports-and-adapters style.
The goal is to keep domain logic easy to test, entrypoints thin, and provider-specific code replaceable.

## Folder Boundaries

```text
src/app/core
  Domain logic, domain types, and ports.

src/app/adapters
  Concrete implementations of core ports.

src/cli
  Terminal entrypoint, CLI composition, and terminal formatting.

src/ui
  Browser entrypoint, UI composition, DOM rendering, and CSS.
```

Do not put provider, terminal, browser, Docker, or HTTP client details into `src/app/core`.

## Core

Core code owns business behavior.

Core may import:

```text
src/app/core/domain
src/app/core/ports
```

Core should not import:

```text
src/app/adapters
src/cli
src/ui
```

Ports live under `src/app/core/ports` because they are contracts the core depends on.
Adapters implement those contracts.

## Adapters

Adapters are concrete implementations of ports.

Examples:

```text
makeSampleDevmetricsSource -> DevmetricsSource
makeRuleBasedInsightEngine -> InsightEngine
makeNoOpLogger             -> Logger
```

Adapters may know about external systems or implementation details.
They should return objects that satisfy core ports and hide their internals from the core.

## Entrypoints

Entrypoints should be thin.

CLI:

```text
src/cli/index.ts
```

Browser UI:

```text
src/ui/index.ts
```

Entrypoints should:

```text
start the app
handle top-level errors
call the relevant renderer or command
```

Entrypoints should not contain business rules or concrete provider setup.
Put provider setup in the composition root, `src/app/compose.ts`.

## Compose Functions

A `compose*` function is a **composition root**: it selects/builds concrete
adapters (by calling `make*` factories), wires them into core use cases, and
returns the public app surface.

This app has **one** composition root — `src/app/compose.ts` — reused by both
entry points. The CLI and UI differ only in how they _present_ the report, not
in how the app is wired, so there is no per-entry compose file; the presentation
difference lives in each `index.ts`.

Example shape — `composeApp` selects the concrete adapters (that is the
composition root's job) and wires them into the core use case:

```ts
const composeApp = (cfg: Partial<AppCfg> = {}) => {
  const source = cfg.source ?? makeSampleDevmetricsSource();
  const insightEngine = cfg.insightEngine ?? makeRuleBasedInsightEngine();
  const logger = cfg.logger ?? consoleLogger;

  const getReport = makeDevmetrics({ source, insightEngine, logger });

  return { getReport };
};
```

The defaults are concrete adapters; passing a partial `cfg` overrides any of them
(e.g. in tests). Compose functions return whatever the caller needs — usually a
named bucket of capabilities (`{ getReport }`). If more capabilities are added,
extend the returned object deliberately.

### make vs compose: the one test that decides it

Open the function body and ask:

> **Does it call another factory (`make*` / `compose*`) to build one of its parts?**
>
> - **No** → it's a **`make*`**. Its work is written inline; it just uses the
>   dependencies it is handed. (`makeDevmetrics`, `makeRuleBasedInsightEngine`,
>   `makeSampleDevmetricsSource`, `makeRenderApp`.)
> - **Yes** → it's a **`compose*`**. It calls other factories and/or selects
>   concrete adapters, then wires them. (`composeApp`.)

The deciding factor is _calling other factories_, **not** the return type — a
`compose*` may return a single port or a bag of peers. `makeDevmetrics` is a
`make*` because it receives `source`/`insightEngine`/`logger` ready-made and
defines `getReport` inline; `composeApp` is a `compose*` because it builds those
adapters and wires them in.

(For functions that are neither — plain data transforms like `formatReport` or
the private `riskInsight` helpers — see **render Functions** below: no `make*` /
`compose*` prefix, because they build data, not ports.)

## make Functions

`make*` functions are factories. They create a reusable capability — a function, use case, or adapter object — that is held onto and called repeatedly.

Examples:

```ts
const getReport = makeDevmetrics({ source, insightEngine, logger });
// getReport is called on every refresh — it is a reusable capability

const engine = makeRuleBasedInsightEngine();
// engine.summarize is called whenever metrics are fetched

const renderApp = makeRenderApp(root, getReport);
// renderApp is called on first load and on every refresh
```

The test: if the thing being returned is called more than once across the lifetime of the app, it is a factory and the function should be named `make*`.

Avoid returning unnamed behavior directly from a factory:

```ts
// Avoid
return async () => {
  ...
};
```

Prefer naming the behavior before returning it:

```ts
const getDevmetricsReport = async () => {
  ...
};

return getDevmetricsReport;
```

Arrow functions are fine when they are assigned to meaningful names or clear object keys.
Inline logger methods are acceptable because the object key carries the meaning:

```ts
const consoleLogger: Logger = {
  info: (message, data) => console.info(message, data ?? ""),
  warn: (message, data) => console.warn(message, data ?? ""),
  error: (message, data) => console.error(message, data ?? ""),
};
```

## render Functions

`render*` functions are transforms. They take data and produce a one-time DOM element. They are not factories — they do not close over dependencies or return something reusable.

```ts
const card = renderMetric(metric);
// card is an HTMLElement, produced once and immediately appended
```

Use `render*` when:

- The function takes data and returns a DOM element
- Nothing is closed over — all inputs arrive as arguments
- The result is used immediately and not held onto

Use `make*` instead when:

- The function closes over dependencies (a root element, a `getReport` function)
- The returned value is called more than once across the app's lifetime

The distinction matters because they have different reasons to change. `render*` functions change when the visual design changes. `make*` factories change when the app's wiring or lifecycle changes.

## Rendering

Rendering code is presentation code.

CLI rendering belongs in:

```text
src/cli/formatReport.ts
```

Browser rendering belongs in:

```text
src/ui/render/
src/ui/styles.css
```

Rendering may depend on core types, but it should not recompute domain rules.
For example, renderers can display `metric.status`; they should not decide whether a metric is `good`, `watch`, or `risk`.

## UI Rules

The UI is currently vanilla TypeScript.
Keep it simple while the product surface is small.

Use:

```text
src/ui/index.ts        browser startup (calls the shared src/app/compose.ts)
src/ui/render/         DOM creation
src/ui/styles.css      styling and responsive layout
```

Do not add a framework until the UI needs routing, complex forms, shared client state, or many reusable components.

## Build Outputs

CLI and UI deploy separately:

```text
dist/cli/cli.js
dist/ui/index.html
```

`tsc` typechecks only:

```text
npm run typecheck
```

`tsdown` builds the CLI:

```text
npm run build
```

Vite builds the UI:

```text
npm run ui:build
```

## Verification

Before committing, run:

```sh
npm run format:check
npm run typecheck
npm run lint
npm run security:audit
npm test
npm run build
npm run ui:build
node dist/cli/cli.js
```
