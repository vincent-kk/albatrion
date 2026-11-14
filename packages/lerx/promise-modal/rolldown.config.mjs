import { createRequire } from 'node:module';

import { getBundleBuildOptions } from '../../aileron/script/build/rolldown.bundle.mjs';

const { bundleBuildOptions, clearDir } = getBundleBuildOptions(import.meta.url);

const packageJSON = createRequire(import.meta.url)('./package.json');

const mainEntry = packageJSON.exports['.'];

export default async () => {
  clearDir('dist');

  const bundles = [

    await bundleBuildOptions({
      entry: mainEntry.source,
      format: 'esm',
      outFile: mainEntry.import,
      sourcemap: false,
      minify: false,
    }),

    await bundleBuildOptions({
      entry: mainEntry.source,
      format: 'cjs',
      outFile: mainEntry.require,
      sourcemap: false,
      minify: false,
    }),
  ];

  return bundles.map((bundle) => ({
    ...bundle,
    output: { ...bundle.output, banner: "'use client';" },
  }));
};
