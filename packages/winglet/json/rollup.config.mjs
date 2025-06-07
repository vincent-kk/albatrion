import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import replace from '@rollup/plugin-replace';
import terser from '@rollup/plugin-terser';
import { dirname, resolve as resolvePath } from 'path';
import copy from 'rollup-plugin-copy';
import peerDepsExternal from 'rollup-plugin-peer-deps-external';
import typescript from 'rollup-plugin-typescript2';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const packagesRoot = resolvePath(__dirname, '../../');

const basePlugins = [
  peerDepsExternal(),
  resolve({
    extensions: ['.js', '.jsx', '.ts', '.tsx'],
  }),
  replace({
    preventAssignment: true,
  }),
  commonjs(),
  terser({
    compress: {
      drop_console: false,
      drop_debugger: true,
      dead_code: true,
      unused: true,
      toplevel: false,
      passes: 7,
      pure_getters: false,
      reduce_vars: true,
      reduce_funcs: true,
      hoist_funs: true,
      hoist_vars: true,
      if_return: true,
      join_vars: true,
      collapse_vars: true,
      comparisons: true,
      conditionals: true,
      evaluate: true,
      booleans: true,
      typeofs: true,
      loops: true,
      properties: true,
      sequences: true,
      side_effects: true,
      switches: true,
      arrows: true,
      arguments: true,
      keep_fargs: false,
      ecma: 2020,
      pure_funcs: ['console.log'],
    },
    mangle: {
      toplevel: false,
      eval: true,
      keep_fnames: false,
      reserved: [],
    },
    format: {
      comments: false,
      beautify: false,
      ascii_only: true,
      ecma: 2020,
    },
    ecma: 2020,
    module: true,
    keep_fnames: false,
    keep_classnames: false,
    toplevel: false,
  }),
];

const baseExternal = (path) => {
  if (path.startsWith('@aileron')) return false;
  if (path.startsWith('@winglet')) return true;
  return /node_modules/.test(path);
};

export default [
  // Main bundle
  {
    input: 'src/index.ts',
    output: [
      {
        file: 'dist/index.cjs',
        format: 'cjs',
        exports: 'named',
        sourcemap: true,
      },
      {
        file: 'dist/index.mjs',
        format: 'esm',
        exports: 'named',
        sourcemap: true,
      },
    ],
    plugins: [
      ...basePlugins,
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
      typescript({
        useTsconfigDeclarationDir: true,
        tsconfig: './tsconfig.json',
        clean: true,
        tsconfigOverride: {
          compilerOptions: {
            declaration: true,
            declarationDir: 'dist',
            emitDeclarationOnly: false,
            rootDir: 'src',
          },
          include: ['src/**/*'],
          exclude: [
            'node_modules',
            '**/__tests__/**',
            '**/*.test.tsx?',
            '**/*.spec.tsx?',
          ],
        },
      }),
    ],
    external: baseExternal,
  },
  // JSONPath subpath
  {
    input: 'src/JSONPath/index.ts',
    output: [
      {
        file: 'dist/JSONPath/index.cjs',
        format: 'cjs',
        exports: 'named',
        sourcemap: true,
      },
      {
        file: 'dist/JSONPath/index.mjs',
        format: 'esm',
        exports: 'named',
        sourcemap: true,
      },
    ],
    plugins: [
      ...basePlugins,
      typescript({
        useTsconfigDeclarationDir: true,
        tsconfig: './tsconfig.json',
        clean: false,
        tsconfigOverride: {
          compilerOptions: {
            declaration: true,
            declarationDir: 'dist/JSONPath',
            emitDeclarationOnly: false,
            rootDir: 'src',
          },
          include: ['src/JSONPath/**/*', 'src/type.ts'],
          exclude: [
            'node_modules',
            '**/__tests__/**',
            '**/*.test.tsx?',
            '**/*.spec.tsx?',
          ],
        },
      }),
    ],
    external: baseExternal,
  },
  // JSONPointer subpath
  {
    input: 'src/JSONPointer/index.ts',
    output: [
      {
        file: 'dist/JSONPointer/index.cjs',
        format: 'cjs',
        exports: 'named',
        sourcemap: true,
      },
      {
        file: 'dist/JSONPointer/index.mjs',
        format: 'esm',
        exports: 'named',
        sourcemap: true,
      },
    ],
    plugins: [
      ...basePlugins,
      typescript({
        useTsconfigDeclarationDir: true,
        tsconfig: './tsconfig.json',
        clean: false,
        tsconfigOverride: {
          compilerOptions: {
            declaration: true,
            declarationDir: 'dist/JSONPointer',
            emitDeclarationOnly: false,
            rootDir: 'src',
          },
          include: ['src/JSONPointer/**/*', 'src/type.ts'],
          exclude: [
            'node_modules',
            '**/__tests__/**',
            '**/*.test.tsx?',
            '**/*.spec.tsx?',
          ],
        },
      }),
    ],
    external: baseExternal,
  },
];
