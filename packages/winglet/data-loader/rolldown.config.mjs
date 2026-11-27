import { createRequire } from 'node:module';

import { getBundleBuildOptions } from '../../aileron/script/build/rolldown.bundle.mjs';

const { bundleBuildOptions, clearDir } = getBundleBuildOptions(import.meta.url);

const packageJSON = createRequire(import.meta.url)('./package.json');

const mainEntry = packageJSON.exports['.'];

export default async () => {
  clearDir('dist');

  return [

    await bundleBuildOptions({
      entry: mainEntry.source,
      format: 'esm',
      outFile: mainEntry.import,
      sourcemap: true,
      minify: false,
    }),

    await bundleBuildOptions({
      entry: mainEntry.source,
      format: 'cjs',
      outFile: mainEntry.require,
      sourcemap: true,
      minify: false,
    }),
  ];
};
