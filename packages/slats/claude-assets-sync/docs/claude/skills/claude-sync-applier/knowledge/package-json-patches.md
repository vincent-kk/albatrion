# `package.json` Patches

All edits below are **additive**. Existing non-conflicting values remain
untouched. On any conflicting existing value, stop and ask the user — do not
overwrite.

Reference: `packages/canard/schema-form/package.json`.

---

## 1. `bin`

```json
"bin": {
  "claude-sync": "./bin/claude-sync.mjs"
}
```

If `bin` already exists with other entries, merge in the `claude-sync` key;
preserve siblings. If `bin.claude-sync` already points elsewhere, ask.

---

## 2. `files`

Append `"bin"` to the `files` array if not already present. Order within the
array is not load-bearing, but to match the reference:

```json
"files": [
  "dist",
  "docs",
  "bin",
  "README.md"
]
```

If `files` is absent, create it with at least `["dist", "bin"]`, preserving
any conventions already present in sibling packages.

---

## 3. `scripts.build`

Append ` && yarn build:hashes` to whatever the package currently has.

**Guard against double-append.** If the existing value already ends with
`yarn build:hashes` or already contains `build:hashes`, leave it alone.

Reference value:

```json
"build": "rollup -c && yarn build:types && yarn build:hashes"
```

---

## 4. `scripts.build:hashes`

```json
"build:hashes": "node scripts/build-hashes.mjs"
```

If a different `build:hashes` script exists, ask.

---

## 5. `scripts.prepublishOnly`

```json
"prepublishOnly": "yarn build"
```

If the target already has a `prepublishOnly` that calls `yarn build`
(directly or transitively), leave it alone.

---

## 6. `dependencies."@slats/claude-assets-sync"`

**Must be in `dependencies`, never `devDependencies`.**

```json
"dependencies": {
  "@slats/claude-assets-sync": "workspace:^"
}
```

Rationale: isolation from the library bundle is enforced by the import graph
(and optionally by dependency-cruiser), not by dependency-type. Placing it in
`devDependencies` would make `npm install` on a published package fail when a
consumer runs `npx <pkg> claude-sync`.

If the target already has it in `devDependencies`, move it. Do not duplicate.

---

## 7. `claude.assetPath`

Default value (used when the field is absent):

```json
"claude": {
  "assetPath": "docs/claude"
}
```

**If `claude.assetPath` already exists with a non-default value, preserve it.**
The convention lives in the consumer, not the library.

The bin stub guards on `typeof pkg.claude?.assetPath === 'string'` — a missing
or non-string value is a silent no-op. That is the intentional opt-out path.

---

## Must-NOT

- **Never** add `./bin/*` (or any bin path) to the `exports` field. Leaving bin
  subpaths unexported is what prevents a consumer bundler from accidentally
  reaching into the CLI assets via deep imports.

---

## Full Reference

See `packages/canard/schema-form/package.json` for the canonical shape. The
relevant keys are `bin`, `files`, `scripts.build`, `scripts.build:hashes`,
`scripts.prepublishOnly`, `dependencies."@slats/claude-assets-sync"`, and
`claude.assetPath`. Everything else in that file is schema-form-specific and
must not be copied.
