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
            '**/coverage/**',
            '**/*.test.tsx?',
            '**/*.spec.tsx?',
            '**/*.story.tsx',
            '**/*.stories.tsx',
          ],
        },
      }),
      terser({
        compress: {
          drop_console: false,
          dead_code: true,
          passes: 7,
          pure_getters: false,
          keep_fargs: false,
          hoist_funs: true,
          hoist_vars: true,
        },
        mangle: {
          toplevel: false,
          keep_fnames: true,
          keep_classnames: true,
          reserved: ['React', 'Component', 'useState', 'useEffect'],
        },
        output: {
          comments: false,
        },
        ecma: 2022,
      }),
      visualizer({
        filename: 'schema-form-antd-plugin-stats.html',
        gzipSize: true,
      }),
    ],
    external: (path) => {
      if (path.startsWith('@aileron')) return false;
      if (path.startsWith('@winglet')) return true;
      return /node_modules/.test(path);
    },
  },
];
