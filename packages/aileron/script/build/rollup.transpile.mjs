import tsPlugin from '@rollup/plugin-typescript';
import { readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import copy from 'rollup-plugin-copy';

import { createClearDir } from './utils/createClearDir.mjs';
import {
  applyDefaultBuildOptions,
  validateBuildOptions,
} from './utils/validateBuildOptions.mjs';

export { getEntrypoints } from './utils/getEntrypoints.mjs';

const baseExternal = (path) => {
  if (path.startsWith('@aileron')) return false;
  if (path.startsWith('@winglet') && path !== '@winglet/react-utils')
    return true;
  return /node_modules/.test(path);
};

export const getLibBuildOptions = (callerUrl) => ({
  /**
   * @type {(options: {
   *   entrypoints: string[];
   *   format: 'esm' | 'cjs';
   *   extension: 'js' | 'cjs' | 'mjs';
   *   outDir: string;
   *   sourcemap?: boolean;
   *   plugins?: {beforeTransform?: import('rollup').Plugin[],afterTransform?: import('rollup').Plugin[],afterBuild?: import('rollup').Plugin[]};
   *   external?: (path: string) => boolean;
   *   tsconfig?: string;
   *   tsconfigCompilerOptions?: import('typescript').CompilerOptions;
   *   analyze?: boolean;
   * }) => Promise<import('rollup').RollupOptions>}
   */
  libBuildOptions: createLibBuildOptions(callerUrl),
  /**
   * @type {(dir: string) => void}
   */
  clearDir: createClearDir(callerUrl),
});

const createLibBuildOptions = (callerUrl) => async (options) => {
  // 입력 검증
  validateBuildOptions(options);

  // 기본값 적용
  const normalizedOptions = applyDefaultBuildOptions(options);

  const {
    entrypoints,
    extension,
    format,
    outDir,
    sourcemap,
    plugins,
    external,
    tsconfig,
    tsconfigCompilerOptions,
    analyze = false,
  } = normalizedOptions;

  const callerDir = dirname(fileURLToPath(callerUrl));
  const packagesRoot = resolve(callerDir, '../../');

  // 패키지 이름 가져오기 (analyze 옵션을 위해)
  let packageName = 'lib';
  if (analyze) {
    try {
      const packageJsonPath = join(callerDir, 'package.json');
      const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));
      packageName = packageJson.name?.replace(/[@/]/g, '') || 'lib';
    } catch {
      console.warn('⚠️  Could not read package.json, using default name "lib"');
    }
  }

  // Analyze 플러그인 추가 (마지막에 실행)
  const analyzePlugins = [];
  if (analyze) {
    try {
      const { visualizer } = await import('rollup-plugin-visualizer').catch(
        () => ({ visualizer: null }),
      );
      if (visualizer) {
        analyzePlugins.push(
          visualizer({
            filename: `${packageName}-stats.html`,
            gzipSize: true,
            brotliSize: true,
            open: false,
          }),
        );
        console.log(
          `📊 Bundle analysis will be saved to ${packageName}-stats.html`,
        );
      } else {
        console.warn(
          '⚠️  rollup-plugin-visualizer not available, skipping analysis',
        );
      }
    } catch {
      console.warn(
        '⚠️  rollup-plugin-visualizer not available, skipping analysis',
      );
    }
  }

  return {
    input: mapInputs(callerDir, entrypoints),
    plugins: [
      ...(plugins?.beforeTransform || []),
      tsPlugin({
        tsconfig: tsconfig || join(callerDir, 'tsconfig.json'),
        compilerOptions: {
          declarationMap: false,
          declaration: false,
          composite: false,
          ...tsconfigCompilerOptions,
          sourceMap: sourcemap,
          inlineSources: sourcemap || undefined,
          removeComments: !sourcemap,
        },
        include: ['src/**/*'],
        exclude: [
          'node_modules',
          '**/__tests__/**',
          '**/coverage/**',
          '**/*.test.tsx?',
          '**/*.spec.tsx?',
          '**/*.story.tsx?',
          '**/*.stories.tsx?',
        ],
      }),
      ...(plugins?.afterTransform || []),
      copy({
        targets: [
          {
            src: resolve(packagesRoot, 'aileron/common/**/*.d.ts'),
            dest: `${outDir}/@aileron/declare`,
          },
        ],
        copyOnce: true,
        flatten: true,
      }),
      ...(plugins?.afterBuild || []),
      ...analyzePlugins, // 분석 플러그인을 마지막에 추가
    ],
    external: external || baseExternal,
    output: {
      format,
      dir: outDir,
      ...fileNames(extension),
      preserveModules: true,
      preserveModulesRoot: 'src',
      sourcemap,
      hoistTransitiveImports: false,
    },
  };
};

/** @type {(srcFiles: string[]) => Record<string, string>} */
const mapInputs = (dirName, srcFiles) => {
  if (!srcFiles || srcFiles.length === 0) {
    throw new Error('No source files provided');
  }

  return Object.fromEntries(
    srcFiles.map((file) => [
      file.replace(/^(\.\/)?src\//, '').replace(/\.[cm]?(js|ts)$/, ''),
      join(dirName, file),
    ]),
  );
};

/** @type {(extension?: string) => {entryFileNames: string, chunkFileNames: string}} */
const fileNames = (extension = 'js') => ({
  entryFileNames: `[name].${extension}`,
  chunkFileNames: `chunk/[name]-[hash:6].${extension}`,
});
