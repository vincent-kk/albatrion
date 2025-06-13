// 번들 빌드 예제 - rollup.config.bundle.mjs
import { createRequire } from 'node:module';
import peerDepsExternal from 'rollup-plugin-peer-deps-external';

import { getBundleBuildOptions } from '../../aileron/script/build/rollup.bundle.mjs';

const { bundleBuildOptions, clearDir } = getBundleBuildOptions(import.meta.url);

const packageJson = createRequire(import.meta.url)('./package.json');

const mainEntry = packageJson.exports['.'];

export default async () => {
  clearDir('dist');

  return [
    // ESM 단일 번들
    await bundleBuildOptions({
      entry: mainEntry.source,
      format: 'esm',
      outFile: mainEntry.import,
      sourcemap: false,
      minify: false,
      optimizeImports: true,
      plugins: {
        beforeTransform: [peerDepsExternal()],
      },
    }),
    // CJS 단일 번들
    await bundleBuildOptions({
      entry: mainEntry.source,
      format: 'cjs',
      outFile: mainEntry.require,
      sourcemap: false,
      minify: false,
      optimizeImports: true,
      plugins: {
        beforeTransform: [peerDepsExternal()],
      },
    }),
  ];
};
