# `package.json` Patches

All edits below are **additive**. Existing non-conflicting values
remain untouched. On any conflicting existing value, stop and ask the
user — do not overwrite.

Reference: `packages/canard/schema-form/package.json`.

---

## 1. `claude.assetPath`

```json
"claude": {
  "assetPath": "docs/claude"
}
```

Consumer-side convention — the engine does not enforce it. Relative
to the consumer's package root. If the field already exists with a
non-default value, preserve it.

A missing or non-string value is an intentional opt-out: the
dispatcher will exit 2 with a clear error, and `claude-build-hashes`
will silently no-op. Do not remove the opt-out path.

---

## 2. `scripts.build`

Ensure the build chain invokes `yarn build:hashes` at the end:

```json
"scripts": {
  "build": "rollup -c && yarn build:types && yarn build:hashes"
}
```

**Guard against double-append.** If the existing value already
contains `build:hashes`, leave it alone.

---

## 3. `scripts.build:hashes`

Point to the engine's bin (NOT a local stub):

```json
"scripts": {
  "build:hashes": "claude-build-hashes"
}
```

`claude-build-hashes` reads `process.cwd()/package.json` and picks
up `claude.assetPath`. Works because `@slats/claude-assets-sync` is
in `devDependencies`, so `node_modules/.bin/claude-build-hashes` is
linked at workspace install time (yarn workspaces link devDeps and
deps identically for workspace-local builds).

If a different `build:hashes` script exists, ask.

---

## 4. `scripts.prepublishOnly`

```json
"scripts": {
  "prepublishOnly": "yarn build"
}
```

Guarantees `dist/claude-hashes.json` is regenerated before publish.
If the target already has a `prepublishOnly` that calls `yarn build`
(directly or transitively), leave it alone.

---

## 5. `devDependencies."@slats/claude-assets-sync"`

**Must be in `devDependencies`, never `dependencies` or
`peerDependencies`.**

```json
"devDependencies": {
  "@slats/claude-assets-sync": "workspace:^"
}
```

Reasons:

- The engine is CLI-only. Declaring it in `dependencies` would pull
  `commander`, `@inquirer/prompts`, and their transitive trees into
  every end-user's production install even though the consumer's
  runtime never imports the engine.
- The monorepo build chain still resolves `.bin/claude-build-hashes`
  from `devDependencies` at `yarn install` time — yarn workspaces
  link devDeps and deps identically for workspace-local builds.
- End users invoke the engine via `npx -p @slats/claude-assets-sync
  inject-claude-settings --package=<THIS>`, which fetches the engine
  on demand and caches it. No transitive bin hoist is required.
- Bundle isolation is enforced by the import graph (`src/**` never
  references the engine), not by dependency-type.

If the target already has it in `dependencies` or
`peerDependencies`, move it to `devDependencies`. Do not duplicate.

---

## 6. `files`

Ship the published artifact surface. Keep `"dist"`, `"docs"`, and
`"README.md"` (plus whatever else the package needs). Do NOT
include `"bin"` or `"scripts"`:

```json
"files": [
  "dist",
  "docs",
  "README.md"
]
```

If `files` is absent, create it with at least `["dist", "docs", "README.md"]`.

---

## 7. `bin` — MUST be ABSENT

Never add a `bin` field. Bin names collide across consumers under
`node_modules/.bin/` and the engine is the sole CLI surface.

---

## 8. `exports` — never add `./bin/*` or `./docs/*`

Exports control which subpaths a consumer's bundler can resolve.
Keeping `./bin/*` and `./docs/*` out of `exports` is what prevents
consumer bundlers from pulling the CLI or the asset tree into app
bundles.

---

## Full Reference

See `packages/canard/schema-form/package.json` for the canonical
shape. The relevant keys are `scripts.build`,
`scripts.build:hashes`, `scripts.prepublishOnly`,
`dependencies."@slats/claude-assets-sync"`, `claude.assetPath`, and
`files`. Everything else in that file is schema-form-specific and
must not be copied.
