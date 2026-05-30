# Development Workflow

Construct uses the 3 Musketeers pattern:

- `make` is the developer interface.
- Docker provides the runtime.
- Docker Compose wires the app container and volumes.

Use `make` targets instead of running local Node commands directly.

## First Run

```sh
make install
make cli
```

## Common Commands

```sh
make help
make install
make cli
make typecheck
make lint
make security-audit
make test
make build
make all
make shell
make clean
```

## Dependency Commands

`make install` uses `npm ci` for repeatable installs from `package-lock.json`.

When intentionally changing dependencies, edit `package.json` or run npm inside the container through:

```sh
make update-deps
```

Then run:

```sh
make all
```

## Environment Variables

The Compose service passes these through when present:

- `GITHUB_TOKEN`
- `OPENAI_API_KEY` (reserved for the future AI insight adapter)

Do not commit secrets. Local environment files are ignored by `.gitignore`.
