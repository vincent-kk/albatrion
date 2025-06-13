// 번들 빌드 예제 - rollup.config.bundle.mjs
import { createRequire } from 'node:module';

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
      sourcemap: true,
      minify: false,
      optimizeImports: true,
    }),
    // CJS 단일 번들
    await bundleBuildOptions({
      entry: mainEntry.source,
      format: 'cjs',
      outFile: mainEntry.require,
      sourcemap: true,
      minify: false,
      optimizeImports: true,
    }),
  ];
};
