import { describe, expect, it } from 'vitest';

import { DataLoader } from '../../index';

const TIMEOUT = Symbol('timeout');
const settleWithin = <T>(promise: Promise<T>, ms = 100) =>
  Promise.race([
    promise.then(
      (value) => ({ value }),
      (error: unknown) => ({ error }),
    ),
    new Promise<typeof TIMEOUT>((resolve) =>
      setTimeout(() => resolve(TIMEOUT), ms),
    ),
  ]);

/**
 * Stands in for a WebIDL operation such as window.queueMicrotask or
 * window.setTimeout: browsers throw "Illegal invocation" when the receiver is an
 * object other than the global (WebIDL "create an operation function").
 */
function receiverCheckedQueueMicrotask(this: unknown, task: () => void) {
  if (this !== undefined && this !== null && this !== globalThis)
    throw new TypeError('Illegal invocation');
  queueMicrotask(task);
}

describe('r3 data-loader: batchScheduler receiver (docs list bare queueMicrotask / setTimeout)', () => {
  it('calls batchScheduler as a plain function, not as a method of the loader', async () => {
    const receivers: unknown[] = [];
    const loader = new DataLoader<number, number>(
      async (keys) => keys.map((key) => key * 10),
      {
        batchScheduler(this: unknown, task) {
          receivers.push(this);
          queueMicrotask(task);
        },
      },
    );
    await loader.load(1);
    expect(receivers[0] === loader).toBe(false);
  });

  it('works with a receiver-checked scheduler passed bare (as SPECIFICATION suggests for queueMicrotask)', async () => {
    const loader = new DataLoader<number, number>(
      async (keys) => keys.map((key) => key * 10),
      { batchScheduler: receiverCheckedQueueMicrotask },
    );
    let thrown: unknown = null;
    let first: Promise<number> | null = null;
    try {
      first = loader.load(1);
    } catch (error) {
      thrown = error;
    }
    const second = await settleWithin(loader.load(2));
    expect({
      thrown: thrown instanceof Error ? thrown.message : thrown,
      first: first ? await settleWithin(first) : 'no promise',
      second,
    }).toEqual({ thrown: null, first: { value: 10 }, second: { value: 20 } });
  });
});

describe('r3 data-loader: a batchScheduler that throws once', () => {
  it('later loads still settle after one synchronous scheduler exception', async () => {
    let failNext = true;
    const calls: number[][] = [];
    const loader = new DataLoader<number, number>(
      async (keys) => {
        calls.push([...keys]);
        return keys.map((key) => key * 10);
      },
      {
        batchScheduler: (task) => {
          if (failNext) {
            failNext = false;
            throw new Error('scheduler unavailable');
          }
          setTimeout(task, 0);
        },
      },
    );
    expect(() => loader.load(1)).toThrow('scheduler unavailable');
    const other = await settleWithin(loader.load(2));
    const same = await settleWithin(loader.load(1));
    // Expected: both loads settle (the failed load may be retried or rejected).
    expect({ other, same, calls }).toEqual({
      other: { value: 20 },
      same: expect.objectContaining({}),
      calls: expect.arrayContaining([expect.arrayContaining([2])]),
    });
    expect(same).not.toBe(TIMEOUT);
  });
});

describe('r3 data-loader: SPECIFICATION "TTL-Based Cache" example, executed literally', () => {
  it('the TtlMap passed as in docs/en/SPECIFICATION.md:378-380 serves the loader cache', async () => {
    class TtlMap<K, V> {
      private store = new Map<K, { value: V; expiresAt: number }>();
      constructor(private ttlMs: number) {}
      gets = 0;
      sets = 0;
      get(key: K) {
        this.gets += 1;
        const e = this.store.get(key);
        if (!e) return undefined;
        if (Date.now() > e.expiresAt) {
          this.store.delete(key);
          return undefined;
        }
        return e.value;
      }
      set(key: K, value: V) {
        this.sets += 1;
        this.store.set(key, { value, expiresAt: Date.now() + this.ttlMs });
      }
      delete(key: K) {
        this.store.delete(key);
      }
      clear() {
        this.store.clear();
      }
    }
    const ttl = new TtlMap<number, Promise<number>>(60_000);
    // Copied from the SPECIFICATION example; the option name is the documented one.
    const options = { cacheMap: ttl };
    const cachedLoader = new DataLoader<number, number>(
      async (keys) => keys.map((key) => key * 10),
      options as never,
    );
    await cachedLoader.load(1);
    expect({ gets: ttl.gets, sets: ttl.sets }).toEqual({ gets: 1, sets: 1 });
  });
});

describe('r3 data-loader: diagnostics (not findings by themselves)', () => {
  it('a thenable batch result whose then() returns a non-promise rejects the batch instead of throwing', async () => {
    const thrown: unknown[] = [];
    const loader = new DataLoader<number, number>(
      ((keys: ReadonlyArray<number>) => ({
        then(onFulfilled: (values: number[]) => void) {
          onFulfilled(keys.map((key) => key * 10));
        },
      })) as never,
      {
        batchScheduler: (task) =>
          setTimeout(() => {
            try {
              task();
            } catch (error) {
              thrown.push(error);
            }
          }, 0),
      },
    );
    const result = await settleWithin(loader.load(1));
    expect({ result, thrown: thrown.length }).toEqual({
      result: { value: 10 },
      thrown: 0,
    });
  });

  it('per-key Error results stay cached while batch-wide failures are cleared', async () => {
    let attempt = 0;
    const perKey = new DataLoader<number, number>(async (keys) => {
      attempt += 1;
      return keys.map((key) =>
        attempt === 1 ? new Error(`transient ${key}`) : key * 10,
      );
    });
    await perKey.load(1).catch(() => undefined);
    const retry = await settleWithin(perKey.load(1));
    // Reference dataloader caches per-key Errors by design; this records it.
    expect(retry).toHaveProperty('error');
  });
});
