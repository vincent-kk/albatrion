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
            baseUrl: '.',
          },
          include: ['src/**/*', '../@types/**/*'],
          exclude: [
            'node_modules',
            '**/tests/**',
            '**/*.test.tsx?',
            '**/*.spec.tsx?',
          ],
        },
      }),
      terser({
        compress: {
          drop_console: false,
          dead_code: true,
          passes: 5,
        },
        output: {
          comments: true,
        },
      }),
    ],
    external: (path) => /node_modules/.test(path),
  },
];
