import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import replace from '@rollup/plugin-replace';
import terser from '@rollup/plugin-terser';
import { readFileSync } from 'fs';
import { dirname, resolve as resolvePath } from 'path';
import peerDepsExternal from 'rollup-plugin-peer-deps-external';
import typescript from 'rollup-plugin-typescript2';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const packageJson = JSON.parse(
  readFileSync(resolvePath(__dirname, './package.json'), 'utf8'),
);

// Common plugins configuration
const getCommonPlugins = (input, outputDir = 'dist') => [
  peerDepsExternal(),
  resolve({
    extensions: ['.js', '.jsx', '.ts', '.tsx'],
  }),
  replace({
    preventAssignment: true,
  }),
  commonjs(),
  typescript({
    useTsconfigDeclarationDir: true,
    tsconfig: './tsconfig.json',
    clean: true,
    tsconfigOverride: {
      compilerOptions: {
        declaration: true,
        declarationDir: outputDir,
        emitDeclarationOnly: false,
        rootDir: 'src',
      },
      include: ['src/**/*'],
      exclude: [
        'node_modules',
        '**/__tests__/**',
        '**/*.test.ts',
        '**/*.spec.ts',
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

// Sub-exports configuration
const subExports = [
  // Core directories
  { input: 'src/libs/index.ts', output: 'dist/libs/index' },
  { input: 'src/errors/index.ts', output: 'dist/errors/index' },
  { input: 'src/constant/index.ts', output: 'dist/constant/index' },

  // Utils directories
  { input: 'src/utils/filter/index.ts', output: 'dist/utils/filter/index' },
  { input: 'src/utils/array/index.ts', output: 'dist/utils/array/index' },
  { input: 'src/utils/console/index.ts', output: 'dist/utils/console/index' },
  { input: 'src/utils/convert/index.ts', output: 'dist/utils/convert/index' },
  { input: 'src/utils/function/index.ts', output: 'dist/utils/function/index' },
  { input: 'src/utils/hash/index.ts', output: 'dist/utils/hash/index' },
  { input: 'src/utils/object/index.ts', output: 'dist/utils/object/index' },
  { input: 'src/utils/promise/index.ts', output: 'dist/utils/promise/index' },
  {
    input: 'src/utils/scheduler/index.ts',
    output: 'dist/utils/scheduler/index',
  },
];

// Create configurations for all exports (main + sub-exports)
const configs = [
  // Main export
  {
    input: 'src/index.ts',
    output: [
      {
        file: packageJson.main,
        format: 'cjs',
        exports: 'auto',
        sourcemap: true,
      },
      {
        file: packageJson.module,
        format: 'esm',
        sourcemap: true,
      },
    ],
    external: [],
    plugins: getCommonPlugins('src/index.ts'),
  },

  // Sub-exports
  ...subExports.map(({ input, output }) => ({
    input,
    output: [
      {
        file: `${output}.cjs`,
        format: 'cjs',
        exports: 'auto',
        sourcemap: true,
      },
      {
        file: `${output}.mjs`,
        format: 'esm',
        sourcemap: true,
      },
    ],
    external: [],
    plugins: getCommonPlugins(input),
  })),
];

export default configs;
