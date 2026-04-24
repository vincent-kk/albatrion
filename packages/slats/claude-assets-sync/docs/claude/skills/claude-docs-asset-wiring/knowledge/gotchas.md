# Invariants and Gotchas

Hard-earned rules. Each one reflects a previous incident or a design
constraint of the `@slats/claude-assets-sync` engine.

---

## The engine is the only CLI surface

`inject-claude-settings` lives in one place: the engine package. No
consumer has a bin. No consumer has a `bin/` directory. No consumer
has a `scripts/` directory. If you find yourself "adapting" a stub
for a new consumer, stop — wiring does not need code; it needs two
fields in `package.json`.

---

## `claude.assetPath` is the opt-in marker

The engine's `claude-build-hashes` bin silently no-ops when
`claude.assetPath` is missing or not a string. The dispatcher
(`inject-claude-settings`) exits 2 with a clear error when a target
lacks the field. Both behaviors are intentional: missing = opt-out.

Do not add "helpful" error messages at build time for the opt-out
case — it would break silently-disabled packages.

---

## `@slats/claude-assets-sync` must be in `dependencies`

Not `devDependencies`, not `peerDependencies`. Reasons:

1. Monorepo build chain needs `.bin/claude-build-hashes` resolved,
   which requires the engine as a direct dep of each consumer.
2. For end users on npm / yarn-classic, listing the engine in
   `dependencies` makes `inject-claude-settings` transitively
   hoisted into `node_modules/.bin/`, enabling the short
   invocation `npx inject-claude-settings --package=<THIS>`.
3. Bundle isolation is enforced by the import graph (`src/**`
   never references the engine), not by dependency-type.

Pnpm strict users do not get the transitive hoist and must use the
universal form `npx -p @slats/claude-assets-sync inject-claude-settings
--package=<THIS>`. Every consumer's CLAUDE.md documents both paths.

---

## Never add `./bin/*` or `./docs/*` to `exports`

The `exports` map in `package.json` controls which subpaths a
consumer's bundler can resolve. Keeping `./docs/*` out of
`exports` is what prevents a bundler from deep-importing the docs
tree into app bundles.

---

## Do not commit `dist/claude-hashes.json`

It is a build artifact. The `yarn build` chain regenerates it via
`build:hashes`. It should be in `.gitignore` (usually via a
catch-all `dist/` rule). If you see it in `git status`, stop —
something is misconfigured.

---

## `yarn workspace ${PACKAGE_NAME} build` can fail with `rollup: command not found`

Yarn v4 workspace dispatch does not always propagate the
workspace-local PATH. Prefer `yarn ${SHORTCUT} build` from the
monorepo root, where `${SHORTCUT}` is the root-level script alias
(e.g. `yarn schemaForm`, `yarn claudeAssetsSync`).

If no shortcut exists, the full form may still work depending on
yarn version and cache state — but if it fails with `rollup:
command not found`, add a shortcut to the root `package.json`
rather than debugging the nested call.

---

## `--scope=project` walks upward

`--scope=project` walks `process.cwd()` upward looking for an
existing `.claude` directory. The first one found is reused; if
none is found, the engine creates one at `cwd`.

Consequence: running the smoke tests from the monorepo root would
reuse the monorepo's real `.claude`, corrupting it. Always run
smoke tests from `/tmp/...` with a fresh directory.

---

## Dispatcher exception to the `src/core` purity rule

`src/core/**` never reads `package.json` or walks the filesystem.
The engine's `bin/inject-claude-settings.mjs` and
`src/commands/runCli/utils/resolvePackage.ts` are allowed to
`createRequire().resolve(`${name}/package.json`)` for exactly one
target — the one named in `--package=<name>`. The dispatcher never
enumerates, never walks `node_modules` for siblings. Preserve this
boundary: extensions like `--all` or workspace scan require
explicit re-architecture.

---

## Commit this change alone

The change set from this skill touches the consumer's
`package.json` and possibly its `CLAUDE.md`. It should land in a
single commit, with no unrelated changes interleaved.

Reasons:

- Easier to revert as a unit if an issue appears downstream.
- The CI signal (smoke tests) is bound to the state of these files
  and nothing else.
- Reviewers can skim-verify against the reference consumer without
  reviewing business logic.

If the user asks to bundle with other work, push back once:
recommend a separate commit. If they still want it bundled,
proceed but note it in the Step 6 report.
