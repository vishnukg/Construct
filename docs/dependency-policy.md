# Dependency Policy

## Package Manager

Construct uses npm with `package-lock.json`.

Use Make targets so npm runs inside the container:

```sh
make install
make update-deps
```

Avoid local `npm install` for normal workflow. It can use a different npm version than the container and may update dependency ranges or the lockfile outside the intended environment.

## Approved Install Scripts

npm may warn about packages with install scripts that have not been reviewed:

```text
npm warn allow-scripts ... install scripts not yet covered by allowScripts
```

This repository records reviewed install scripts in `package.json` under `allowScripts`.

Currently approved:

- `esbuild@0.27.7`
- `esbuild@0.28.0`
- `fsevents@2.3.3`

Why these are allowed:

- `esbuild` uses install scripts for its platform-specific binary.
- `fsevents` is the common macOS file-watching dependency used by parts of the JS tooling ecosystem.

To review future warnings:

```sh
npm approve-scripts --allow-scripts-pending
npm approve-scripts <package-name>
```

Only approve packages when the install script is expected and the package is a normal part of the toolchain. If a new package appears unexpectedly, inspect the dependency change first.

## Lockfile Discipline

- Commit `package-lock.json`.
- Use `npm ci` for repeatable installs.
- Use `npm install` only when intentionally updating dependencies.
- Run `make all` after dependency changes.
