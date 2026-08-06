# Reference Files

Consumers do **not** own any runtime files for the injector. The whole CLI surface lives in `@slats/agents-assets-sync`. A consumer is wired up by editing `package.json` and (optionally) `CLAUDE.md` — nothing else.

Reference consumer: `packages/canard/schema-form`.

## What the consumer MUST own

- `docs/agents/**` — the assets to ship (skills / rules / commands).
- `package.json.agents.assetPath` — string, usually `"docs/agents"`.

## What the consumer MUST NOT own

- Any `bin/` directory or stub file. The engine owns the dispatcher.
- Any `scripts/build-hashes.mjs` wrapper. Use the engine's `agents-build-hashes` bin directly in `scripts.build:hashes`.
- Any `"bin"` entry in `package.json`.
- `./bin/*` or `./docs/*` exposed in `exports`. Exposing them would let bundlers pull CLI code or the docs tree into app bundles.

## What the engine provides

- `inject-agents-settings` bin — dispatcher. Invoked as `npx -p @slats/agents-assets-sync inject-agents-settings --package=<name> --agent=claude --scope=<scope>`. The engine is a consumer-side `devDependency` only, so end users never get a hoisted bin; the `npx -p` form pulls the engine on demand and caches it.
- `agents-build-hashes` bin — reads `process.cwd()/package.json`, picks up `agents.assetPath`, hashes every file beneath it, and writes `dist/agents-hashes.json`. Run via `yarn build:hashes` in the consumer build chain.
- `buildHashes()` + `injectDocs()` — headless programmatic APIs.

No content mirroring across consumers. No stub drift to manage.
