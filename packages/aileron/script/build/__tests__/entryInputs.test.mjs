import assert from 'node:assert/strict';
import { join } from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';

import { getBundleBuildOptions } from '../rolldown.bundle.mjs';
import { getLibBuildOptions } from '../rolldown.transpile.mjs';

test('bundle and transpile give multiple entrypoints the same source-relative names', async () => {
  const directory = new URL('./fixture/', import.meta.url);
  const config = new URL('rolldown.config.mjs', directory).href;
  const options = {
    format: 'esm',
    extension: 'mjs',
    outDir: 'dist',
    entrypoints: ['./src/index.ts', 'src/sub/entry.mts'],
  };
  const expected = {
    index: join(fileURLToPath(directory), 'src/index.ts'),
    'sub/entry': join(fileURLToPath(directory), 'src/sub/entry.mts'),
  };
  const bundle = await getBundleBuildOptions(config).bundleBuildOptions(options);
  const transpile = await getLibBuildOptions(config).libBuildOptions(options);
  assert.deepEqual(bundle.input, expected);
  assert.deepEqual(transpile.input, expected);
});
