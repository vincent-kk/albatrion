import { resolve } from 'path';
import { defineConfig } from 'vitest/config';

/**
 * vitest bench config — separate from the main test config.
 *
 * - `environment: 'jsdom'` because every hook here is measured through a real React
 *   render, not a simulated dispatcher; a fake hook runtime would measure the fake.
 * - `include` scoped to `bench/**` so test files are not picked up.
 */
export default defineConfig({
  resolve: {
    alias: {
      '@/react-utils': resolve(__dirname, './src'),
    },
  },
  test: {
    globals: false,
    environment: 'jsdom',
    include: ['bench/**/*.bench.ts'],
    benchmark: {
      include: ['bench/**/*.bench.ts'],
      outputJson: 'bench/.results/latest.json',
    },
  },
});
