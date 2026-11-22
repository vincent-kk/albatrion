import { createRequire } from 'node:module';
import { describe, expect, it } from 'vitest';

import { DataLoader } from '@/data-loader';

const flush = () => new Promise<void>((resolve) => setTimeout(resolve, 0));

describe('loadMany per-key errors: a throwing cache.get inside an open batch (RG1 of round 4 item 3)', () => {
  it('the other keys of the open batch still load and the failing key gets its own Error', async () => {
    const calls: string[][] = [];
    const store = new Map<string, Promise<string>>();
    const loader = new DataLoader<string, string>(async (keys) => { calls.push([...keys]); return [...keys]; }, {
      cache: {
        get: (key) => { if (key === 'bad') throw new Error('cache read'); return store.get(key); },
        set: (key, value) => void store.set(key, value),
        delete: (key) => store.delete(key),
        clear: () => store.clear(),
      },
    });
    const values = await loader.loadMany(['a', 'bad', 'b']);
    expect(values.map((value) => (value instanceof Error ? value.message : value))).toEqual(['a', 'cache read', 'b']);
    expect(calls).toEqual([['a', 'b']]);
  });
});

/** A failed old batch clears the cache entry of a newer request for the same key. */
const staleFailure = async (create: (load: (keys: readonly string[]) => Promise<string[]>) => {
  load(key: string): Promise<string>;
  clear(key: string): unknown;
}) => {
  const releases: Array<(fail: boolean) => void> = [];
  let calls = 0;
  const loader = create((keys) => {
    calls++;
    return new Promise((resolve, reject) => {
      releases.push((fail) => (fail ? reject(new Error('old batch')) : resolve([...keys])));
    });
  });
  const old = loader.load('k').catch(() => 'old failed');
  await flush();
  loader.clear('k');
  const fresh = loader.load('k');
  await flush();
  releases[0](true);
  await old;
  const again = loader.load('k');
  await flush();
  releases[1]?.(false);
  releases[2]?.(false);
  await Promise.all([fresh, again]);
  return { batchCalls: calls };
};

describe('a late batch failure against a newer request for the same key', () => {
  it('control (rejected hypothesis): the package and the reference dataloader behave the same', async () => {
    const Reference = createRequire(import.meta.url)('dataloader') as new (
      load: (keys: readonly string[]) => Promise<string[]>,
      options?: object,
    ) => { load(key: string): Promise<string>; clear(key: string): unknown };
    const ours = await staleFailure((load) => new DataLoader<string, string>(load));
    const reference = await staleFailure((load) => new Reference(load));
    expect(ours).toEqual(reference);
  });
});
