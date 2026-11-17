import { storybookTest } from '@storybook/addon-vitest/vitest-plugin';
import { playwright } from '@vitest/browser-playwright';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'path';
import { defineConfig } from 'vitest/config';

import { bundleTests, renderTests } from './vitest.projectFiles';

const __dirname = dirname(fileURLToPath(import.meta.url));

/** Shadow setup contracts and stored full-visitation histories run only in the vitest.verify.config.ts projects. */
const verifyOnlyTests = [
  'src/core/engine/settle/__tests__/settle.derive-shadow-setup.test.ts',
  'src/core/engine/settle/__tests__/settle.gate-selection-preparation-invariants.test.ts',
  'src/core/engine/settle/__tests__/settle.gate-table-characterization.test.ts',
  'src/core/engine/settle/__tests__/settle.gate-table-key-order.test.ts',
  'src/core/engine/settle/__tests__/settle.gate-table-wheel-characterization.test.ts',
];

const resolvePackage = createRequire(import.meta.url).resolve;
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

export default defineConfig({
  resolve: {
    alias: {
      '@/schema-form': resolve(__dirname, './src'),
    },
  },
  test: {
    globals: true,
    projects: [
      {
        extends: true,
        test: {
          name: 'unit',
          setupFiles: [
            'src/core/engine/settle/__tests__/setupShippedGateEvaluation.ts',
          ],
          environment: 'node',
          include: [
            'src/**/*.{spec,test}.ts',
            'stories/components/panels/utils/__tests__/*.test.ts',
          ],
          exclude: [...renderTests, ...verifyOnlyTests, ...bundleTests],
        },
      },
      {
        extends: true,
        test: {
          name: 'render',
          setupFiles: [
            'src/core/engine/settle/__tests__/setupShippedGateEvaluation.ts',
          ],
          environment: 'jsdom',
          include: renderTests,
          provide: { reactMajor: '19' },
        },
      },
      {
        extends: true,
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
          name: 'react18',
          setupFiles: [
            'src/core/engine/settle/__tests__/setupShippedGateEvaluation.ts',
          ],
          environment: 'jsdom',
          include: renderTests,
          provide: { reactMajor: '18' },
          server: {
            deps: {
              inline: [
                /react18/,
                /react-dom18/,
                /@testing-library\/(react|dom|user-event)/,
                // Native imports of optimized chunks drop the ?v= query and load a second React.
                /\/node_modules\/\.vite\/vitest\//,
              ],
            },
          },
          // Bundle CommonJS requires through the aliases, including testing-library's React imports.
          deps: {
            optimizer: {
              client: {
                enabled: true,
                include: [
                  'react18',
                  'react-dom18',
                  'react-dom18/client',
                  'react-dom18/server.browser',
                  'react-dom18/test-utils',
                  '@testing-library/react',
                  '@testing-library/dom',
                  '@testing-library/user-event',
                  '@canard/schema-form-antd5-plugin > antd',
                ],
              },
            },
          },
        },
      },
      {
        extends: true,
        esbuild: { jsxDev: false },
        test: {
          name: 'production',
          environment: 'jsdom',
          include: [
            'src/core/engine/blueprint/**/__tests__/*.owned-inline*.test.{ts,tsx}',
            ...bundleTests,
          ],
          provide: { reactMajor: '19' },
        },
      },
      {
        extends: true,
        plugins: [
          storybookTest({ configDir: resolve(__dirname, '.storybook') }),
        ],
        test: {
          name: 'storybook',
          browser: {
            enabled: true,
            headless: true,
            provider: playwright(),
            instances: [{ browser: 'chromium' }],
          },
          setupFiles: ['.storybook/vitest.setup.ts'],
        },
      },
    ],
    coverage: {
      reporter: ['text', 'json', 'html'],
    },
  },
});
