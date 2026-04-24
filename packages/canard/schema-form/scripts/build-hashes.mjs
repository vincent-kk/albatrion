#!/usr/bin/env node
// Thin wrapper — parses this package's package.json and delegates to
// @slats/claude-assets-sync/buildHashes. The `claude.assetPath` convention
// lives here, in the consumer; the library is generic.
import { buildHashes } from '@slats/claude-assets-sync/buildHashes';
import { readFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
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
