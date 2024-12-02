// NOTE: 1. rollup-plugin-peer-deps-external is used to externalize peer dependencies
const peerDepsExternal = require('rollup-plugin-peer-deps-external');

// NOTE: 2. @rollup/plugin-node-resolve is used to resolve the entry point of the package
const resolve = require('@rollup/plugin-node-resolve');

// NOTE: 3. @rollup/plugin-replace is used to replace the process.env.NODE_ENV with 'production'
const replace = require('@rollup/plugin-replace');

// NOTE: 4. rollup-plugin-postcss is used to process the CSS files
// NOTE: 5. autoprefixer is used to add vendor prefixes to the CSS
// NOTE: 6. cssnano is used to minify the CSS
const postcss = require('rollup-plugin-postcss');
const autoprefixer = require('autoprefixer');
const cssnano = require('cssnano');

// NOTE: 7. rollup-plugin-copy is used to copy the types to the dist folder
const copy = require('rollup-plugin-copy');

// NOTE: 8. @rollup/plugin-commonjs is used to convert CommonJS modules to ES modules
const commonjs = require('@rollup/plugin-commonjs');

// NOTE: 9. rollup-plugin-typescript2 is used to convert TypeScript to JavaScript
const typescript = require('rollup-plugin-typescript2');

// NOTE: 10. rollup-plugin-terser is used to minify the JavaScript
const { terser } = require('rollup-plugin-terser');

// NOTE: 11. rollup-plugin-visualizer is used to visualize the bundle size
// const visualizer = require('rollup-plugin-visualizer').visualizer;

// NOTE: 12. package.json is used to get the package information
const packageJson = require('./package.json');

module.exports = [
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
            dest: 'dist/types',
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
            declarationDir: 'dist',
            emitDeclarationOnly: false,
            rootDir: 'src',
            baseUrl: '.',
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
      terser({
        compress: {
          drop_console: true,
          dead_code: true,
          passes: 5,
        },
        output: {
          comments: true,
        },
      }),
      // visualizer({
      //   filename: 'stats.html',
      //   gzipSize: true,
      //   open: true,
      // }),
    ],
    external: (path) => /node_modules/.test(path),
  },
];
