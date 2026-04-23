// Standalone dev bin — used when developing this package directly, and also
// the entry point that serves the legacy deprecation stubs (sync, add, list, …).
// Real consumers should call `program` via their own `bin/inject-docs.mjs` wrapper.
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { program } from './program.js';

const cwd = process.cwd();

function readOptionalPackage(): { name?: string; version?: string } {
  try {
    return JSON.parse(readFileSync(resolve(cwd, 'package.json'), 'utf-8'));
  } catch {
    return {};
  }
}

const pkg = readOptionalPackage();

program({
  packageName: pkg.name ?? '@slats/claude-assets-sync',
  packageVersion: pkg.version ?? '0.2.0',
  packageRoot: cwd,
}).catch((err) => {
  process.stderr.write(
    `[claude-assets-sync] ${err instanceof Error ? err.message : String(err)}\n`,
  );
  process.exit(1);
});
