import { describe, expect, it, vi } from 'vitest';

import { createReferenceResolverAsync } from '../createReferenceResolverAsync';

const root = { $id: 'https://retry.test/root' };
const loaded = { $id: 'https://retry.test/remote', type: 'string' };

describe('round-2 json-schema 1: rejected load eviction', () => {
  it.each(['synchronous throw', 'rejected promise'])(
    'retries %s and matches a fresh successful resolver', async (kind) => {
      let fail = true;
      const error = new Error('temporary');
      const load = vi.fn(() => {
        if (fail) {
          if (kind === 'synchronous throw') throw error;
          return Promise.reject(error);
        }
        return Promise.resolve(loaded);
      });
      const retry = createReferenceResolverAsync(root, { load });
      const context = retry.root(root);
      const rejected = await Promise.allSettled([
        retry.resolve('remote', '$ref', context),
        retry.resolve('remote', '$ref', context),
      ]);
      expect(rejected).toEqual([{ status: 'rejected', reason: error }, { status: 'rejected', reason: error }]);
      expect(load).toHaveBeenCalledTimes(1); fail = false;
      const fresh = createReferenceResolverAsync(root, { load: async () => loaded });
      expect(await retry.resolve('remote', '$ref', context)).toEqual(await fresh.resolve('remote', '$ref', fresh.root(root)));
      await retry.resolve('remote', '$ref', context);
      expect(load).toHaveBeenCalledTimes(2);
    },
  );
  it('keeps fulfilled missing requests shared like fulfilled schema requests', async () => {
    for (const result of [undefined, loaded]) {
      const load = vi.fn(async () => result);
      const resolver = createReferenceResolverAsync(root, { load });
      const context = resolver.root(root);
      await Promise.all([resolver.resolve('remote', '$ref', context), resolver.resolve('remote', '$ref', context)]);
      await resolver.resolve('remote', '$ref', context);
      expect(load).toHaveBeenCalledTimes(1);
    }
  });
});
