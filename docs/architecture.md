# Architecture

Construct follows the same functional, ports-and-adapters style as the ModulePattern reference project.

## Goals

- Keep domain logic independent from GitHub, AI providers, terminal rendering, and deployment APIs.
- Compose concrete adapters at the edge of the app.
- Make the first TUI useful with sample data while leaving clear seams for real integrations.
- Keep tests focused on core behavior and adapter contracts.

## Current Shape

```text
src/
  core/
    domain/developerMetrics/  pure report-building logic and types
    ports/                    interfaces for external capabilities
  adapters/
    developerMetrics/         sample metrics source today; GitHub source later
    insights/                 rules-based insight engine today; AI engine later
    logger/                   console logger
  cli/
    components/               Ink React terminal UI
    compose.ts                CLI composition root
    index.tsx                 executable entrypoint
```

## Core

The core owns developer metric types and report construction.

- `DeveloperMetricsSource` loads raw metrics.
- `InsightEngine` summarizes those metrics into user-facing insights.
- `makeDeveloperMetrics` returns the report use case.

The core does not know whether metrics came from GitHub, local git history, CI systems, or static sample data.

## Adapters

Adapters implement ports:

- `makeSampleDeveloperMetricsSource` provides deterministic sample data for early TUI work.
- `makeRuleBasedInsightEngine` provides simple local intelligence while we decide which AI capabilities are actually valuable.
- Future GitHub adapters should live under `src/adapters/github/` and implement `DeveloperMetricsSource`.
- Future AI adapters should implement `InsightEngine` without changing the report use case.

## CLI

The CLI is an edge adapter. It composes the core use case and renders the report with Ink.

`src/cli/compose.ts` is the composition root for CLI dependencies. Keep provider setup there or behind small adapter factories so the React components remain mostly presentational.

## AI Direction

Start with concrete product questions before adding model calls:

- Which metric is most likely blocking delivery flow?
- Which PRs are waiting too long and why?
- Which reviewers or repos are overloaded?
- What changed materially since the last report?
- What should the team inspect next?

The initial rules-based engine is intentionally replaceable. A future AI-backed engine can use the same `InsightEngine` port and receive already-normalized metrics plus optional supporting evidence.
