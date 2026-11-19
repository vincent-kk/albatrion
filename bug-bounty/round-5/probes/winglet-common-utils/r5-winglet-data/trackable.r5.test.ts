import { describe, expect, it } from 'vitest';

import { getTrackableHandler } from '@/common-utils';

import { getTrackableHandlerBefore020ebd94c } from './fixtures/trackableBefore020ebd94c';

type Manager = { readonly state: { progress: number }; update: (value: { progress: number }) => void };

/**
 * A late update from a finished first call arrives while a second, non-overlapping call
 * awaits its own hook. The calls never overlap, so `preventConcurrent` should not matter.
 */
async function lateUpdateDuringNextHook(
  preventConcurrent: boolean,
  phase: 'before' | 'after',
  create: typeof getTrackableHandler = getTrackableHandler,
) {
  let stored: Manager['update'] | undefined;
  let release = () => {};
  const gate = new Promise<void>((resolve) => { release = resolve; });
  let gateReached = () => {};
  const reached = new Promise<void>((resolve) => { gateReached = resolve; });
  const hook = (id: number, manager: Manager) => {
    if (id === 0) { stored = manager.update; return undefined; }
    gateReached();
    return gate;
  };
  const handler = create(async (id: number) => id, {
    preventConcurrent,
    initialState: { progress: 0 },
    beforeExecute: ([id], manager) => (phase === 'before' ? hook(id, manager) : id === 0 ? hook(id, manager) : undefined),
    afterExecute: ([id], manager) => (phase === 'after' && id !== 0 ? hook(id, manager) : undefined),
  });
  await handler(0);
  const seen: number[] = [];
  handler.subscribe(() => seen.push(handler.state.progress));
  const second = handler(1);
  await reached;
  stored!({ progress: 50 });
  const duringHook = [...seen];
  release();
  await second;
  return { duringHook, all: seen };
}

describe('getTrackableHandler: a stored update of a finished call (EQ11, RG3)', () => {
  for (const phase of ['before', 'after'] as const) {
    it(`control: preventConcurrent false publishes it at once while the next call awaits its ${phase} hook`, async () => {
      const result = await lateUpdateDuringNextHook(false, phase);
      expect(result.duringHook.at(-1)).toBe(50);
    });

    it(`preventConcurrent true publishes it at once while the next call awaits its ${phase} hook`, async () => {
      const guarded = await lateUpdateDuringNextHook(true, phase);
      const concurrent = await lateUpdateDuringNextHook(false, phase);
      expect(guarded.duringHook).toEqual(concurrent.duringHook);
    });

    it(`diagnostic: before 020ebd94c (hooks not awaited) the guarded path published it at once (${phase} hook)`, async () => {
      const before = await lateUpdateDuringNextHook(true, phase, getTrackableHandlerBefore020ebd94c);
      expect(before.duringHook.at(-1)).toBe(50);
    });
  }
});

/** Count what three variants do when a subscriber throws on the start notification. */
async function throwingStartSubscriber(variant: 'plain' | 'guarded' | 'concurrent') {
  const calls = { origin: 0, after: 0 };
  const hooks =
    variant === 'plain'
      ? {}
      : { afterExecute: () => { calls.after++; } };
  const handler = getTrackableHandler(async () => { calls.origin++; return 'ok'; }, {
    preventConcurrent: variant !== 'concurrent',
    ...hooks,
  });
  let first = true;
  const pendingSeen: boolean[] = [];
  handler.subscribe(() => {
    pendingSeen.push(handler.pending);
    if (first) { first = false; throw new Error('subscriber'); }
  });
  const outcome = await handler().then((value) => `resolved:${value}`, (error: Error) => `rejected:${error.message}`);
  return { outcome, origin: calls.origin, pendingSeen, pending: handler.pending };
}

describe('getTrackableHandler: a start subscriber that throws (EQ11)', () => {
  it('plain, guarded and concurrent variants agree on outcome, origin runs and notifications', async () => {
    const plain = await throwingStartSubscriber('plain');
    expect(await throwingStartSubscriber('guarded')).toEqual(plain);
    expect(await throwingStartSubscriber('concurrent')).toEqual(plain);
  });
});

/** A subscriber that starts a new call from the completion notification. */
async function restartFromCompletion(preventConcurrent: boolean, withHooks: boolean) {
  const log: string[] = [];
  let runs = 0;
  const handler = getTrackableHandler(async (id: number) => { log.push(`origin:${id}`); return id; }, {
    preventConcurrent,
    ...(withHooks ? { beforeExecute: ([id]: [number]) => { log.push(`before:${id}`); }, afterExecute: ([id]: [number]) => { log.push(`after:${id}`); } } : {}),
  });
  const restarted: Promise<unknown>[] = [];
  handler.subscribe(() => {
    log.push(`notify:${handler.pending}`);
    if (!handler.pending && runs++ === 0) restarted.push(handler(1));
  });
  await handler(0);
  await Promise.all(restarted);
  await Promise.resolve();
  return { log, pending: handler.pending };
}

describe('getTrackableHandler: re-entry from a completion subscriber (LC2)', () => {
  for (const preventConcurrent of [true, false])
    it(`guard=${preventConcurrent}: hooks and no hooks run the restarted call the same way`, async () => {
      const plain = await restartFromCompletion(preventConcurrent, false);
      const hooked = await restartFromCompletion(preventConcurrent, true);
      expect(hooked.log.filter((entry) => !entry.startsWith('before') && !entry.startsWith('after'))).toEqual(plain.log);
      expect(hooked.pending).toBe(false);
    });
});

/** A hook that starts a nested call and then fails. */
async function reenterThenFail(phase: 'before' | 'after', asynchronous: boolean, preventConcurrent: boolean) {
  const nested: Promise<unknown>[] = [];
  let handler: ReturnType<typeof getTrackableHandler<[number], number, { writes: number }>>;
  const hook = ([id]: [number]) => {
    if (id !== 0) return undefined;
    nested.push(handler(1).then((value) => `nested:${value}`, (error: Error) => `nested-rejected:${error.message}`));
    if (asynchronous) return Promise.reject(new Error('hook'));
    throw new Error('hook');
  };
  handler = getTrackableHandler(async (id: number) => id, {
    preventConcurrent,
    initialState: { writes: 0 },
    ...(phase === 'before' ? { beforeExecute: hook } : { afterExecute: hook }),
  });
  let notifications = 0;
  handler.subscribe(() => notifications++);
  const outer = await handler(0).then(() => 'outer resolved', (error: Error) => `outer:${error.message}`);
  const inner = await Promise.all(nested);
  await Promise.resolve();
  return { outer, inner, notifications, pending: handler.pending };
}

describe('getTrackableHandler: a hook that re-enters and then fails (LC2, RG3)', () => {
  for (const phase of ['before', 'after'] as const)
    for (const asynchronous of [false, true])
      for (const preventConcurrent of [false, true])
        it(`${phase}, ${asynchronous ? 'async' : 'sync'}, guard=${preventConcurrent}: outer fails, nested call settles, counts follow the contract`, async () => {
          const result = await reenterThenFail(phase, asynchronous, preventConcurrent);
          const nestedRan = !preventConcurrent;
          expect(result).toEqual({
            outer: 'outer:hook',
            inner: [nestedRan ? 'nested:1' : 'nested:undefined'],
            notifications: (phase === 'before' ? 1 : 2) + (nestedRan ? 2 : 0),
            pending: false,
          });
        });
});

/** Nested call from a hook, with only one of the two hooks present. */
async function nestedWithOneHook(phase: 'before' | 'after', asynchronous: boolean) {
  const snapshots: { pending: boolean; writes: number }[] = [];
  const nested: Promise<unknown>[] = [];
  let handler: ReturnType<typeof getTrackableHandler<[number], number, { writes: number }>>;
  const hook = ([id]: [number], manager: { update: (fn: (p: { writes: number }) => { writes: number }) => void }) => {
    manager.update((previous) => ({ writes: previous.writes + 1 }));
    if (id === 0) nested.push(handler(1));
    if (asynchronous) return Promise.resolve().then(() => manager.update((previous) => ({ writes: previous.writes + 1 })));
    manager.update((previous) => ({ writes: previous.writes + 1 }));
    return undefined;
  };
  handler = getTrackableHandler(async (id: number) => id, {
    preventConcurrent: false,
    initialState: { writes: 0 },
    ...(phase === 'before' ? { beforeExecute: hook } : { afterExecute: hook }),
  });
  handler.subscribe(() => snapshots.push({ pending: handler.pending, writes: handler.state.writes }));
  await handler(0);
  await Promise.all(nested);
  return { count: snapshots.length, last: snapshots.at(-1), pending: handler.pending };
}

describe('getTrackableHandler: one hook only, nested call, concurrent calls allowed (RG3)', () => {
  for (const phase of ['before', 'after'] as const)
    for (const asynchronous of [false, true])
      it(`${phase} only, ${asynchronous ? 'async' : 'sync'}: two calls notify four times and end idle`, async () => {
        const result = await nestedWithOneHook(phase, asynchronous);
        expect(result).toEqual({ count: 4, last: { pending: false, writes: 4 }, pending: false });
      });
});
