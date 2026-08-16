import { resolve } from 'path';
import { defineConfig } from 'vitest/config';

/**
 * vitest bench config — separate from the main test config.
 *
 * - `environment: 'node'` because this package contains pure utilities that do not
 *   require a DOM.
 * - `include` scoped to `bench/**` so test files are not picked up.
 */
export default defineConfig({
  resolve: {
    alias: {
      '@/common-utils': resolve(__dirname, './src'),
    },
  },
  test: {
    globals: false,
    environment: 'node',
    include: ['bench/**/*.bench.ts'],
    benchmark: {
      include: ['bench/**/*.bench.ts'],
      outputJson: 'bench/.results/latest.json',
    },
  },
});
