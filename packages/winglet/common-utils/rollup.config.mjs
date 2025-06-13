import { createRequire } from 'node:module';

import {
  getEntrypoints,
  getLibBuildOptions,
} from '../../aileron/script/build/rollup.transpile.mjs';

const packageJson = createRequire(import.meta.url)('./package.json');

const { libBuildOptions, clearDir } = getLibBuildOptions(import.meta.url);

export default () => {
  clearDir('dist');
  const entrypoints = getEntrypoints(packageJson);
  return [
    libBuildOptions({
      format: 'esm',
      extension: 'mjs',
      entrypoints,
      outDir: 'dist',
      sourcemap: false,
    }),
    libBuildOptions({
      format: 'cjs',
      extension: 'cjs',
      entrypoints,
      outDir: 'dist',
      sourcemap: false,
    }),
  ];
};
