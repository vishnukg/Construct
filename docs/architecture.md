# Architecture

Construct follows the same functional, ports-and-adapters style as the ModulePattern reference project.

## Goals

- Keep domain logic independent from GitHub, AI providers, terminal rendering, and deployment APIs.
- Compose concrete adapters at the edge of the app.
- Make the first CLI report useful with sample data while leaving clear seams for real integrations.
- Keep tests focused on core behavior and adapter contracts.

## Current Shape

```text
src/
  app/
    core/
      domain/devmetrics/      pure report-building logic and types
      ports/                  interfaces for external capabilities
    adapters/
      devmetrics/             sample metrics source today; GitHub source later
      insights/               rules-based insight engine today; AI engine later
      logger/                 console logger
    compose.ts                single composition root, reused by both entry points
  cli/
    formatReport.ts           plain terminal report formatting
    index.ts                  executable entrypoint
  ui/
    index.ts                  browser entrypoint
    render/                   DOM report rendering
    styles.css                dashboard styling
```

## Core

The core owns devmetric types and report construction.

- `DevmetricsSource` loads raw metrics.
- `InsightEngine` summarizes those metrics into user-facing insights.
- `makeDevmetrics` returns the report use case.

The core does not know whether metrics came from GitHub, local git history, CI systems, or static sample data.
Ports live under `src/app/core/ports/` because they are the core's contracts.

## Adapters

Adapters implement ports:

- `makeSampleDevmetricsSource` provides deterministic sample data for early CLI work.
- `makeRuleBasedInsightEngine` provides simple local intelligence while we decide which AI capabilities are actually valuable.
- Future GitHub adapters should live under `src/app/adapters/github/` and implement `DevmetricsSource`.
- Future AI adapters should implement `InsightEngine` without changing the report use case.

## Composition root

`src/app/compose.ts` is the single composition root for the app. Its `composeApp`
function selects the default adapters and wires them into the core use case,
returning the app surface (`{ getReport }`). Both entry points reuse it, so
adapter selection and domain wiring live in exactly one place. Pass a partial
`cfg` to `composeApp` to override any default (for example in tests).

Because the CLI and UI differ only in how they _present_ the report — not in how
the app is wired — there is no separate compose file per entry point. The
presentation difference lives in each `index.ts` (see below). Keep provider
setup in `compose.ts` or behind small adapter factories so presentation stays
purely presentational.

## CLI

The CLI is an edge entry point. It calls `composeApp()` and prints a plain
terminal report via `formatReport`.

## UI

The UI is a separate browser entry point built with Vite and vanilla TypeScript.
It calls the same `composeApp()` and renders the report into DOM elements via
`makeRenderApp` instead of terminal text.

The UI build can be deployed separately from the CLI because Vite emits static
browser assets while the CLI build emits a Node executable.

## AI Direction

Start with concrete product questions before adding model calls:

- Which metric is most likely blocking delivery flow?
- Which PRs are waiting too long and why?
- Which reviewers or repos are overloaded?
- What changed materially since the last report?
- What should the team inspect next?

The initial rules-based engine is intentionally replaceable. A future AI-backed engine can use the same `InsightEngine` port and receive already-normalized metrics plus optional supporting evidence.
