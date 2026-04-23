#!/usr/bin/env node
// Thin wrapper — delegates to @slats/claude-assets-sync/cli.
// Intentionally self-contained so it runs without a build step.

import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { program } from '@slats/claude-assets-sync/cli';

const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const pkg = JSON.parse(
  readFileSync(resolve(packageRoot, 'package.json'), 'utf-8'),
);

program({
  packageName: pkg.name,
  packageVersion: pkg.version,
  packageRoot,
}).catch((err) => {
  process.stderr.write(
    `[${pkg.name}] inject-docs failed: ${err instanceof Error ? err.message : String(err)}\n`,
  );
  process.exit(1);
});
