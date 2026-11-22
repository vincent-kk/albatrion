import { expect, it } from 'vitest';

import { measureBatch } from '../measureBatch';

it('rejects an incorrect middle result', async () => {
  let sequence = 0;
  await expect(
    measureBatch(3, () => {
      const value = sequence++ === 1 ? 0 : 42;
      return { run: () => value, validate: (result: unknown) => result === 42 };
    }),
  ).rejects.toThrow('validation');
});

it('includes asynchronous completion in the timed interval', async () => {
  const result = await measureBatch(1, () => ({
    run: () => new Promise((resolve) => setTimeout(() => resolve(42), 20)),
    validate: (value: unknown) => value === 42,
  }));
  expect(result.elapsedNs).toBeGreaterThanOrEqual(10_000_000);
});
