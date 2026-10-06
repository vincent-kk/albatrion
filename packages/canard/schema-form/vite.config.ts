import { dirname, resolve } from 'path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

import { storybookTest } from '@storybook/addon-vitest/vitest-plugin';
import { defineConfig } from 'vitest/config';

const __dirname = dirname(fileURLToPath(import.meta.url));

/** DOM-backed product tests run in the render project. */
const renderTests = [
  'src/**/*.test.tsx',
  'src/**/helpers/virtualization/__tests__/VirtualizationManager.test.ts',
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
  replacement: name === 'react-dom/server' ? 'react-dom18/server.browser' : name.replace(/^react-dom/, 'react-dom18').replace(/^react\//, 'react18/').replace(/^react$/, 'react18'),
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
          environment: 'node',
          include: ['src/**/*.{spec,test}.ts'],
          exclude: [...renderTests, 'src/__legacy__/**'],
        },
      },
      {
        extends: true,
        test: {
          name: 'render',
          environment: 'jsdom',
          include: renderTests,
          exclude: ['src/__legacy__/**'],
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
            plugins: [{
              name: 'react18-commonjs-aliases',
              setup(build) {
                build.onResolve({ filter: /^react(?:-dom)?(?:\/.*)?$/ }, ({ path }) => ({
                  path: resolvePackage(path.replace(/^react-dom/, 'react-dom18').replace(/^react\//, 'react18/').replace(/^react$/, 'react18')),
                }));
              },
            }],
          },
        },
        test: {
          name: 'react18',
          environment: 'jsdom',
          include: renderTests,
          exclude: ['src/__legacy__/**'],
          provide: { reactMajor: '18' },
          server: { deps: { inline: [/react18/, /react-dom18/, /@testing-library\/(react|dom|user-event)/] } },
          transformMode: { web: [/\.[cm]?[jt]sx?$/] },
          // Bundle CommonJS requires through the aliases, including testing-library's React imports.
          deps: {
            optimizer: {
              web: {
                enabled: true,
                include: [
                  'react18', 'react-dom18', 'react-dom18/client', 'react-dom18/server.browser', 'react-dom18/test-utils',
                  '@testing-library/react',
                  '@testing-library/dom',
                  '@testing-library/user-event',
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
          transformMode: { ssr: [/\.ts$/], web: [/\.tsx$/] },
          include: ['src/core/blueprint/__tests__/*.owned-inline*.test.{ts,tsx}'],
          provide: { reactMajor: '19' },
        },
      },
      {
        extends: true,
        plugins: [storybookTest({ configDir: resolve(__dirname, '.storybook') })],
        test: {
          name: 'storybook',
          browser: {
            enabled: true,
            headless: true,
            provider: 'playwright',
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
