#!/usr/bin/env node
// Library + CLI mode for the hash manifest builder.
//
// CLI mode: `claude-build-hashes` (registered as bin in this package's
// package.json). Reads the CONSUMER's package.json from `process.cwd()`,
// hashes files under `<cwd>/<claude.assetPath ?? docs/claude>`, writes
// `<cwd>/dist/claude-hashes.json`. Mirrors `scripts/inject-version.js`.
//
// Library mode: `import { buildHashes } from '@slats/claude-assets-sync/buildHashes'`.

import { createHash } from 'node:crypto';
import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import { join, relative, resolve, sep } from 'node:path';

const MANIFEST_FILENAME = 'claude-hashes.json';
const NOISE = [/(^|\/)\.omc(\/|$)/, /(^|\/)\.DS_Store$/, /\.log$/];

const toPosix = (p) => (sep === '/' ? p : p.split(sep).join('/'));

async function* walk(root) {
  let entries;
  try {
    entries = await readdir(root, { withFileTypes: true });
  } catch (err) {
    if (err.code === 'ENOENT') return;
    throw err;
  }
  for (const entry of entries) {
    const abs = join(root, entry.name);
    if (entry.isDirectory()) yield* walk(abs);
    else if (entry.isFile()) yield abs;
  }
}

export async function buildHashes(opts = {}) {
  const packageRoot = opts.packageRoot ?? process.cwd();
  const pkg = JSON.parse(
    await readFile(resolve(packageRoot, 'package.json'), 'utf-8'),
  );
  const assetPathRel =
    opts.assetPathRel ?? pkg.claude?.assetPath ?? 'docs/claude';
  const assetRoot = resolve(packageRoot, assetPathRel);
  const files = {};
  for await (const abs of walk(assetRoot)) {
    const rel = toPosix(relative(assetRoot, abs));
    if (NOISE.some((re) => re.test(rel))) continue;
    const buf = await readFile(abs);
    files[rel] = createHash('sha256').update(buf).digest('hex');
  }
  const sorted = Object.fromEntries(
    Object.entries(files).sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0)),
  );
  const manifest = {
    schemaVersion: 1,
    package: {
      name: opts.packageName ?? pkg.name,
      version: opts.packageVersion ?? pkg.version,
    },
    generatedAt: new Date().toISOString(),
    algorithm: 'sha256',
    assetRoot: assetPathRel,
    files: sorted,
    previousVersions: {},
  };
  const distDir = resolve(packageRoot, 'dist');
  await mkdir(distDir, { recursive: true });
  const outPath = join(distDir, MANIFEST_FILENAME);
  await writeFile(outPath, `${JSON.stringify(manifest, null, 2)}\n`, 'utf-8');
  return { outPath, fileCount: Object.keys(sorted).length };
}

// Self-executing CLI mode.
const isDirectRun = import.meta.url === `file://${process.argv[1]}`;
if (isDirectRun) {
  try {
    const { outPath, fileCount } = await buildHashes();
    console.log(`✓ claude-hashes.json written: ${fileCount} file(s) → ${outPath}`);
  } catch (err) {
    console.error('❌ buildHashes failed:', err?.message ?? err);
    process.exit(1);
  }
}
