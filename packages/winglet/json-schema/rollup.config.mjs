import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import replace from '@rollup/plugin-replace';
import terser from '@rollup/plugin-terser';
import { readFileSync } from 'fs';
import { dirname, resolve as resolvePath } from 'path';
import copy from 'rollup-plugin-copy';
import peerDepsExternal from 'rollup-plugin-peer-deps-external';
import typescript from 'rollup-plugin-typescript2';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const packagesRoot = resolvePath(__dirname, '../../');

const packageJson = JSON.parse(
  readFileSync(resolvePath(__dirname, './package.json'), 'utf8'),
);

const createConfig = (input, outputs, copyTarget = null) => ({
  input,
  output: outputs.map((output) => ({
    ...output,
    sourcemap: true,
    exports: 'named',
  })),
  plugins: [
    peerDepsExternal(),
    resolve({
      extensions: ['.js', '.jsx', '.ts', '.tsx'],
    }),
    replace({
      preventAssignment: true,
    }),
    // Only add aileron copy plugin to the first build to avoid conflicts
    ...(input === 'src/index.ts'
      ? [
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
        ]
      : []),
    // Add specific type copying for each entry point
    ...(copyTarget
      ? [
          copy({
            targets: [copyTarget],
            hook: 'writeBundle',
            copyOnce: false,
          }),
        ]
      : []),
    commonjs(),
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
        booleans_as_integers: false,
        ecma: 2022,
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
        ecma: 2022,
      },
      ecma: 2022,
      module: true,
      keep_fnames: false,
      keep_classnames: false,
      toplevel: false,
    }),
  ],
  external: (path) => {
    if (path.startsWith('@aileron')) return false;
    if (path.startsWith('@winglet') && path !== '@winglet/react-utils')
      return true;
    return /node_modules/.test(path);
  },
});

export default [
  // Main entry point
  createConfig('src/index.ts', [
    { file: packageJson.main, format: 'cjs' },
    { file: packageJson.module, format: 'esm' },
  ]),
  // Sync entry point (scanner) - copies its own type file
  createConfig('src/utils/JsonSchemaScanner/sync/index.ts', [
    { file: 'dist/sync.cjs', format: 'cjs' },
    { file: 'dist/sync.mjs', format: 'esm' },
  ]),
  // Async entry point (async-scanner) - copies its own type file
  createConfig('src/utils/JsonSchemaScanner/async/index.ts', [
    { file: 'dist/async.cjs', format: 'cjs' },
    { file: 'dist/async.mjs', format: 'esm' },
  ]),
  // Filter entry point - no type copying needed (already at correct location)
  createConfig('src/filter.ts', [
    { file: 'dist/filter.cjs', format: 'cjs' },
    { file: 'dist/filter.mjs', format: 'esm' },
  ]),
];
