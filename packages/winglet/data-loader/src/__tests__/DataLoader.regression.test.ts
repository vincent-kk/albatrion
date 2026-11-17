import { describe, expect, it } from 'vitest';

import { DataLoader } from '../index';

const settleWithin = <T>(promise: Promise<T>, ms: number) =>
  Promise.race([
    promise.then((value) => ({ settled: true as const, value })),
    new Promise<{ settled: false }>((resolve) =>
      setTimeout(() => resolve({ settled: false }), ms),
    ),
  ]);

const createRecordingLoader = <Key, Value>(
  map: (key: Key) => Value,
  options?: ConstructorParameters<typeof DataLoader<Key, Value>>[1],
) => {
  const calls: Array<ReadonlyArray<Key>> = [];
  const loader = new DataLoader<Key, Value>(async (keys) => {
    calls.push(keys);
    return keys.map(map);
  }, options);
  return { loader, calls };
};

describe('immediate batchScheduler (fn) => fn()', () => {
  it('resolves load() through one batchLoader call', async () => {
    const { loader, calls } = createRecordingLoader<number, number>(
      (key) => key * 10,
      { batchScheduler: (fn) => fn() },
    );
    const result = await settleWithin(loader.load(1), 200);
    expect(calls).toEqual([[1]]);
    expect(result).toEqual({ settled: true, value: 10 });
  });

  it('resolves loadMany() and serves a repeated key from the cache', async () => {
    const { loader, calls } = createRecordingLoader<number, number>(
      (key) => key * 10,
      { batchScheduler: (fn) => fn() },
    );
    const result = await settleWithin(loader.loadMany([1, 2, 1]), 200);
    expect(result).toEqual({ settled: true, value: [10, 20, 10] });
    expect(calls).toEqual([[1], [2]]);
  });
});

describe('falsy cache keys', () => {
  it('serves load(0) from a value primed for 0', async () => {
    const { loader, calls } = createRecordingLoader<number, string>(
      (key) => `loaded-${key}`,
    );
    loader.prime(0, 'primed');
    expect(await loader.load(0)).toBe('primed');
    expect(calls).toEqual([]);
  });

  it('deduplicates repeated loads whose cache key is an empty string', async () => {
    const { loader, calls } = createRecordingLoader<string, string>(
      (key) => `loaded-${key}`,
      { cacheKeyFn: (key) => key.trim() },
    );
    const results = await Promise.all([loader.load(' '), loader.load('  ')]);
    expect(results).toEqual(['loaded- ', 'loaded- ']);
    expect(calls).toEqual([[' ']]);
  });
});
