// Library + importable implementation for the hash manifest builder.
//
// Self-executing CLI behavior lives in `./claude-build-hashes.mjs` so this
// file stays free of top-level await and can be bundled into CJS/ESM outputs
// via Rollup without format errors.
//
// Exported for:
//   - Consumer packages: `import { buildHashes } from '@slats/claude-assets-sync/buildHashes'`
//   - Standalone bin: `./claude-build-hashes.mjs`
//
// The caller owns all package metadata. This function does not read
// package.json — consumers parse their own manifest and pass a ready-made
// set of values so the library stays free of field-shape assumptions.

import { createHash } from 'node:crypto';
import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import { isAbsolute, join, relative, resolve, sep } from 'node:path';

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

export async function buildHashes(opts) {
  if (
    !opts ||
    typeof opts.packageRoot !== 'string' ||
    typeof opts.packageName !== 'string' ||
    typeof opts.packageVersion !== 'string' ||
    typeof opts.assetPath !== 'string'
  ) {
    throw new Error(
      'buildHashes requires { packageRoot, packageName, packageVersion, assetPath }.',
    );
  }
  const { packageRoot, packageName, packageVersion, assetPath } = opts;
  if (!isAbsolute(packageRoot)) {
    throw new Error(
      `packageRoot must be an absolute path; received: ${packageRoot}`,
    );
  }
  const assetRoot = resolve(packageRoot, assetPath);
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
    package: { name: packageName, version: packageVersion },
    generatedAt: new Date().toISOString(),
    algorithm: 'sha256',
    assetRoot: assetPath,
    files: sorted,
    previousVersions: {},
  };
  const distDir = resolve(packageRoot, 'dist');
  await mkdir(distDir, { recursive: true });
  const outPath = join(distDir, MANIFEST_FILENAME);
  await writeFile(outPath, `${JSON.stringify(manifest, null, 2)}\n`, 'utf-8');
  return { outPath, fileCount: Object.keys(sorted).length };
}
