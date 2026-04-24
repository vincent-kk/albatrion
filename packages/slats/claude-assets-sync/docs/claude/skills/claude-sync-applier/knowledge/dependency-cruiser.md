# Step 4 — dependency-cruiser isolation gate (optional)

This step is **only** executed when:

- `${TARGET_PATH}/.dependency-cruiser.cjs` already exists (static isolation
  was previously enforced), OR
- The user explicitly asks for it.

Do **not** introduce a new `.dependency-cruiser.cjs` into a target package that
has not already opted into static analysis — the runtime isolation (import
graph + `sideEffects: false` + no `bin` in `exports`) is sufficient on its own.

**Legacy**: `.dependency-cruiser.js` (not `.cjs`) → out of scope. Flag to user
and do not rename.

Reference: `packages/canard/schema-form/.dependency-cruiser.cjs`.

---

## Changes to Apply

When applicable, mirror the reference config. Four edits total:

### 1. Append three `forbidden` rules

Append each with `severity: 'error'`:

```js
{
  name: 'src-no-bin',
  severity: 'error',
  comment:
    'src/ must not import from bin/. bin/ is a CLI-only entry point and must ' +
    'never leak into the library bundle.',
  from: { path: '^src/' },
  to: { path: '^bin/' },
},
{
  name: 'src-no-docs',
  severity: 'error',
  comment:
    'src/ must not import from docs/. docs/claude/** contains pure markdown assets ' +
    'meant only for the inject-docs CLI, not for the library runtime.',
  from: { path: '^src/' },
  to: { path: '^docs/' },
},
{
  name: 'src-no-claude-assets-sync',
  severity: 'error',
  comment:
    '@slats/claude-assets-sync is a CLI-only dependency. It is allowed only ' +
    'from bin/. Importing it from src/ would leak the CLI engine into ' +
    'consumer production bundles.',
  from: { path: '^src/' },
  to: { path: 'node_modules/@slats/claude-assets-sync' },
},
```

Place these alongside the existing `forbidden` rules in the reference config.
Do not duplicate if any of these rule names already exist.

### 2. Extend `no-orphans` rule

Add `'^bin/'` to the existing `no-orphans` rule's `from.pathNot` array. `bin`
entry points are orphans by design (they're invoked as executables, not
imported).

```js
from: {
  orphan: true,
  pathNot: [
    '(^|/)[.][^/]+[.](?:js|cjs|mjs|ts|cts|mts|json)$',
    '[.]d[.]ts$',
    '(^|/)tsconfig[.]json$',
    '(^|/)(?:babel|webpack)[.]config[.](?:js|cjs|mjs|ts|cts|mts|json)$',
    '^bin/',
  ],
},
```

### 3. Expand `options.includeOnly`

Change to include both `src` and `bin` so dependency-cruiser scans the bin
entry points as well:

```js
includeOnly: ['^src', '^bin'],
```

### 4. Add `depcheck` script

In `${TARGET_PATH}/package.json` `scripts`:

```json
"depcheck": "depcruise src bin --config .dependency-cruiser.cjs --no-progress"
```

If an existing `depcheck` script points elsewhere, ask the user.

---

## Post-Step Verification

After Steps 1–6 complete and this Step 4 has been applied, Step 9 runs:

```bash
yarn ${SHORTCUT:-workspace ${PACKAGE_NAME}} depcheck
```

Must exit 0 with no errors. Pre-existing `no-orphans` warnings are acceptable.

---

## Why This Step Is Optional

The three-layer isolation works without static analysis:

1. Import graph: `src/**` never references `bin/**`, `docs/**`, or
   `@slats/claude-assets-sync`.
2. `"sideEffects": false` + `"type": "module"` — dead-code elimination of any
   accidental reference.
3. No `./bin/*` in `exports` — consumer bundlers cannot deep-import into bin.

dependency-cruiser adds a fourth layer (CI-time regression detection) but is
not required for correctness. Don't force-enable it on a package that hasn't
opted in — it carries real maintenance cost.
