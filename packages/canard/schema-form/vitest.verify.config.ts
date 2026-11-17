// Loaded by the test:verify script through --config; vite.config.ts leaves these projects out of default runs.
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'path';
import { defineConfig } from 'vitest/config';

import { bundleTests, renderTests } from './vitest.projectFiles';

const __dirname = dirname(fileURLToPath(import.meta.url));

/** Shadow wheel, verify table and derive shadow checks over the unit and render suites. */
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
          name: 'verify-unit',
          // Independent slot replay doubles work in the complete BF fixture corpus.
          testTimeout: 30000,
          setupFiles: [
            'src/core/engine/settle/__tests__/setupDeriveShadowEvaluation.ts',
          ],
          environment: 'node',
          include: ['src/**/*.{spec,test}.ts'],
          exclude: [...renderTests, ...bundleTests],
        },
      },
      {
        extends: true,
        test: {
          name: 'verify-render',
          testTimeout: 30000,
          setupFiles: [
            'src/core/engine/settle/__tests__/setupDeriveShadowEvaluation.ts',
          ],
          environment: 'jsdom',
          include: renderTests,
          provide: { reactMajor: '19' },
        },
      },
    ],
  },
});
