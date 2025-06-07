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

export default [
  {
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
    plugins: [
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
          drop_console: false, // Keep console methods for error handling
          drop_debugger: true,
          dead_code: true,
          unsafe: true,
          unsafe_comps: true,
          unsafe_Function: true,
          unsafe_math: true,
          unsafe_symbols: true,
          unsafe_methods: true,
          unsafe_proto: true,
          unsafe_regexp: true,
          unsafe_undefined: true,
          unused: true,
          toplevel: true,
          passes: 10,
          pure_getters: true,
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
          pure_funcs: ['console.log'], // Only remove console.log specifically
        },
        mangle: {
          toplevel: true,
          eval: true,
          keep_fnames: false,
          reserved: [],
          properties: {
            regex: /^_/,
          },
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
        toplevel: true,
      }),
    ],
    external: (path) => {
      if (path.startsWith('@aileron')) return false;
      if (path.startsWith('@winglet')) return true;
      return /node_modules/.test(path);
    },
  },
];
