// NOTE: 1. rollup-plugin-peer-deps-external is used to externalize peer dependencies
const peerDepsExternal = require('rollup-plugin-peer-deps-external');

// NOTE: 2. @rollup/plugin-node-resolve is used to resolve the entry point of the package
const resolve = require('@rollup/plugin-node-resolve');

// NOTE: 3. @rollup/plugin-replace is used to replace the process.env.NODE_ENV with 'production'
const replace = require('@rollup/plugin-replace');

// NOTE: 4. @rollup/plugin-babel is used to convert TypeScript to JavaScript
const babel = require('@rollup/plugin-babel');

// NOTE: 6. rollup-plugin-copy is used to copy the types to the dist folder
const copy = require('rollup-plugin-copy');

// NOTE: 8. @rollup/plugin-commonjs is used to convert CommonJS modules to ES modules
const commonjs = require('@rollup/plugin-commonjs');

// NOTE: 9. rollup-plugin-typescript2 is used to convert TypeScript to JavaScript
const typescript = require('rollup-plugin-typescript2');

// NOTE: 10. rollup-plugin-terser is used to minify the JavaScript
const { terser } = require('rollup-plugin-terser');

// NOTE: 11. rollup-plugin-visualizer is used to visualize the bundle size
const visualizer = require('rollup-plugin-visualizer').visualizer;

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
    onwarn(warning, warn) {
      if (warning.code === 'CIRCULAR_DEPENDENCY') return;
      warn(warning);
    },
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
            src: '@aileron/**/*.d.ts',
            dest: 'dist/@aileron',
          },
        ],
        flatten: false,
      }),
      commonjs(),
      babel({
        babelHelpers: 'bundled',
        // NOTE: babel은 emotion.ts 파일만 처리, ts 처리는 typescript 플러그인에서 처리
        extensions: ['.emotion.ts'],
        plugins: [
          [
            '@emotion',
            {
              sourceMap: false,
              autoLabel: 'dev-only',
              labelFormat: '[local]',
            },
          ],
        ],
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
      visualizer({
        filename: 'promise-modal-stats.html',
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
