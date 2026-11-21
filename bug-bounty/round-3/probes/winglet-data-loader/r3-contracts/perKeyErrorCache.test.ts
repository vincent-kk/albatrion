import { describe, expect, it } from 'vitest';

import { DataLoader } from '../../index';

/**
 * advanced-patterns.md:93-110 ("Per-Key Error Isolation") recommends turning each failed fetch,
 * a transient network rejection included, into an `Error` inside the result array.
 * batching-and-caching.md:174 promises "A transient network failure cannot 'stick' a rejected
 * promise in the cache — the next load() of that key goes through a fresh batch."
 * Neither document says that a per-key `Error` is cached.
 */
describe('r3-contracts data-loader: a transient per-key failure', () => {
  const makeLoader = () => {
    let attempt = 0;
    const fetchItem = async (id: string) => {
      attempt += 1;
      if (attempt === 1) throw new Error('ECONNRESET');
      return { id };
    };
    // The document's own pattern, verbatim apart from the item shape.
    return new DataLoader(async (ids: ReadonlyArray<string>) => {
      const settled = await Promise.allSettled(ids.map((id) => fetchItem(id)));
      return settled.map((result, i) =>
        result.status === 'fulfilled'
          ? result.value
          : new Error(`Failed to load ${ids[i]}: ${result.reason}`),
      );
    });
  };

  it('control: a batch-wide transient failure does not stick (batching-and-caching.md:170-174)', async () => {
    let attempt = 0;
    const loader = new DataLoader(async (ids: ReadonlyArray<string>) => {
      attempt += 1;
      if (attempt === 1) throw new Error('ECONNRESET');
      return ids.map((id) => ({ id }));
    });
    await expect(loader.load('a')).rejects.toThrow('ECONNRESET');
    await expect(loader.load('a')).resolves.toEqual({ id: 'a' });
  });

  it('the next load() after a transient per-key failure goes through a fresh batch', async () => {
    const loader = makeLoader();
    await expect(loader.load('a')).rejects.toThrow('ECONNRESET');
    await expect(loader.load('a')).resolves.toEqual({ id: 'a' });
  });
});
