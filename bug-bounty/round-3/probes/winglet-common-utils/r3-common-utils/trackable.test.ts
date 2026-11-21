import { describe, expect, it, vi } from 'vitest';

import { getTrackableHandler } from '@/common-utils/index';

describe('getTrackableHandler subscriber failures and reentrancy', () => {
  it('a subscriber that throws on the completion notification does not hide the completion from later subscribers', async () => {
    const handler = getTrackableHandler(async () => 'done');
    let phase = 0;
    handler.subscribe(() => {
      phase++;
      if (phase === 2) throw new Error('listener failed on completion');
    });
    const seen: boolean[] = [];
    handler.subscribe(() => seen.push(handler.pending));
    await handler().catch(() => undefined);
    // The second subscriber must be told about both the start and the completion.
    expect(seen).toEqual([true, false]);
  });

  it('a subscriber that throws on the completion notification does not turn a resolved call into a rejection', async () => {
    const handler = getTrackableHandler(async () => 'done');
    let phase = 0;
    handler.subscribe(() => {
      phase++;
      if (phase === 2) throw new Error('listener failed on completion');
    });
    await expect(handler()).resolves.toBe('done');
  });

  it('a call made from beforeExecute does not run concurrently under preventConcurrent', async () => {
    let running = 0;
    let maxRunning = 0;
    let reentered = false;
    const resolvers: Array<() => void> = [];
    const handler: any = getTrackableHandler(
      async () => {
        running++;
        maxRunning = Math.max(maxRunning, running);
        await new Promise<void>((resolve) => resolvers.push(resolve));
        running--;
      },
      {
        beforeExecute: () => {
          if (!reentered) {
            reentered = true;
            void handler();
          }
        },
      },
    );
    const first = handler();
    await Promise.resolve();
    resolvers.forEach((resolve) => resolve());
    await first;
    expect(maxRunning).toBe(1);
  });

  it('an async beforeExecute that rejects keeps the original function from running', async () => {
    const origin = vi.fn(async () => 'ran');
    const unhandled: unknown[] = [];
    const onUnhandled = (reason: unknown) => unhandled.push(reason);
    process.on('unhandledRejection', onUnhandled);
    try {
      const handler = getTrackableHandler(origin, {
        beforeExecute: async () => {
          throw new Error('blocked');
        },
      });
      await handler().catch(() => undefined);
      await new Promise((resolve) => setTimeout(resolve, 10));
    } finally {
      process.off('unhandledRejection', onUnhandled);
    }
    expect(origin).not.toHaveBeenCalled();
  });
});

describe('getTrackableHandler async hooks as written in its JSDoc examples', () => {
  it('an async afterExecute that rejects propagates like a throwing afterExecute', async () => {
    const unhandled: unknown[] = [];
    const onUnhandled = (reason: unknown) => unhandled.push(reason);
    process.on('unhandledRejection', onUnhandled);
    let outcome: string;
    try {
      const handler = getTrackableHandler(async () => 'ok', {
        afterExecute: async () => {
          await Promise.resolve();
          throw new Error('afterExecute failed');
        },
      });
      outcome = await handler().then(
        (value) => 'resolved:' + value,
        (error: Error) => 'rejected:' + error.message,
      );
      await new Promise((resolve) => setTimeout(resolve, 10));
    } finally {
      process.off('unhandledRejection', onUnhandled);
    }
    expect({ outcome, unhandled: unhandled.length }).toEqual({
      outcome: 'rejected:afterExecute failed',
      unhandled: 0,
    });
  });
});
