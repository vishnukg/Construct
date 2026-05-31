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
Put provider setup in the matching `compose.ts`.

## Compose Functions

Compose functions are edge composition roots.
They wire concrete adapters to core use cases and return the public app surface for that edge.

Example shape:

```ts
const composeApp = (cfg: AppCfg = makeDefaultCfg()) => {
  const { source, insightEngine, logger } = cfg;
  const getReport = makeDevmetrics({ source, insightEngine, logger });

  return { getReport };
};
```

The default config is built with concrete adapters.
The optional config keeps the app easy to test and easy to override later.

Compose functions may return a bucket of capabilities:

```ts
return {
  getReport,
};
```

If more capabilities are added, extend the returned object deliberately.

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
src/ui/index.ts        browser startup
src/ui/compose.ts      browser dependency wiring
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
