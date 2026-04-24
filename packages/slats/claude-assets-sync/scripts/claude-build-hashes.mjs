#!/usr/bin/env node
// Standalone CLI for `claude-build-hashes`.
//
// Reads the consumer's package.json at process.cwd() to extract the asset
// path, then delegates to `buildHashes`. Consumers who want a different
// manifest layout can skip this bin and ship a one-line
// `scripts/build-hashes.mjs` that calls `buildHashes` directly with their
// own parsed values.
//
// Convention: `pkg.claude?.assetPath` with a fallback of `'claude'`.
// This convention is purely consumer-side — the library itself enforces
// nothing about package.json shape.
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

import { buildHashes } from './buildHashes.mjs';

try {
  const packageRoot = process.cwd();
  const pkg = JSON.parse(
    await readFile(resolve(packageRoot, 'package.json'), 'utf-8'),
  );
  if (typeof pkg.name !== 'string' || typeof pkg.version !== 'string') {
    throw new Error(
      `${packageRoot}/package.json must define "name" and "version".`,
    );
  }
  const assetPath =
    typeof pkg.claude?.assetPath === 'string' && pkg.claude.assetPath.length > 0
      ? pkg.claude.assetPath
      : 'claude';
  const { outPath, fileCount } = await buildHashes({
    packageRoot,
    packageName: pkg.name,
    packageVersion: pkg.version,
    assetPath,
  });
  console.log(`✓ claude-hashes.json written: ${fileCount} file(s) → ${outPath}`);
} catch (err) {
  console.error('❌ buildHashes failed:', err?.message ?? err);
  process.exit(1);
}
