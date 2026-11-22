import { describe, expect, it } from 'vitest';

import { DataLoader } from '../../index';

const settleWithin = <T>(promise: Promise<T>, ms: number) =>
  Promise.race([
    promise.then((value) => ({ settled: true as const, value })),
    new Promise<{ settled: false }>((resolve) =>
      setTimeout(() => resolve({ settled: false }), ms),
    ),
  ]);

describe('periphery data-loader probes', () => {
  it('documented immediate scheduler (fn) => fn() resolves load()', async () => {
    const calls: Array<ReadonlyArray<number>> = [];
    const loader = new DataLoader<number, number>(
      async (keys) => {
        calls.push(keys);
        return keys.map((key) => key * 10);
      },
      { batchScheduler: (fn) => fn() },
    );
    const result = await settleWithin(loader.load(1), 200);
    expect(calls).toEqual([[1]]);
    expect(result).toEqual({ settled: true, value: 10 });
  });

  it('prime(0) followed by load(0) is served from the cache', async () => {
    const calls: Array<ReadonlyArray<number>> = [];
    const loader = new DataLoader<number, string>(async (keys) => {
      calls.push(keys);
      return keys.map((key) => `loaded-${key}`);
    });
    loader.prime(0, 'primed');
    expect(await loader.load(0)).toBe('primed');
    expect(calls).toEqual([]);
  });
});
