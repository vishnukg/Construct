# Construct

Construct is a terminal workspace for developer workflow metrics, project bootstrapping, and engineering flow intelligence.

The first slice is intentionally small: it renders sample metrics for delivery lead time, PR wait time, review time, code size, and deployment time. The code is shaped around ports and factory functions so GitHub, deployment, and AI providers can be added without pushing those concerns into the core.

## Name

`construct` is inspired by the Matrix training environment: a loaded workspace where useful programs, signals, and workflows can appear on demand. That maps well to a CLI that starts with developer metrics and can grow into project bootstrapping and other engineering tools.

## Run

```sh
make install
make cli
```

## Useful Commands

```sh
make typecheck
make test
make build
```

## Container Workflow

Construct follows the 3 Musketeers pattern: `make` is the command interface, Docker provides the runtime, and Docker Compose wires the app container. Local Node is not required for day-to-day project commands.

Common targets:

- `make install` installs npm dependencies inside the container and writes `package-lock.json`.
- `make cli` runs the TUI.
- `make all` runs install, typecheck, lint, test, and build.
- `make shell` opens a shell in the app container.
- `make clean` removes Compose-managed containers, networks, and volumes.

## Direction

Near-term integrations:

- GitHub REST and GraphQL adapters for pull requests, reviews, timeline events, and code size.
- Deployment adapters from GitHub Actions first, then provider-specific APIs if needed.
- AI insight adapter that summarizes bottlenecks, spots anomalies, and recommends the next metric to inspect.

The initial AI boundary is a local rules-based insight engine. That gives the TUI real behavior now while leaving the provider choice open.
