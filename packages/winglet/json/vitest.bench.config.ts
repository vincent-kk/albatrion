import { resolve } from 'path';
import { defineConfig } from 'vitest/config';

/**
 * vitest bench config — separate from the main test config.
 *
 * - `environment: 'node'` because JSON comparison does not require browser APIs or
 *   a DOM.
 * - `include` scoped to `bench/**` so test files are not picked up.
 */
export default defineConfig({
  resolve: {
    alias: {
      '@/json': resolve(__dirname, './src'),
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
