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
  cli/
    compose.ts                CLI composition root
    formatReport.ts           plain terminal report formatting
    index.ts                  executable entrypoint
  ui/
    compose.ts                UI composition root
    index.ts                  browser entrypoint
    renderReport.ts           DOM report rendering
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

## CLI

The CLI is an edge adapter. It composes the core use case and prints a plain terminal report.

`src/cli/compose.ts` is the composition root for CLI dependencies.
It owns the default adapter wiring for the CLI and returns the CLI app surface.
Keep provider setup there or behind small adapter factories so report formatting stays presentational.

## UI

The UI is a separate browser entrypoint built with Vite and vanilla TypeScript.
It reuses the same core use case and current adapters as the CLI, then renders the report into DOM elements instead of terminal text.

`src/ui/compose.ts` is the composition root for browser dependencies.
It owns the default adapter wiring for the browser UI and returns the UI app surface.
The UI build can be deployed separately from the CLI because Vite emits static browser assets while the CLI build emits a Node executable.

## AI Direction

Start with concrete product questions before adding model calls:

- Which metric is most likely blocking delivery flow?
- Which PRs are waiting too long and why?
- Which reviewers or repos are overloaded?
- What changed materially since the last report?
- What should the team inspect next?

The initial rules-based engine is intentionally replaceable. A future AI-backed engine can use the same `InsightEngine` port and receive already-normalized metrics plus optional supporting evidence.
