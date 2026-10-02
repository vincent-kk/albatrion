import { resolve } from 'path';

import { storybookTest } from '@storybook/addon-vitest/vitest-plugin';
import { defineConfig } from 'vitest/config';

/** DOM-backed product tests run in the render project. */
const renderTests = [
  'src/**/*.test.tsx',
  'src/**/helpers/virtualization/__tests__/VirtualizationManager.test.ts',
];

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
