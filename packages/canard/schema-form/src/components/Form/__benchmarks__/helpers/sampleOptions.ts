import type { BenchOptions } from 'vitest';

/**
 * Install Tinybench's per-iteration hooks through Vitest's exposed task setup.
 * @param prepare - Untimed setup, also used by Tinybench's async detection probe.
 * @param dispose - Untimed assertions and cleanup after each operation.
 * @returns Options retaining at least ten independent measured samples.
 */
export const sampleOptions = (
  prepare: () => void,
  dispose: () => void,
): BenchOptions => ({
  iterations: 10,
  setup: (task) => {
    task.opts.beforeEach = prepare;
    task.opts.afterEach = dispose;
  },
});
