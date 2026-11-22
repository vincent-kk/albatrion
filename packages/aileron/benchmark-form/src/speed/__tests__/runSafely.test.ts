import { expect, it } from 'vitest';

import { measureBatch } from '../measureBatch';
import { runSafely } from '../runSafely';

it('voids a row for a bad middle operation and continues with the next row', async () => {
  let sequence = 0;
  const row: { verdict: 'pass' | 'over' | 'void'; voidReason?: string } = {
    verdict: 'pass',
  };
  await runSafely(
    row,
    () => 'round 1 slot A1 arm baseline',
    async () => {
      await measureBatch(3, () => {
        const value = sequence++ === 1 ? 0 : 42;
        return { run: () => value, validate: (result) => result === 42 };
      });
    },
  );
  expect(row.verdict).toBe('void');
  expect(row.voidReason).toContain('round 1 slot A1 arm baseline');
  const next = await measureBatch(1, () => ({
    run: () => 42,
    validate: (value) => value === 42,
  }));
  expect(next.observed).toBe(42);
});

it('measures asynchronous operation completion', async () => {
  const result = await measureBatch(1, () => ({
    run: () => new Promise((resolve) => setTimeout(() => resolve(42), 20)),
    validate: (value) => value === 42,
  }));
  expect(result.elapsedNs).toBeGreaterThanOrEqual(10_000_000);
});
