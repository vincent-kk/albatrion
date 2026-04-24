import { createRequire } from 'node:module';

import {
  getEntrypoints,
  getLibBuildOptions,
} from '../../aileron/script/build/rollup.transpile.mjs';

const packageJson = createRequire(import.meta.url)('./package.json');

const { libBuildOptions, clearDir } = getLibBuildOptions(import.meta.url);

const JSX_OPTIONS = { jsx: 'react-jsx' };

export default async () => {
  clearDir('dist');
  const entrypoints = getEntrypoints(packageJson);

  const esmConfig = await libBuildOptions({
    format: 'esm',
    extension: 'mjs',
    entrypoints,
    outDir: 'dist',
    sourcemap: false,
    tsconfigCompilerOptions: JSX_OPTIONS,
  });

  return [esmConfig];
};
