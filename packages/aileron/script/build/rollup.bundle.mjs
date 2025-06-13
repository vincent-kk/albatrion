import tsPlugin from '@rollup/plugin-typescript';
import { readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import copy from 'rollup-plugin-copy';

import { createClearDir } from './utils/createClearDir.mjs';
import { validateBundleOptions } from './utils/validateBuildOptions.mjs';

// 번들링용 external 함수
const bundleExternal = (path) => {
  // 내부 패키지는 번들에 포함
  if (path.startsWith('@aileron')) return false;
  // 다른 외부 라이브러리들은 external로 처리
  if (path.startsWith('@winglet')) return true;
  return /node_modules/.test(path);
};

export const getBundleBuildOptions = (callerUrl) => ({
  /**
   * @type {(options: {
   *   entry?: string;
   *   entrypoints?: string[];
   *   format: 'esm' | 'cjs' | 'umd' | 'iife';
   *   outFile?: string;
   *   outDir?: string;
   *   name?: string;
   *   sourcemap?: boolean;
   *   minify?: boolean | {
   *     terser?: import('terser').MinifyOptions;
   *     swc?: import('@rollup/plugin-swc').Options['minify'];
   *   };
   *   plugins?: {beforeTransform?: import('rollup').Plugin[],afterTransform?: import('rollup').Plugin[],afterBuild?: import('rollup').Plugin[]};
   *   external?: (path: string) => boolean;
   *   tsconfig?: string;
   *   tsconfigCompilerOptions?: import('typescript').CompilerOptions;
   *   optimizeImports?: boolean;
   *   analyze?: boolean;
   * }) => Promise<import('rollup').RollupOptions>}
   */
  bundleBuildOptions: createBundleBuildOptions(callerUrl),
  /**
   * @type {(dir: string) => void}
   */
  clearDir: createClearDir(callerUrl),
});

const createBundleBuildOptions = (callerUrl) => async (options) => {
  // 입력 검증
  validateBundleOptions(options);

  const {
    entry,
    entrypoints,
    format,
    outFile,
    outDir,
    name,
    sourcemap = false,
    minify = false,
    plugins,
    external,
    tsconfig,
    tsconfigCompilerOptions,
    optimizeImports = true,
    analyze = false,
  } = options;

  const callerDir = dirname(fileURLToPath(callerUrl));
  const packagesRoot = resolve(callerDir, '../../');

  // 패키지 이름 가져오기 (analyze 옵션을 위해)
  let packageName = 'bundle';
  if (analyze) {
    try {
      const packageJsonPath = join(callerDir, 'package.json');
      const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));
      packageName = packageJson.name?.replace(/[@/]/g, '') || 'bundle';
    } catch {
      console.warn(
        '⚠️  Could not read package.json, using default name "bundle"',
      );
    }
  }

  // 단일 번들링 vs 다중 엔트리포인트 처리
  const isSingleBundle = !!entry;
  const inputConfig = isSingleBundle
    ? resolve(callerDir, entry)
    : mapInputs(callerDir, entrypoints);

  // 출력 설정 검증
  if (isSingleBundle && !outFile) {
    throw new Error('outFile is required when using single entry');
  }
  if (!isSingleBundle && !outDir) {
    throw new Error('outDir is required when using multiple entrypoints');
  }

  // 동적 import를 위한 플러그인들
  const dynamicPlugins = [];

  // minify 플러그인 추가
  if (minify) {
    try {
      // Terser 플러그인 시도
      const { default: terser } = await import('@rollup/plugin-terser').catch(
        () => ({ default: null }),
      );
      if (terser) {
        const terserOptions =
          typeof minify === 'object' && minify.terser
            ? minify.terser
            : {
                compress: {
                  drop_console: true,
                  drop_debugger: true,
                  pure_funcs: ['console.log', 'console.info', 'console.debug'],
                },
                mangle: {
                  reserved: ['React', 'ReactDOM'],
                },
                format: {
                  comments: false,
                },
              };
        dynamicPlugins.push(terser(terserOptions));
      }
    } catch {
      console.warn('⚠️  Terser plugin not available, skipping minification');
    }
  }

  // Import 최적화 플러그인 추가
  if (optimizeImports) {
    try {
      // Tree-shaking을 위한 플러그인들
      const { default: nodeResolve } = await import(
        '@rollup/plugin-node-resolve'
      ).catch(() => ({ default: null }));
      const { default: commonjs } = await import(
        '@rollup/plugin-commonjs'
      ).catch(() => ({ default: null }));

      if (nodeResolve) {
        dynamicPlugins.unshift(
          nodeResolve({
            preferBuiltins: false,
            browser: format === 'umd' || format === 'iife',
          }),
        );
      }

      if (commonjs) {
        dynamicPlugins.unshift(
          commonjs({
            include: /node_modules/,
          }),
        );
      }
    } catch {
      console.warn('⚠️  Import optimization plugins not available');
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
    input: inputConfig,
    plugins: [
      ...(plugins?.beforeTransform || []),
      ...dynamicPlugins,
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
          // 중복 import 방지를 위한 모듈 해결 설정
          moduleResolution: 'bundler',
          allowSyntheticDefaultImports: true,
          esModuleInterop: true,
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
            dest: 'dist/@aileron/declare',
          },
        ],
        copyOnce: true,
        flatten: true,
      }),
      ...(plugins?.afterBuild || []),
      ...analyzePlugins, // 분석 플러그인을 마지막에 추가
    ],
    external: external || bundleExternal,
    output: isSingleBundle
      ? {
          // 단일 번들 출력
          file: resolve(callerDir, outFile),
          format,
          name: format === 'umd' || format === 'iife' ? name : undefined,
          sourcemap,
          // 번들링 최적화 옵션
          compact: !!minify,
          // 중복 import 제거
          hoistTransitiveImports: false,
          generatedCode: {
            constBindings: true,
            arrowFunctions: true,
            objectShorthand: true,
          },
          // React JSX 런타임 최적화
          ...(format === 'esm' && {
            interop: 'auto',
            externalLiveBindings: false,
            freeze: false,
          }),
        }
      : {
          // 다중 엔트리포인트 출력
          format,
          dir: outDir,
          name: format === 'umd' || format === 'iife' ? name : undefined,
          sourcemap,
          preserveModules: true,
          preserveModulesRoot: 'src',
          // 번들링 최적화 옵션
          compact: !!minify,
          generatedCode: {
            constBindings: true,
            arrowFunctions: true,
            objectShorthand: true,
          },
          // React JSX 런타임 최적화
          ...(format === 'esm' && {
            interop: 'auto',
            externalLiveBindings: false,
            freeze: false,
          }),
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
