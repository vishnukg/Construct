# ADR 0001: Use npm as the Package Manager

## Status

Accepted.

## Context

Construct is a TypeScript CLI project that currently uses Node, npm, Vitest, ESLint, and tsup. The project also follows a container-first workflow, so the package manager runs inside Docker through Make targets.

We considered whether Yarn would be better than npm.

## Decision

Use npm for now.

## Rationale

npm is the conservative choice for this repo because:

- It ships with Node, including the `node:24-bookworm-slim` container image.
- It keeps the container image and onboarding simpler.
- `package-lock.json` plus `npm ci` gives repeatable installs.
- The current dependency set does not need Yarn-specific features.
- npm now has an install-script review workflow through `npm approve-scripts`, which we document and use.

Yarn may become useful later if we need workspace features, Plug'n'Play, zero-installs, or a broader monorepo workflow. Those benefits are not needed yet and would add extra moving parts today.

## Consequences

- Keep `package-lock.json` committed.
- Use `make install` for deterministic installs.
- Use `make update-deps` for intentional dependency updates.
- Revisit this decision if Construct becomes a multi-package monorepo or if npm becomes a material source of friction.
