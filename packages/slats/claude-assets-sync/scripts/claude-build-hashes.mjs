#!/usr/bin/env node
// Standalone CLI bin for `claude-build-hashes`. Reads the consumer's
// package.json from process.cwd() and writes dist/claude-hashes.json.
// Pure Node ESM with top-level await — NOT bundled by Rollup.
import { buildHashes } from './buildHashes.mjs';

try {
  const { outPath, fileCount } = await buildHashes();
  console.log(`✓ claude-hashes.json written: ${fileCount} file(s) → ${outPath}`);
} catch (err) {
  console.error('❌ buildHashes failed:', err?.message ?? err);
  process.exit(1);
}
