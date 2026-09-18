import { createRequire } from 'node:module';

import {
  getEntrypoints,
  getLibBuildOptions,
} from '../../aileron/script/build/rolldown.transpile.mjs';

const packageJSON = createRequire(import.meta.url)('./package.json');

const { libBuildOptions, clearDir } = getLibBuildOptions(import.meta.url);

export default async () => {
  clearDir('dist');
  const entrypoints = getEntrypoints(packageJSON);
  return [
    await libBuildOptions({
      format: 'esm',
      extension: 'mjs',
      entrypoints,
      outDir: 'dist',
      sourcemap: false,
    }),
    await libBuildOptions({
      format: 'cjs',
      extension: 'cjs',
      entrypoints,
      outDir: 'dist',
      sourcemap: false,
    }),
  ];
};
