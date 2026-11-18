import { describe, expect, it, vi } from 'vitest';

import { getTrackableHandler } from '../getTrackableHandler';

describe('round-2 common-utils 2: subscriber failure cleanup', () => {
  it('recovers after a start subscriber throws', async () => {
    const origin = vi.fn(async () => 1);
    const handler = getTrackableHandler(origin);
    const unsubscribe = handler.subscribe(() => {
      throw new Error('listener');
    });
    await expect(handler()).rejects.toThrow('listener');
    expect(handler.pending).toBe(false);
    unsubscribe();
    expect(await handler()).toBe(await origin());
  });
});

describe('round-2 common-utils 5: concurrent pending lifetime', () => {
  it.each([0, 1])(
    'matches one outstanding call after call %s settles',
    async (firstIndex) => {
      const resolve: Array<() => void> = [];
      const handler = getTrackableHandler(
        () => new Promise<void>((done) => resolve.push(done)),
        { preventConcurrent: false },
      );
      const reference = getTrackableHandler(
        () => new Promise<void>((done) => resolve.push(done)),
      );
      const calls = [handler(), handler()];
      const referenceCall = reference();
      resolve[firstIndex]();
      await calls[firstIndex];
      expect(handler.pending).toBe(reference.pending);
      resolve[1 - firstIndex]();
      resolve[2]();
      await Promise.all([...calls, referenceCall]);
      expect(handler.pending).toBe(reference.pending);
    },
  );
});
