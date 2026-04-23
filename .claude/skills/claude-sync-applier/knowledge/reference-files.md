# Reference Files

The two stub files are **identical across all consumers**. Copy verbatim, do
no substitution — the stubs discover package metadata at runtime via
`import.meta.url`.

Reference consumer: `packages/canard/schema-form`.

---

## `bin/claude-sync.mjs`

Source of truth: `packages/canard/schema-form/bin/claude-sync.mjs`.

Expected content (must match exactly):

```js
#!/usr/bin/env node
import { runCli } from '@slats/claude-assets-sync';
import { readFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const pkg = JSON.parse(
  await readFile(resolve(packageRoot, 'package.json'), 'utf-8'),
);

if (typeof pkg.claude?.assetPath === 'string') {
  runCli(process.argv, {
    packageRoot,
    packageName: pkg.name,
    packageVersion: pkg.version,
    assetPath: pkg.claude.assetPath,
  }).catch((err) => {
    process.stderr.write(
      `[${pkg.name}] claude-sync failed: ${err instanceof Error ? err.message : String(err)}\n`,
    );
    process.exit(1);
  });
}
```

**Notes**

- `import.meta.url` is resolved at runtime to the installed file path, so
  `packageRoot` works both during local development and when consumed as a
  dependency.
- `pkg.claude?.assetPath` missing → the stub is a silent no-op. That is the
  feature that lets a package opt out without shipping broken bins.
- Emit to stderr on failure and exit 1. Do not `throw` — the CLI is the
  process boundary.

After writing, make it executable:

```bash
chmod +x ${TARGET_PATH}/bin/claude-sync.mjs
```

---

## `scripts/build-hashes.mjs`

Source of truth: `packages/canard/schema-form/scripts/build-hashes.mjs`.

Expected content (must match exactly):

```js
#!/usr/bin/env node
// Thin wrapper — parses this package's package.json and delegates to
// @slats/claude-assets-sync/buildHashes. The `claude.assetPath` convention
// lives here, in the consumer; the library is generic.
import { buildHashes } from '@slats/claude-assets-sync/buildHashes';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const packageRoot = process.cwd();
const pkg = JSON.parse(
  await readFile(resolve(packageRoot, 'package.json'), 'utf-8'),
);

if (typeof pkg.claude?.assetPath === 'string') {
  try {
    const { outPath, fileCount } = await buildHashes({
      packageRoot,
      packageName: pkg.name,
      packageVersion: pkg.version,
      assetPath: pkg.claude.assetPath,
    });
    console.log(
      `✓ claude-hashes.json written: ${fileCount} file(s) → ${outPath}`,
    );
  } catch (err) {
    console.error('❌ build-hashes failed:', err?.message ?? err);
    process.exit(1);
  }
}
```

**Notes**

- `packageRoot = process.cwd()` intentionally — this script runs via
  `yarn <shortcut> build:hashes` from the package directory.
- Same no-op behavior when `claude.assetPath` is missing.
- Emits to stdout on success (humans read it during the build).

No `chmod +x` needed — it's invoked via `node scripts/build-hashes.mjs`.

---

## Verification

Before declaring Step 1/Step 2 complete, diff against the reference:

```bash
diff packages/canard/schema-form/bin/claude-sync.mjs ${TARGET_PATH}/bin/claude-sync.mjs
diff packages/canard/schema-form/scripts/build-hashes.mjs ${TARGET_PATH}/scripts/build-hashes.mjs
```

Both diffs must be empty.
