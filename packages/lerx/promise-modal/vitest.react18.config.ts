import { createRequire } from 'node:module';
import { defineConfig, mergeConfig } from 'vitest/config';

import config from './vite.config';

/** CommonJS dependency optimization resolves through the package's pinned aliases. */
const resolvePackage = createRequire(import.meta.url).resolve;

/** Exact aliases cover runtime subpaths without matching unrelated package names. */
const react18Aliases = [
  'react/jsx-runtime',
  'react/jsx-dev-runtime',
  'react-dom/client',
  'react-dom/server',
  'react-dom/test-utils',
  'react',
  'react-dom',
].map((name) => ({
  find: new RegExp(`^${name.replace('.', '\\.')}$`),
  replacement:
    name === 'react-dom/server'
      ? 'react-dom18/server.browser'
      : name
          .replace(/^react-dom/, 'react-dom18')
          .replace(/^react\//, 'react18/')
          .replace(/^react$/, 'react18'),
}));

// Loaded by test:react18; dependency bundling routes CommonJS React imports too.
export default mergeConfig(
  config,
  defineConfig({
    resolve: {
      alias: react18Aliases,
      dedupe: ['react', 'react-dom'],
    },
    optimizeDeps: {
      esbuildOptions: {
        plugins: [
          {
            name: 'react18-commonjs-aliases',
            setup(build) {
              build.onResolve(
                { filter: /^react(?:-dom)?(?:\/.*)?$/ },
                ({ path }) => ({
                  path: resolvePackage(
                    path
                      .replace(/^react-dom/, 'react-dom18')
                      .replace(/^react\//, 'react18/')
                      .replace(/^react$/, 'react18'),
                  ),
                }),
              );
            },
          },
        ],
      },
    },
    test: {
      env: { REACT_COMPATIBILITY_MAJOR: '18' },
      server: {
        deps: {
          inline: [
            /react18/,
            /react-dom18/,
            /@testing-library\/(react|dom)/,
            /@lerx\/promise-modal/,
          ],
        },
      },
      testTransformMode: {
        web: [`${__dirname}/src/**/*.ts`, `${__dirname}/src/**/*.tsx`],
      },
      deps: {
        optimizer: {
          web: {
            enabled: true,
            include: [
              'react18',
              'react-dom18',
              'react-dom18/client',
              'react-dom18/server.browser',
              'react-dom18/test-utils',
              '@testing-library/react',
              '@testing-library/dom',
            ],
          },
        },
      },
    },
  }),
);
