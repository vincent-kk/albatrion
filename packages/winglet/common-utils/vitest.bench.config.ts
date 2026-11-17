import { resolve } from 'path';
import { defineConfig } from 'vitest/config';

/**
 * vitest bench config — separate from the main test config.
 *
 * - `environment: 'node'` because this package contains pure utilities that do not
 *   require a DOM.
 * - Only *.bench.ts files are selected, including verification within owning modules.
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
    include: ['bench/**/*.bench.ts', 'src/**/__benchmarks__/**/*.bench.ts'],
    benchmark: {
      include: ['bench/**/*.bench.ts', 'src/**/__benchmarks__/**/*.bench.ts'],
      outputJson: 'bench/.results/latest.json',
    },
  },
});
