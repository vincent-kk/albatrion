import { resolve } from 'path';
import { defineConfig } from 'vitest/config';

/**
 * vitest bench config — separate from the main test config.
 *
 * - `environment: 'node'` so we measure schema-form core hot paths without
 *   JSDOM overhead (JSDOM globals are still set up on demand inside specific
 *   benches that need them).
 * - `include` scoped to `bench/**` so test files are not picked up.
 */
export default defineConfig({
  resolve: {
    alias: {
      '@/schema-form': resolve(__dirname, './src'),
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
