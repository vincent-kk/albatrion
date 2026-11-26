import { describe, expect, it, vi } from 'vitest';

import { DataLoader } from '../index';

const TIMEOUT = Symbol('pending');
/** Observes a load without allowing a stalled scheduler to stall the test. */
const observe = async (load: () => Promise<number>) => {
  try {
    return await Promise.race([
      load(),
      new Promise<typeof TIMEOUT>((resolve) =>
        setTimeout(() => resolve(TIMEOUT), 30),
      ),
    ]);
  } catch (error) {
    return error;
  }
};

/** Browser operations accept an absent or global receiver, never a loader instance. */
function browserScheduler(this: unknown, task: () => void) {
  if (this != null && this !== globalThis)
    throw new TypeError('Illegal invocation');
  queueMicrotask(task);
}

describe('round-3 scheduler equivalence', () => {
  it('a bare receiver-checked scheduler behaves like an arrow wrapper', async () => {
    const bare = new DataLoader<number, number>(
      async (keys) => keys.map((key) => key * 10),
      { batchScheduler: browserScheduler },
    );
    const wrapped = new DataLoader<number, number>(
      async (keys) => keys.map((key) => key * 10),
      { batchScheduler: (task) => browserScheduler(task) },
    );
    for (const key of [1, 2, 1])
      expect(await observe(() => bare.load(key))).toEqual(
        await observe(() => wrapped.load(key)),
      );
  });

  it.each([new Error('scheduler'), 'scheduler', undefined])(
    'retries after scheduler throw %s like a fresh loader',
    async (reason) => {
      let first = true;
      const loader = new DataLoader<number, number>(
        async (keys) => keys.map((key) => key * 10),
        {
          batchScheduler: (task) => {
            if (first) {
              first = false;
              throw reason;
            }
            queueMicrotask(task);
          },
        },
      );
      const reference = new DataLoader<number, number>(
        async (keys) => keys.map((key) => key * 10),
        { batchScheduler: queueMicrotask },
      );
      let threw = false;
      let caught: unknown;
      try {
        loader.load(1);
      } catch (error) {
        threw = true;
        caught = error;
      }
      expect(threw).toBe(true);
      expect(caught).toBe(reason);
      for (const key of [2, 1, 2])
        expect(await observe(() => loader.load(key))).toEqual(
          await observe(() => reference.load(key)),
        );
    },
  );
});

it('runs a batch twice when its user scheduler dispatches twice', async () => {
  const loadBatch = vi.fn(async (keys: readonly string[]) => keys);
  const loader = new DataLoader(loadBatch, {
    batchScheduler(dispatch) {
      dispatch();
      dispatch();
    },
  });

  await expect(loader.load('a')).resolves.toBe('a');
  expect(loadBatch).toHaveBeenCalledTimes(2);
  expect(loadBatch).toHaveBeenNthCalledWith(1, ['a']);
  expect(loadBatch).toHaveBeenNthCalledWith(2, ['a']);
});

it.each([0, '', false, null, NaN])('deduplicates the cache key %j', async (cacheKey) => {
  const batch = vi.fn(async (items: readonly number[]) => items);
  const loader = new DataLoader(batch, { cacheKeyFn: () => cacheKey });
  await expect(Promise.all([loader.load(1), loader.load(2)])).resolves.toEqual([1, 1]);
  expect(batch).toHaveBeenCalledExactlyOnceWith([1]);
});
