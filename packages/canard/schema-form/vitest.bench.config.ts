import { resolve } from 'path';
import { defineConfig } from 'vitest/config';

/**
 * vitest bench config — separate from the main test config.
 *
 * - `environment: 'node'` so we measure schema-form core hot paths without
 *   JSDOM overhead (JSDOM globals are still set up on demand inside specific
 *   benches that need them).
 * - `include` covers the `__benchmarks__` verification organs and the
 *   standalone `bench/legacy-compare` scripts so test files are not picked up;
 *   `benchmark.include` runs only the vitest suites, by name.
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
    fileParallelism: false,
    maxWorkers: 1,
    include: [
      'src/**/__benchmarks__/**/*.bench.ts',
      'bench/legacy-compare/**/*.bench.ts',
    ],
    benchmark: {
      include: [
        'src/core/__benchmarks__/{branch-strategy-init,compute-recalculate,event-cascade,find-node,nodeFromJSONSchema,object-pending-read,render-delay}.bench.ts',
      ],
      outputJson: 'bench/.results/latest.json',
    },
  },
});
