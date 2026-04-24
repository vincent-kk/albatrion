#!/usr/bin/env node
import { runCli } from '@slats/claude-assets-sync';
import { readFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const pkg = JSON.parse(
  await readFile(resolve(packageRoot, 'package.json'), 'utf-8'),
);

if (typeof pkg.claude?.assetPath !== 'string') {
  process.stderr.write(
    `[claude-sync] missing or invalid "claude.assetPath" in ${resolve(packageRoot, 'package.json')}\n`,
  );
  process.exit(2);
}
await runCli(process.argv, {
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
