// Run with `node --test packages/aileron/script/build/__tests__/nodeEnv.test.mjs` from the repository root; builds a fixture package through both build shapes.
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import {
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { after, before, test } from 'node:test';
import { pathToFileURL } from 'node:url';
import { rolldown } from 'rolldown';

import { getBundleBuildOptions } from '../rolldown.bundle.mjs';
import { getLibBuildOptions } from '../rolldown.transpile.mjs';

/** Fixture source: two reads of `process.env.NODE_ENV`, one of them guarding a development-only branch. */
const SOURCE = `export const mode = () => process.env.NODE_ENV;
export const branch = process.env.NODE_ENV === 'production' ? 'production' : 'development';
`;

/** Count the `process.env.NODE_ENV` reads left in emitted code. */
const countReads = (code) =>
  (code.match(/process\.env\.NODE_ENV/g) || []).length;

/** Evaluate an emitted file in a fresh Node process with the given NODE_ENV and return its `branch` export. */
const branchUnder = (file, nodeEnv) => {
  const run = spawnSync(
    process.execPath,
    [
      '--input-type=module',
      '-e',
      `const m = await import(${JSON.stringify(pathToFileURL(file).href)}); process.stdout.write(m.branch);`,
    ],
    { encoding: 'utf8', env: { ...process.env, NODE_ENV: nodeEnv } },
  );
  assert.equal(run.status, 0, run.stderr);
  return run.stdout;
};

/** Build one rolldown option set produced by a build-shape factory. */
const build = async ({ output, ...input }) => {
  const bundle = await rolldown(input);
  await bundle.write(output);
  await bundle.close();
};

let root;
let packageDir;
before(() => {
  root = mkdtempSync(join(tmpdir(), 'aileron-build-node-env-'));
  packageDir = join(root, 'scope', 'fixture');
  mkdirSync(join(packageDir, 'src'), { recursive: true });
  writeFileSync(join(packageDir, 'src', 'index.ts'), SOURCE);
  writeFileSync(
    join(packageDir, 'tsconfig.json'),
    JSON.stringify({ compilerOptions: { target: 'es2020', module: 'esnext' } }),
  );
});
after(() => rmSync(root, { recursive: true, force: true }));

/** Assert both formats keep every read and pick the branch at load time. */
const assertRuntimeNodeEnv = (esmFile, cjsFile) => {
  for (const file of [esmFile, cjsFile]) {
    assert.equal(
      countReads(readFileSync(file, 'utf8')),
      countReads(SOURCE),
      file,
    );
    assert.equal(branchUnder(file, 'production'), 'production', file);
    assert.equal(branchUnder(file, 'development'), 'development', file);
  }
};

test('the bundle shape leaves process.env.NODE_ENV to the consumer in ESM and CJS', async () => {
  const { bundleBuildOptions } = getBundleBuildOptions(
    pathToFileURL(join(packageDir, 'rolldown.config.mjs')).href,
  );
  for (const [format, outFile] of [
    ['esm', 'bundle/index.mjs'],
    ['cjs', 'bundle/index.cjs'],
  ])
    await build(
      await bundleBuildOptions({ entry: 'src/index.ts', format, outFile }),
    );
  assertRuntimeNodeEnv(
    join(packageDir, 'bundle/index.mjs'),
    join(packageDir, 'bundle/index.cjs'),
  );
});

test('the transpile shape leaves process.env.NODE_ENV to the consumer in ESM and CJS', async () => {
  const { libBuildOptions } = getLibBuildOptions(
    pathToFileURL(join(packageDir, 'rolldown.config.mjs')).href,
  );
  for (const [format, extension] of [
    ['esm', 'mjs'],
    ['cjs', 'cjs'],
  ])
    await build(
      await libBuildOptions({
        format,
        extension,
        entrypoints: ['src/index.ts'],
        outDir: join(packageDir, 'lib'),
      }),
    );
  assertRuntimeNodeEnv(
    join(packageDir, 'lib/index.mjs'),
    join(packageDir, 'lib/index.cjs'),
  );
});
