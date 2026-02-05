import { createRequire } from 'node:module';

import {
  getEntrypoints,
  getLibBuildOptions,
} from '../../aileron/script/build/rollup.transpile.mjs';

const packageJson = createRequire(import.meta.url)('./package.json');

const { libBuildOptions, clearDir } = getLibBuildOptions(import.meta.url);

export default async () => {
  clearDir('dist');
  const entrypoints = getEntrypoints(packageJson);

  // CLI entrypoint 추가
  const cliEntry = './src/cli.ts';

  // ESM 빌드 설정 - CLI만 shebang 추가
  const esmConfig = await libBuildOptions({
    format: 'esm',
    extension: 'mjs',
    entrypoints: [...entrypoints, cliEntry], // CLI 추가
    outDir: 'dist',
    sourcemap: false,
  });

  // CLI 파일에만 shebang 추가
  esmConfig.output.banner = (chunk) => {
    return chunk.fileName === 'cli.mjs' ? '#!/usr/bin/env node' : '';
  };

  // CJS 빌드 설정 - shebang 없음
  const cjsConfig = await libBuildOptions({
    format: 'cjs',
    extension: 'cjs',
    entrypoints: [...entrypoints, cliEntry], // CLI 추가
    outDir: 'dist',
    sourcemap: false,
  });

  return [esmConfig, cjsConfig];
};
