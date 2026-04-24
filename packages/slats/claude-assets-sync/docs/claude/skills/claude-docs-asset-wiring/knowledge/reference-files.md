# Reference Files

Consumers do **not** own any runtime files for the injector. The whole
CLI surface lives in `@slats/claude-assets-sync`. A consumer is wired
up by editing `package.json` and (optionally) `CLAUDE.md` — nothing
else.

Reference consumer: `packages/canard/schema-form`.

## What the consumer MUST own

- `docs/claude/**` — the assets to ship (skills / rules / commands).
- `package.json.claude.assetPath` — string, usually `"docs/claude"`.

## What the consumer MUST NOT own

- Any `bin/` directory or stub file. The engine owns the dispatcher.
- Any `scripts/build-hashes.mjs` wrapper. Use the engine's
  `claude-build-hashes` bin directly in `scripts.build:hashes`.
- Any `"bin"` entry in `package.json`.
- `./bin/*` or `./docs/*` exposed in `exports`. Exposing them would
  let bundlers pull CLI code or the docs tree into app bundles.

## What the engine provides

- `inject-claude-settings` bin — dispatcher. Invoked as
  `npx -p @slats/claude-assets-sync inject-claude-settings --package=<name> --scope=<scope>`,
  or (on npm / yarn-classic) `npx inject-claude-settings --package=<name> --scope=<scope>`
  once the engine is installed as a transitive dependency of the
  consumer.
- `claude-build-hashes` bin — reads `process.cwd()/package.json`,
  picks up `claude.assetPath`, hashes every file beneath it, and
  writes `dist/claude-hashes.json`. Run via `yarn build:hashes` in
  the consumer build chain.
- `buildHashes()` + `injectDocs()` — headless programmatic APIs.

No content mirroring across consumers. No stub drift to manage.
