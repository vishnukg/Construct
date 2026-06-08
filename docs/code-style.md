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
They may read runtime state and choose concrete adapters. Put wiring in the
relevant composition root (`src/cli/compose.ts` or `src/ui/compose.ts`).

## Compose Functions

A `compose*` function is a **composition root**: it selects/builds concrete
adapters (by calling `make*` factories), wires them into core use cases, and
returns the public app surface.

This app has **one composition root per entry point**:

- `src/cli/compose.ts` wires the report use case and exposes `{ cli }`.
- `src/ui/compose.ts` wires the report use case and exposes `{ renderApp }`.

Example shape — the entry point selects concrete adapters, while `composeCliApp`
wires those dependencies into the core use case and returns the CLI surface:

```ts
const composeCliApp = ({ source, insightEngine, logger }: CliAppCfg) => {
  const getReport = makeDevmetrics({ source, insightEngine, logger });
  const cli = { run: async () => formatReport(await getReport()) };

  return { cli };
};
```

Compose functions return whatever the caller needs — usually a named bucket of
capabilities (`{ cli }`, `{ renderApp }`). If more capabilities are added, extend
the returned object deliberately.

### make vs compose: the one test that decides it

Open the function body and ask:

> **Does it call another factory (`make*` / `compose*`) to build one of its parts?**
>
> - **No** → it's a **`make*`**. Its work is written inline; it just uses the
>   dependencies it is handed. (`makeDevmetrics`, `makeRuleBasedInsightEngine`,
>   `makeSampleDevmetricsSource`, `makeRenderApp`.)
> - **Yes** → it's a **`compose*`**. It calls other factories and/or selects
>   concrete adapters, then wires them. (`composeCliApp`, `composeUiApp`.)

The deciding factor is _calling other factories_, **not** the return type — a
`compose*` may return a single port or a bag of peers. `makeDevmetrics` is a
`make*` because it receives `source`/`insightEngine`/`logger` ready-made and
defines `getReport` inline; `composeCliApp` and `composeUiApp` are `compose*`
functions because they build those adapters and wire them in.

(For functions that are neither — plain data transforms like `formatReport` or
the private `riskInsight` helpers — see **render Functions** below: no `make*` /
`compose*` prefix, because they build data, not ports.)

### Naming: `make*` is named for the thing it produces

The behavioural test above (does it call a factory?) decides `make` vs `compose`.
A second guideline decides _what to call a `make*`_: **name it for the noun/port
it produces, not for an action.**

- `makeRuleBasedInsightEngine` → `InsightEngine`, `makeSampleDevmetricsSource` →
  `DevmetricsSource`, `makeConsoleLogger`/`makeNoOpLogger` → `Logger`. Each is named
  for the port it returns.
- A `make*` may return a **single-operation port** (a function) instead of a
  multi-method object — that is fine. `makeDevmetrics` returns the
  `getDevmetricsReport` operation; the compose functions expose entry-specific
  surfaces such as `{ cli }` or `{ renderApp }`.
  The factory is named for its domain (`Devmetrics`), the operation it returns is
  the verb (`getReport`).
- `makeRenderApp` is the one factory named after an action rather than a noun. It
  is deliberate and consistent with the **`render*` convention** (below): it
  produces the top-level `renderApp` loop — a `render*` function that is held onto
  and called on every refresh — so it is a `make*` whose product happens to be a
  render function. If you ever generalise it into a UI object with several methods,
  rename it for that noun.

The rule of thumb: if you're tempted to write `make<Verb>` (e.g. `makeReserve`,
`makeFetch`), the verb usually wants to be a **method or returned operation** of a
noun-named factory, not the factory's own name.

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
const makeConsoleLogger = (): Logger => ({
  info: (message, data) => console.info(message, data ?? ""),
  warn: (message, data) => console.warn(message, data ?? ""),
  error: (message, data) => console.error(message, data ?? ""),
});
```

Both loggers are `make*` factories — `makeConsoleLogger` and `makeNoOpLogger` —
so the adapter set is uniform: every adapter is built by calling a factory, none
is a bare exported singleton.

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

## Why factories, not classes

From the _outside_, `makeDevmetrics(...)` and a `class Devmetrics { … }` look the
same — both hand you something whose methods you call. That similarity is the
point: callers only see the port. The differences are in **construction and
internal mechanics**, and for dependency-injected, long-lived services they favour
the factory. The honest framing is not "factories beat classes" — it's "factories
drop the three things classes drag along (`this`, `new`, inheritance) that this app
doesn't need."

**1. No `this`-binding bugs.** `this` is bound by _how_ a method is called. Detach a
class method and it breaks:

```ts
const r = new Devmetrics(source, engine, logger);
const getReport = r.getReport; // detached
await getReport(); // 💥 `this` is undefined inside getReport
```

A factory captures its dependencies in a closure, so the returned function carries
them no matter how it's called. This repo relies on exactly that: `makeRenderApp`
returns `renderApp` and passes it _to_ `renderReport` as a refresh callback —

```ts
renderReport(root, report, renderApp); // renderApp called later, detached
```

— which is only safe because `renderApp` is a closure, not a `this`-bound method.

**2. Genuinely private dependencies.** `source`, `insightEngine`, and `logger` live
in the closure — there is no `report.source` to reach from outside. A class's
`private` is only a compile-time fiction in TypeScript (`(r as any).source` works at
runtime).

**3. Dependencies are visible as a plain type.** `MakeDevmetricsCfg` _is_ the
contract — read it and you know exactly what the use case needs. No constructor to
scan, no decorators, no container. And because the result just satisfies a port, a
test double is a plain object literal (see `makeDevmetrics.test.ts`: `{ summarize:
async () => [] }`) — no `implements`, no subclass, no mocking framework.

**4. It's just a function.** No `new`, so factories compose like any function and
partially apply: `makeDevmetrics({ source, insightEngine, logger })` fixes the deps
now and returns an operation that only needs runtime args later.

### Where classes actually win

This is a trade-off, not a slam dunk. Reach for a class when you create **very many
short-lived instances** (prototype methods are shared — see Memory and GC below),
need `instanceof`/inheritance, or work inside a framework that expects classes. None
of those apply to this app's handful of startup-built services.

## Memory and GC

A worry sometimes raised about factories: closures cost more memory than classes.
Worth understanding precisely, because the answer here is "it doesn't matter, and
when it would, there's a simple fix."

**Why a closure costs more.** A class defines its methods **once**, on the
prototype, shared across all instances. A factory defines its methods **inside the
call**, so each call to `makeDevmetrics(...)` allocates a fresh closure _and_ fresh
function objects:

```ts
const a = makeConsoleLogger();
const b = makeConsoleLogger();
a.info === b.info; // false — distinct function objects per call
```

**Why it doesn't matter in this app.** Every `make*` here runs **once, at startup**,
inside the relevant entry-point compose function. One `DevmetricsSource`, one
`InsightEngine`, one `Logger`, and one entry surface are built when the app boots
and reused for its whole life. The per-instance cost is paid a handful of times,
total: kilobytes at boot, below noise.

**When it would matter, and how to optimise.** Only if a `make*` is called on a hot
path (per request, per tick, in a tight loop). In order of preference:

1. **Hoist it.** Build once outside the loop and reuse — which is exactly what
   the compose functions already do, and why the UI builds `renderApp` once rather
   than per refresh.
2. **Drop the closure** — use a plain function that takes its deps as arguments
   (`getReport(deps, …)`); one function object for the whole process, nothing
   allocated per call. This is the `render*` style: plain transforms, no closure.
3. **Use a class** — when you genuinely need many instances _and_ shared methods
   _and_ `instanceof`. That's what prototypes are for; don't force a factory there.

**Don't micro-optimise on faith — measure.** Modern V8 optimises hot closures and
collects short-lived objects cheaply. Reach for options 2–3 only when a profiler
points at factory allocation, not preemptively.

### Is this production-safe?

For this codebase: yes, and closures are not the thing to watch. Every factory is a
startup singleton (`composeCliApp` or `composeUiApp` runs once; the UI builds
`renderApp` once and reuses it on refresh), so no factory runs on a hot path and
no closure is rebuilt per report. The real production watch-items live elsewhere:

- **`makeSampleDevmetricsSource` is a stub** — it returns canned data. A real
  deployment needs a source backed by an actual provider (and that adapter is where
  network errors, retries, and timeouts get handled before they reach
  `makeDevmetrics`, which now logs `devmetrics.report.failed` and re-throws).
- **The UI re-renders the whole report on each refresh** (`renderApp` rebuilds the
  DOM). Fine at the current surface size; revisit if the report grows large or
  refreshes frequently.

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
src/ui/compose.ts      browser composition root
src/ui/index.ts        browser startup
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
