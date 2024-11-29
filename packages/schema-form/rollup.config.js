const resolve = require('@rollup/plugin-node-resolve');
const commonjs = require('@rollup/plugin-commonjs');
const peerDepsExternal = require('rollup-plugin-peer-deps-external');
const { terser } = require('rollup-plugin-terser');
const typescript = require('rollup-plugin-typescript2');
const postcss = require('rollup-plugin-postcss');
const autoprefixer = require('autoprefixer');
const cssnano = require('cssnano');
const copy = require('rollup-plugin-copy');

const packageJson = require('./package.json');

module.exports = [
  {
    input: 'src/index.ts',
    output: [
      {
        file: packageJson.main,
        format: 'cjs',
        sourcemap: true,
      },
      {
        file: packageJson.module,
        format: 'es',
        sourcemap: true,
      },
    ],
    plugins: [
      peerDepsExternal(),
      resolve({
        extensions: ['.js', '.jsx', '.ts', '.tsx'],
      }),
      postcss({
        plugins: [autoprefixer(), cssnano({ preset: 'default' })],
        minimize: true,
        sourceMap: true,
        modules: {
          generateScopedName: '[name]__[local]___[hash:base64:5]',
        },
      }),
      copy({
        targets: [
          {
            src: '@types/**/*.d.ts',
            dest: 'dist/@types',
          },
        ],
        flatten: false,
      }),
      commonjs(),
      typescript({
        useTsconfigDeclarationDir: true,
        tsconfig: './tsconfig.json',
        clean: true,
        tsconfigOverride: {
          compilerOptions: {
            declaration: true,
            declarationDir: 'dist/@types',
            emitDeclarationOnly: false,
          },
          include: ['src/**/*'],
          exclude: [
            'node_modules',
            '**/*.test.ts',
            '**/*.test.tsx',
            '**/*.story.tsx',
            '**/*.stories.tsx',
          ],
        },
      }),
      terser(),
    ],
    external: ['react', 'react-dom'],
  },
];
