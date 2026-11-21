import { expect, it, vi } from 'vitest';

import { getTrackableHandler } from '../getTrackableHandler';
import type { StateManager } from '../type';

it('defaults to an empty shallow state and replaces it even for equal or empty updates', async () => {
  let manager: StateManager<Record<string, unknown>> | undefined;
  const handler = getTrackableHandler(async () => 1, { beforeExecute: (_args, value) => { manager = value; } });
  expect(handler.state).toEqual({});
  const listener = vi.fn();
  handler.subscribe(listener);
  await handler();
  const previous = handler.state;
  manager?.update({});
  expect(handler.state).not.toBe(previous);
  const next = handler.state;
  manager?.update(state => state);
  expect(handler.state).not.toBe(next);
  expect(listener).toHaveBeenCalledTimes(4);
  expect(listener.mock.calls.every(args => args.length === 0)).toBe(true);
});

it('a throwing updater leaves aggregate state and publications unchanged', async () => {
  let manager: StateManager<{ value: number }> | undefined;
  const handler = getTrackableHandler(async () => 1, { initialState: { value: 1 }, beforeExecute: (_args, value) => { manager = value; } });
  const listener = vi.fn(); handler.subscribe(listener);
  await handler();
  const previous = handler.state;
  expect(() => manager?.update(() => { throw new Error('updater'); })).toThrow('updater');
  expect(handler.state).toBe(previous);
  expect(listener).toHaveBeenCalledTimes(2);
});

it('iterates the live listener set and lets later listeners read reentrant state', async () => {
  let manager: StateManager<{ value: number }> | undefined;
  const handler = getTrackableHandler(async () => 1, { initialState: { value: 0 }, beforeExecute: (_args, value) => { manager = value; } });
  const trace: Array<[string, number]> = [];
  let first = true;
  let removeSecond = () => {};
  const third = () => trace.push(['third', handler.state.value]);
  handler.subscribe(() => {
    trace.push(['first', handler.state.value]);
    if (!first) return;
    first = false;
    removeSecond();
    handler.subscribe(third);
    manager?.update({ value: 1 });
  });
  removeSecond = handler.subscribe(() => trace.push(['second', handler.state.value]));
  await handler();
  expect(trace).toEqual([['first', 0], ['first', 1], ['third', 1], ['third', 1], ['first', 1], ['third', 1]]);
});

it('after failure wins over the primary start-subscriber error without reporting that primary error', async () => {
  const reported: unknown[] = [];
  vi.stubGlobal('reportError', (error: unknown) => reported.push(error));
  const first = new Error('first'); const extra = new Error('extra'); const after = new Error('after');
  const origin = vi.fn(async () => 1);
  const handler = getTrackableHandler(origin, { afterExecute: () => { throw after; } });
  handler.subscribe(() => { throw first; });
  handler.subscribe(() => { throw extra; });
  try {
    await expect(handler()).rejects.toBe(after);
    expect(origin).not.toHaveBeenCalled();
    expect(reported).toEqual([extra, first, extra]);
    expect(handler.pending).toBe(false);
  } finally { vi.unstubAllGlobals(); }
});

it('passes an argument tuple to hooks and does not forward the handler receiver to origin', async () => {
  const observations: unknown[] = [];
  const handler = getTrackableHandler(function (this: unknown, value: number) {
    observations.push(this, value);
    return Promise.resolve(value);
  }, { beforeExecute: (args, manager) => { observations.push(args, manager.state); } });
  expect(await handler.call({ receiver: true }, 7)).toBe(7);
  expect(observations).toEqual([[7], {}, undefined, 7]);
});

it('runs synchronous hook and origin-throw cleanup in the current continuation', async () => {
  const trace: string[] = [];
  const handler = getTrackableHandler((): Promise<number> => { trace.push('origin'); throw new Error('origin'); }, {
    beforeExecute: () => { trace.push('before'); }, afterExecute: () => { trace.push('after'); },
  });
  handler.subscribe(() => trace.push(handler.pending ? 'start' : 'finish'));
  const result = handler();
  expect(trace).toEqual(['before', 'start', 'origin', 'after', 'finish']);
  await expect(result).rejects.toThrow('origin');
});

it('assimilates custom thenables asynchronously while their own manager continues folding', async () => {
  let manager: StateManager<{ value: number }> | undefined;
  let settle: (() => void) | undefined;
  const trace: string[] = [];
  const handler = getTrackableHandler(async () => 1, {
    initialState: { value: 0 }, beforeExecute: (_args, value) => {
      manager = value;
      return { then(resolve: () => void) { trace.push('then'); settle = resolve; } };
    },
  });
  handler.subscribe(() => trace.push(String(handler.state.value)));
  const result = handler();
  expect(trace).toEqual([]);
  await Promise.resolve();
  manager?.update({ value: 3 });
  expect(trace).toEqual(['then']);
  expect(handler.pending).toBe(true);
  settle?.();
  await result;
  expect(trace).toEqual(['then', '3', '3']);
});

it('a throwing then accessor is a before failure with one completion and no after', async () => {
  const origin = vi.fn(async () => 1); const after = vi.fn(); const listener = vi.fn();
  const handler = getTrackableHandler(origin, {
    beforeExecute: () => ({ get then() { throw new Error('then getter'); } }), afterExecute: after,
  });
  handler.subscribe(listener);
  await expect(handler()).rejects.toThrow('then getter');
  expect(origin).not.toHaveBeenCalled(); expect(after).not.toHaveBeenCalled();
  expect(listener).toHaveBeenCalledTimes(1); expect(handler.pending).toBe(false);
});

it('spreads an own __proto__ update as data without changing aggregate prototype', async () => {
  let manager: StateManager<Record<string, unknown>> | undefined;
  const handler = getTrackableHandler(async () => 1, { beforeExecute: (_args, value) => { manager = value; } });
  await handler();
  const prototype = Object.getPrototypeOf(handler.state);
  manager?.update(JSON.parse('{"__proto__":{"marker":true}}'));
  expect(Object.getPrototypeOf(handler.state)).toBe(prototype);
  expect(Object.getOwnPropertyDescriptor(handler.state, '__proto__')).toBeDefined();
});
