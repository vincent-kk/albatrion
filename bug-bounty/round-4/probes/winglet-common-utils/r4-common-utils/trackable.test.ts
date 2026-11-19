import { describe, expect, it } from 'vitest';

import { getTrackableHandler } from '@/common-utils';

type State = { x?: number; y?: number };

/**
 * A beforeExecute hook that writes state, calls the same handler once (the round-3 item 15
 * trigger: a hook that blurs a field whose blur handler saves through the same handler),
 * and writes state again. With concurrent calls allowed the nested call is legal.
 */
const runNestedHookCall = async (
  hook: 'beforeExecute' | 'afterExecute',
  preventConcurrent: boolean,
) => {
  const snapshots: string[] = [];
  let nested = false;
  const handler = getTrackableHandler<[label: string], void, State>(
    async () => {},
    {
      preventConcurrent,
      initialState: {},
      [hook]: (args: [string], stateManager: any) => {
        if (args[0] !== 'outer') return;
        stateManager.update({ x: 1 });
        if (!nested) {
          nested = true;
          void handler('inner');
        }
        stateManager.update({ y: 2 });
      },
    },
  );
  handler.subscribe(() => {
    snapshots.push(
      `${handler.pending ? 'pending' : 'idle'}:${JSON.stringify(handler.state)}`,
    );
  });
  await handler('outer');
  await new Promise((resolve) => setTimeout(resolve, 0));
  return snapshots;
};

describe('hook writes fold into lifecycle notifications when the hook calls the handler', () => {
  // DETAIL.md: every call notifies exactly twice, and writes made during a hook fold into
  // the notification at the end of the hook. Two calls therefore give four notifications.
  it('beforeExecute, concurrent calls allowed: two calls notify four times', async () => {
    const snapshots = await runNestedHookCall('beforeExecute', false);
    expect({ count: snapshots.length, snapshots }).toMatchObject({ count: 4 });
  });

  it('afterExecute, concurrent calls allowed: two calls notify four times', async () => {
    const snapshots = await runNestedHookCall('afterExecute', false);
    expect({ count: snapshots.length, snapshots }).toMatchObject({ count: 4 });
  });

  it('control: beforeExecute under preventConcurrent (nested call blocked) notifies twice', async () => {
    const snapshots = await runNestedHookCall('beforeExecute', true);
    expect({ count: snapshots.length, snapshots }).toMatchObject({ count: 2 });
  });

  it('control: without a nested call the two writes reach subscribers together', async () => {
    const snapshots: string[] = [];
    const handler = getTrackableHandler<[], void, State>(async () => {}, {
      preventConcurrent: false,
      initialState: {},
      beforeExecute: (_args, stateManager) => {
        stateManager.update({ x: 1 });
        stateManager.update({ y: 2 });
      },
    });
    handler.subscribe(() => snapshots.push(JSON.stringify(handler.state)));
    await handler();
    expect(snapshots).toEqual(['{"x":1,"y":2}', '{"x":1,"y":2}']);
  });
});

describe('the three handler paths agree on a synchronously throwing origin', () => {
  const run = async (options: Record<string, unknown>) => {
    const seen: boolean[] = [];
    const origin = (() => {
      throw new Error('sync');
    }) as unknown as () => Promise<void>;
    const handler = getTrackableHandler(origin, options);
    handler.subscribe(() => seen.push(handler.pending));
    let outcome = 'resolved';
    try {
      await handler();
    } catch (error) {
      outcome = `rejected:${(error as Error).message}`;
    }
    return { outcome, pending: handler.pending, seen };
  };

  it('no hooks, guarded hooks and concurrent hooks give the same result', async () => {
    const noop = () => {};
    const plain = await run({});
    expect({
      guarded: await run({ beforeExecute: noop }),
      concurrent: await run({ preventConcurrent: false, beforeExecute: noop }),
    }).toEqual({ guarded: plain, concurrent: plain });
  });
});
