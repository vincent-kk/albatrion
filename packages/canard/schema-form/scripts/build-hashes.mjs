#!/usr/bin/env node
// Thin wrapper — delegates to @slats/claude-assets-sync/buildHashes.
// Mirrors the `scripts/inject-version.js` pattern: a small, self-contained
// script invoked from package.json build chain.

import { buildHashes } from '@slats/claude-assets-sync/buildHashes';

try {
  const { outPath, fileCount } = await buildHashes();
  console.log(`✓ claude-hashes.json written: ${fileCount} file(s) → ${outPath}`);
} catch (err) {
  console.error('❌ build-hashes failed:', err?.message ?? err);
  process.exit(1);
}
