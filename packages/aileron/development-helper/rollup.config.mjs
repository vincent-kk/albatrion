import { createRequire } from 'node:module';
import peerDepsExternal from 'rollup-plugin-peer-deps-external';

import {
  getEntrypoints,
  getLibBuildOptions,
} from '../../aileron/script/build/rollup.transpile.mjs';

const packageJson = createRequire(import.meta.url)('./package.json');

const { libBuildOptions, clearDir } = getLibBuildOptions(import.meta.url);

export default async () => {
  clearDir('dist');
  const entrypoints = getEntrypoints(packageJson);
  return [
    await libBuildOptions({
      format: 'esm',
      extension: 'mjs',
      entrypoints,
      outDir: 'dist',
      sourcemap: false,
      tsconfigCompilerOptions: {
        importHelpers: false,
      },
      plugins: {
        beforeTransform: [peerDepsExternal()],
      },
    }),
    await libBuildOptions({
      format: 'cjs',
      extension: 'cjs',
      entrypoints,
      outDir: 'dist',
      sourcemap: false,
      tsconfigCompilerOptions: {
        importHelpers: false,
      },
      plugins: {
        beforeTransform: [peerDepsExternal()],
      },
    }),
  ];
};
