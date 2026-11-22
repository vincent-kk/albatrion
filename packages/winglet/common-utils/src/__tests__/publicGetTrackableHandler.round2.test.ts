import { describe, expect, it, vi } from 'vitest';

import { getTrackableHandler } from '../index';

describe('round-2 common-utils 2: subscriber failure cleanup', () => {
  it('recovers after a start subscriber throws', async () => {
    const report = vi.fn();
    vi.stubGlobal('reportError', report);
    const origin = vi.fn(async () => 1);
    const handler = getTrackableHandler(origin);
    const unsubscribe = handler.subscribe(() => {
      throw new Error('listener');
    });
    await expect(handler()).rejects.toThrow('listener');
    expect(handler.pending).toBe(false);
    unsubscribe();
    expect(await handler()).toBe(await origin());
    expect(report).toHaveBeenCalledTimes(1);
    expect(report).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'listener' }),
    );
    vi.unstubAllGlobals();
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

it('publishes another invocation’s update while an earlier before hook is pending', async () => {
  let resume!: () => void;
  const waiting = new Promise<void>((resolve) => {
    resume = resolve;
  });
  const handler = getTrackableHandler(async (id: number) => id, {
    initialState: { value: 0 },
    preventConcurrent: false,
    beforeExecute: ([id], manager) => {
      if (id === 1) return waiting;
      manager.update({ value: id });
      return undefined;
    },
  });
  const first = handler(1);
  try {
    await expect(handler(2)).resolves.toBe(2);
    expect(handler.state.value).toBe(2);
    expect(handler.pending).toBe(true);
  } finally {
    resume();
    await first;
  }
});
