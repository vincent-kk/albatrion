import alias from '@rollup/plugin-alias';
import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import replace from '@rollup/plugin-replace';
import { dirname, resolve as resolvePath } from 'path';
import copy from 'rollup-plugin-copy';
import esbuild from 'rollup-plugin-esbuild';
import peerDepsExternal from 'rollup-plugin-peer-deps-external';
import { visualizer } from 'rollup-plugin-visualizer';
import { fileURLToPath } from 'url';

/**
 * Common esbuild options for canard packages (트랜스파일 + minify 통합)
 */
export const canardEsbuildOptions = {
  target: 'es2022',
  platform: 'browser',
  minify: true,
  minifyWhitespace: true,
  minifyIdentifiers: true,
  minifySyntax: true,
  keepNames: false,
  drop: ['debugger'],
  pure: ['console.log'],
  legalComments: 'none',
  sourcemap: true,
  // TypeScript 지원
  tsconfig: false, // 자동 tsconfig 로딩 비활성화
  // JSX 지원
  jsx: 'automatic',
  jsxFactory: 'React.createElement',
  jsxFragment: 'React.Fragment',
};

/**
 * React-specific esbuild options
 */
export const reactEsbuildOptions = {
  ...canardEsbuildOptions,
  keepNames: true,
  jsx: 'automatic',
  jsxDev: false,
};

/**
 * Create esbuild plugin for canard packages
 */
export const createCanardEsbuildPlugin = (options = {}) => {
  const { includeReact = false, overrideEsbuildOptions = {} } = options;

  return esbuild({
    ...(includeReact ? reactEsbuildOptions : canardEsbuildOptions),
    ...overrideEsbuildOptions,
    include: /\.[jt]sx?$/,
    exclude: [
      'node_modules/**',
      '**/__tests__/**',
      '**/*.test.*',
      '**/*.story.*',
      '**/*.stories.*',
    ],
  });
};

/**
 * Create common plugins for canard packages (esbuild 통합 버전)
 */
export const createCanardEsbuildPlugins = (options = {}) => {
  const {
    packageName,
    packageDir,
    includeReact = false,
    includeVisualizer = false,
    esbuildOptions: overrideEsbuildOptions = {},
  } = options;

  const __dirname = packageDir || dirname(fileURLToPath(import.meta.url));
  const packagesRoot = resolvePath(__dirname, '../../');

  const plugins = [
    // Add alias plugin to resolve internal paths
    alias({
      entries: [
        {
          find: `@/${packageName}`,
          replacement: resolvePath(__dirname, 'src'),
        },
        {
          find: `@/${packageName}/`,
          replacement: resolvePath(__dirname, 'src/'),
        },
      ],
    }),
    peerDepsExternal(),
    resolve({
      extensions: ['.js', '.jsx', '.ts', '.tsx'],
    }),
    replace({
      preventAssignment: true,
    }),
    copy({
      targets: [
        {
          src: resolvePath(packagesRoot, 'aileron/common/**/*.d.ts'),
          dest: 'dist/@aileron/declare',
        },
      ],
      copyOnce: true,
      flatten: true,
    }),
    commonjs(),
    // babel 대신 esbuild 사용 (트랜스파일 + minify 통합)
    createCanardEsbuildPlugin({ includeReact, overrideEsbuildOptions }),
  ];

  if (includeVisualizer) {
    plugins.push(
      visualizer({
        filename: `${packageName}-stats.html`,
        gzipSize: true,
      }),
    );
  }

  return plugins;
};

/**
 * Create canard external function
 */
export const createCanardExternal = () => {
  return (path) => {
    if (path.startsWith('@aileron')) return false;
    if (path.startsWith('@winglet')) return true;
    return /node_modules/.test(path);
  };
};

/**
 * Create simple canard rollup config with esbuild
 */
export const createSimpleCanardEsbuildConfig = (options = {}) => {
  const {
    packageDir,
    packageJson,
    includeReact = false,
    includeVisualizer = false,
    packageName,
  } = options;

  const config = {
    input: 'src/index.ts',
    output: [
      {
        file: packageJson.main,
        format: 'cjs',
        exports: 'named',
        sourcemap: true,
      },
      {
        file: packageJson.module,
        format: 'esm',
        exports: 'named',
        sourcemap: true,
      },
    ],
    external: createCanardExternal(),
    plugins: createCanardEsbuildPlugins({
      packageName,
      packageDir,
      includeReact,
      includeVisualizer,
    }),
  };

  return config;
};
