import { createRequire } from 'node:module';

import { getBundleBuildOptions } from '../../aileron/script/build/rolldown.bundle.mjs';
import {
  DEVELOPMENT_FLAG_LINE,
  developmentFlag,
} from './scripts/developmentFlag.mjs';

const { bundleBuildOptions, clearDir } = getBundleBuildOptions(import.meta.url);

const packageJSON = createRequire(import.meta.url)('./package.json');

const mainEntry = packageJSON.exports['.'];

export default async () => {
  clearDir('dist');

  const cjs = await bundleBuildOptions({
    entry: mainEntry.source,
    format: 'cjs',
    outFile: mainEntry.require,
    sourcemap: false,
    minify: false,
  });
  const node = await bundleBuildOptions({
    entry: mainEntry.source,
    format: 'esm',
    outFile: mainEntry.node.import,
    sourcemap: false,
    minify: false,
  });

  return [
    // ESM 단일 번들
    await bundleBuildOptions({
      entry: mainEntry.source,
      format: 'esm',
      outFile: mainEntry.import,
      sourcemap: false,
      minify: false,
    }),
    {
      ...cjs,
      plugins: [...cjs.plugins, developmentFlag()],
      output: { ...cjs.output, intro: DEVELOPMENT_FLAG_LINE },
    },
    {
      ...node,
      plugins: [...node.plugins, developmentFlag()],
      output: { ...node.output, banner: DEVELOPMENT_FLAG_LINE },
    },
  ];
};
