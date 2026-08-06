# Invariants and Gotchas

Hard-earned rules. Each one reflects a previous incident or a design constraint of the `@slats/agents-assets-sync` engine.

---

## The engine is the only CLI surface

`inject-agents-settings` lives in one place: the engine package. No consumer has a bin. No consumer has a `bin/` directory. No consumer has a `scripts/` directory. If you find yourself "adapting" a stub for a new consumer, stop — wiring does not need code; it needs two fields in `package.json`.

---

## `agents.assetPath` is the opt-in marker

The engine's `agents-build-hashes` bin silently no-ops when `agents.assetPath` is missing or not a string. The dispatcher exits 2 with a clear error when a single named target lacks the field; inside a batch or a `@scope` alias the same target is a reported skip instead, so one unwired workspace member does not fail the run.

Do not add "helpful" error messages at build time for the opt-out case — it would break silently-disabled packages.

---

## `@slats/agents-assets-sync` must be in `devDependencies`

Not `dependencies`, not `peerDependencies`. The four reasons are in `knowledge/package-json-patches.md` §5; every consumer's `CLAUDE.md` documents the single `npx -p` path that follows from them.

---

## Never add `./bin/*` or `./docs/*` to `exports`

The `exports` map in `package.json` controls which subpaths a consumer's bundler can resolve. Keeping `./docs/*` out of `exports` is what prevents a bundler from deep-importing the docs tree into app bundles.

---

## Do not commit `dist/agents-hashes.json`

It is a build artifact. The `yarn build` chain regenerates it via `build:hashes`. It should be in `.gitignore` (usually via a catch-all `dist/` rule). If you see it in `git status`, stop — something is misconfigured.

---

## `yarn workspace ${PACKAGE_NAME} build` can fail with `rolldown: command not found`

Yarn v4 registers only the binaries of a workspace's own dependencies on that workspace's PATH, so a tool declared at the root is not on it. Prefer `yarn ${SHORTCUT} build` from the monorepo root, where `${SHORTCUT}` is the root-level script alias (e.g. `yarn schemaForm`, `yarn agentsAssetsSync`).

If no shortcut exists, the full form may still work depending on yarn version and cache state — but if it fails with `rolldown: command not found`, add a shortcut to the root `package.json` rather than debugging the nested call. A script inside the workspace reaches a root-declared binary with `yarn run -T <bin>`.

---

## `--scope=project` walks upward

`--scope=project` walks `process.cwd()` upward for the first directory owning any of `.claude`, `AGENTS.md`, `.agents`, `.codex`, `.git`. The first match is reused; with no match anywhere, the engine falls back to `cwd`.

`.git` is one of the anchors, so every directory in this repository resolves to the repository root. Running the smoke tests from anywhere inside the monorepo would write into the real `.claude/` — always run them from a fresh `/tmp/...` directory.

---

## Dispatcher exception to the `src/core` purity rule

`src/core/**` never reads `package.json` or walks the filesystem. The engine's `bin/inject-agents-settings.mjs` and `src/commands/runCli/targets/resolvePackage.ts` are allowed to ``createRequire().resolve(`${name}/package.json`)`` for one explicitly-named target at a time. Sibling enumeration is confined to `targets/resolveScopeAlias.ts`, the only file allowed to walk `node_modules`. Preserve this boundary: any new enumeration path is a re-architecture, not a patch.

---

## Optional: dependency-cruiser isolation gate

Skip unless `${TARGET_PATH}/.dependency-cruiser.cjs` already exists or the user asks for it. It is a CI-time check that the consumer's `src/**` never reaches the assets tree. One forbidden rule is all this layout needs — the consumer owns no `bin/` and imports the engine from nowhere, so nothing else is load-bearing.

```javascript
module.exports = {
  forbidden: [
    {
      name: 'src-no-docs',
      severity: 'error',
      comment:
        'src/ must not import from docs/. docs/agents/** contains pure markdown ' +
        'assets meant only for the engine dispatcher, not for the library runtime.',
      from: { path: '^src/' },
      to: { path: '^docs/' },
    },
  ],
  options: {
    doNotFollow: { path: 'node_modules' },
    includeOnly: '^(src|docs)',
  },
};
```

```json
"scripts": {
  "depcheck": "depcruise src docs --config .dependency-cruiser.cjs --no-progress"
}
```

Zero errors expected. Orphan warnings on `docs/**` are acceptable — the docs tree never imports anything.

---

## Commit this change alone

The change set from this skill touches the consumer's `package.json` and possibly its `CLAUDE.md`. It should land in a single commit, with no unrelated changes interleaved.

Reasons:

- Easier to revert as a unit if an issue appears downstream.
- The CI signal (smoke tests) is bound to the state of these files and nothing else.
- Reviewers can skim-verify against the reference consumer without reviewing business logic.

If the user asks to bundle with other work, push back once: recommend a separate commit. If they still want it bundled, proceed but note it in the Step 6 report.
