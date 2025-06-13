import alias from '@rollup/plugin-alias';
import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import replace from '@rollup/plugin-replace';
import { dirname, resolve as resolvePath } from 'path';
import copy from 'rollup-plugin-copy';
import esbuild from 'rollup-plugin-esbuild';
import peerDepsExternal from 'rollup-plugin-peer-deps-external';
import { fileURLToPath } from 'url';

/**
 * Common esbuild options for winglet packages (트랜스파일 + minify 통합)
 */
export const wingletEsbuildOptions = {
  target: 'es2020',
  platform: 'neutral',
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
  tsconfig: false,
  // JSX 지원 (react-utils용)
  jsx: 'automatic',
  jsxFactory: 'React.createElement',
  jsxFragment: 'React.Fragment',
};

/**
 * Create esbuild plugin for winglet packages
 */
export const createWingletEsbuildPlugin = (options = {}) => {
  const { includeReact = false, overrideEsbuildOptions = {} } = options;

  return esbuild({
    ...wingletEsbuildOptions,
    ...overrideEsbuildOptions,
    include: /\.[jt]sx?$/,
    exclude: [
      'node_modules/**',
      '**/__tests__/**',
      '**/*.test.*',
      '**/*.story.*',
      '**/*.stories.*',
    ],
    jsx: includeReact ? 'automatic' : undefined,
  });
};

/**
 * Common minify options for winglet packages
 */
export const commonMinifyOptions = {
  target: 'es2022',
  minify: true,
  minifyWhitespace: true,
  minifyIdentifiers: true,
  minifySyntax: true,
  keepNames: false,
  drop: ['debugger'],
  pure: ['console.log'],
  legalComments: 'none',
};

/**
 * Create common plugins for winglet packages with esbuild
 */
export const createCommonEsbuildPlugins = (options = {}) => {
  const {
    packageName,
    packageDir,
    includeAlias = true,
    includeReact = false,
    esbuildOptions: overrideEsbuildOptions,
  } = options;

  const __filename = fileURLToPath(import.meta.url);
  const __dirname = dirname(__filename);
  const packagesRoot = resolvePath(__dirname, '../../');

  const plugins = [];

  // Add alias plugin if needed
  if (includeAlias) {
    plugins.push(
      alias({
        entries: [
          {
            find: `@/${packageName}`,
            replacement: resolvePath(packageDir, 'src'),
          },
        ],
      }),
    );
  }

  // Add other common plugins
  plugins.push(
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
    // esbuild로 트랜스파일 + minify 통합
    createWingletEsbuildPlugin({ includeReact, overrideEsbuildOptions }),
  );

  return plugins;
};

/**
 * Create external function for winglet packages
 */
export const createExternalFunction = () => {
  return (path) => {
    if (path.startsWith('@aileron')) return false;
    if (path.startsWith('@winglet')) return true;
    return /node_modules/.test(path);
  };
};
