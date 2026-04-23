# Invariants and Gotchas

Hard-earned rules. Each one reflects a previous incident or a design
constraint of the `@slats/claude-assets-sync` engine.

---

## Stubs are verbatim

The `bin/claude-sync.mjs` and `scripts/build-hashes.mjs` files are
**identical across all consumers** in this monorepo. No per-package
substitution. Runtime `import.meta.url` (in the bin) and `process.cwd()` (in
the build script) discover the package root; package metadata is parsed from
the adjacent `package.json`.

If you find yourself "adapting" the stub for a new consumer, stop — that's a
sign you misread the design. The engine is generic; the consumer-specific
convention is the `claude.assetPath` field inside `package.json`.

---

## Silent no-op on missing `claude.assetPath`

Both stubs guard with `if (typeof pkg.claude?.assetPath === 'string')`.

- Missing field → exit 0, produce no output.
- Non-string value → exit 0, produce no output.

This is the intentional opt-out path: a package can ship the bin and script
but disable the feature by removing the config field. Do not add "helpful"
error messages for this case — it would break the opt-out.

---

## `@slats/claude-assets-sync` must be in `dependencies`

**Not** `devDependencies`, **not** `peerDependencies`.

Isolation from the library bundle is enforced by:

1. The import graph (`src/**` never references the engine), and
2. Optionally, dependency-cruiser static rules.

It is **not** enforced by dependency-type. Placing the engine in
`devDependencies` would break `npx <pkg> claude-sync` when a downstream
consumer installs the package — their `npm install` omits dev deps.

---

## Never add `./bin/*` to `exports`

The `exports` map in `package.json` controls which subpaths a consumer's
bundler can resolve. Leaving `./bin/*` out of `exports` is what prevents a
bundler from deep-importing the CLI by accident.

Adding `./bin/claude-sync.mjs` to `exports` — even with `"default"` —
creates a path for a careless `import "@canard/schema-form/bin/claude-sync"`
to pull the CLI engine (and `@slats/claude-assets-sync`) into the library
consumer's production bundle. Three-layer isolation collapses to zero.

---

## Do not commit `dist/claude-hashes.json`

It is a build artifact. The `yarn build` chain regenerates it via
`build:hashes`. It should be in `.gitignore` (usually via a catch-all `dist/`
rule). If you see it in `git status`, stop — something is misconfigured.

---

## `yarn workspace ${PACKAGE_NAME} build` can fail with `rollup: command not found`

Yarn v4 workspace dispatch does not always propagate the workspace-local
PATH. Prefer `yarn ${SHORTCUT} build` from the monorepo root, where
`${SHORTCUT}` is the root-level script alias (e.g. `yarn schemaForm`).

If no shortcut exists, the full form `yarn workspace ${PACKAGE_NAME} build`
may still work depending on yarn version and cache state — but if it fails
with `rollup: command not found`, add a shortcut to the root `package.json`
rather than debugging the nested call.

---

## `--scope=project` walks upward

`--scope=project` and `--scope=local` walk `process.cwd()` upward looking for
an existing `.claude` directory. The first one found is reused; if none is
found, the engine creates one at `cwd`.

Consequence: running the smoke tests from the monorepo root would reuse the
monorepo's real `.claude`, corrupting it. Always run smoke tests from
`/tmp/...` with a fresh directory.

---

## Bin paths are orphans on purpose

`bin/claude-sync.mjs` is an executable entry point. It is never imported from
`src/`. That makes it an orphan in dependency-cruiser's eyes.

Step 4 explicitly excludes `^bin/` from the `no-orphans` rule to silence this
warning. If you add new bin entry points, extend the `pathNot` pattern — do
not disable the rule wholesale.

---

## Three-layer isolation — why

1. **Import graph** — `src/**` never references `bin/**`, `docs/**`, or
   `@slats/claude-assets-sync`. Primary defense.
2. **`sideEffects: false`** — allows the bundler to tree-shake any accidental
   reference.
3. **No `./bin/*` in `exports`** — consumer bundlers cannot reach the bin
   through subpath imports.
4. **(Optional) dependency-cruiser** — CI-time regression check that layer 1
   stays intact.

Step 8 (`grep` on `dist/index.{mjs,cjs}`) is the post-build verification that
all three primary layers held. Any match → one of them is broken.

---

## Commit this change alone

The change set from this skill touches `bin/`, `scripts/`, `package.json`,
and possibly `CLAUDE.md` + `.dependency-cruiser.cjs`. It should land in a
single commit, with no unrelated changes interleaved.

Reasons:

- Easier to revert as a unit if an issue appears downstream.
- The CI signal (smoke tests, bundle grep) is bound to the state of these
  files and nothing else.
- The change is almost entirely mechanical — reviewers can skim-verify
  against the reference consumer without reviewing business logic.

If the user asks to bundle with other work, push back once: recommend a
separate commit. If they still want it bundled, proceed but note it in the
Step 10 report.
