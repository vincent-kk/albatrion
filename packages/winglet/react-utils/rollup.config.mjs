import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import replace from '@rollup/plugin-replace';
import terser from '@rollup/plugin-terser';
import { readFileSync } from 'fs';
import { dirname, resolve as resolvePath } from 'path';
import copy from 'rollup-plugin-copy';
import peerDepsExternal from 'rollup-plugin-peer-deps-external';
import typescript from 'rollup-plugin-typescript2';
import { visualizer } from 'rollup-plugin-visualizer';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const packagesRoot = resolvePath(__dirname, '../../');

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
    },
    mangle: {
      toplevel: false,
      eval: true,
      keep_fnames: true,
      reserved: ['React', 'Component', 'useState', 'useEffect'],
    },
    format: {
      comments: false,
      beautify: false,
      ascii_only: true,
      ecma: 2020,
    },
    ecma: 2020,
    module: true,
    keep_fnames: true,
    keep_classnames: true,
    toplevel: false,
  }),
];

// Sub-exports configuration
const subExports = [
  {
    input: 'src/components/Portal/index.ts',
    output: 'dist/components/Portal/index',
  },
  { input: 'src/hoc/index.ts', output: 'dist/hoc/index' },
  { input: 'src/hooks/index.ts', output: 'dist/hooks/index' },
  { input: 'src/utils/filter/index.ts', output: 'dist/utils/filter/index' },
  { input: 'src/utils/object/index.ts', output: 'dist/utils/object/index' },
  { input: 'src/utils/render/index.ts', output: 'dist/utils/render/index' },
];

const baseExternal = (path) => {
  if (path.startsWith('@aileron')) return false;
  if (path.startsWith('@winglet') && path !== '@winglet/react-utils')
    return true;
  return /node_modules/.test(path);
};

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
        exports: 'auto',
        sourcemap: true,
      },
    ],
    external: baseExternal,
    plugins: [
      ...getCommonPlugins('src/index.ts'),
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
      visualizer({
        filename: 'react-utils-stats.html',
        gzipSize: true,
      }),
    ],
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
        exports: 'auto',
        sourcemap: true,
      },
    ],
    external: baseExternal,
    plugins: getCommonPlugins(input),
  })),
];

export default configs;
