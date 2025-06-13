// 번들 빌드 예제 - rollup.config.bundle.mjs
import {
  getBundleBuildOptions,
  getEntrypoints,
} from '../../aileron/script/build/rollup.bundle.mjs';

const packageJson = createRequire(import.meta.url)('./package.json');

const { bundleBuildOptions, clearDir } = getBundleBuildOptions(import.meta.url);

export default () => {
  clearDir('dist');
  const entrypoints = getEntrypoints(packageJson);
  return [
    bundleBuildOptions({
      entrypoints,
      format: 'esm',
      outDir: 'dist',
      sourcemap: true,
      minify: true,
      optimizeImports: true,
    }),
    bundleBuildOptions({
      entrypoints,
      format: 'cjs',
      outDir: 'dist',
      sourcemap: true,
      minify: true,
      optimizeImports: true,
    }),
  ];
};
