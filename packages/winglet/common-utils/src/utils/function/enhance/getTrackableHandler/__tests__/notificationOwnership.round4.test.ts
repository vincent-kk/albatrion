import { describe, expect, it } from 'vitest';
import { getTrackableHandler } from '../getTrackableHandler';
import { referenceTrackable } from './helpers/referenceTrackable';
import type { TrackableHandlerFunction, TrackableHandlerOptions } from '../type';

type CreateHandler = (origin: (id: number) => Promise<number>, options: TrackableHandlerOptions<[number], { writes: number }>) => TrackableHandlerFunction<[number], number, { writes: number }>;

/** Trace a detached update belonging to an origin while a different call awaits its hook. */
async function traceOwnership(create: CreateHandler) {
  let updateFirst: ((value: { writes: number }) => void) | undefined;
  let releaseFirst = () => {};
  let releaseSecond = () => {};
  const firstGate = new Promise<void>(resolve => { releaseFirst = resolve; });
  const secondGate = new Promise<void>(resolve => { releaseSecond = resolve; });
  const seen: number[] = [];
  const handler = create(async id => { if (id === 0) await firstGate; return id; }, {
    preventConcurrent: false, initialState: { writes: 0 },
    beforeExecute: ([id], manager) => {
      if (id === 0) { updateFirst = manager.update; return undefined; }
      manager.update({ writes: 2 });
      return secondGate;
    },
  });
  handler.subscribe(() => seen.push(handler.state.writes));
  const first = handler(0);
  const second = handler(1);
  updateFirst?.({ writes: 3 });
  const duringWait = [...seen];
  releaseFirst(); releaseSecond();
  await Promise.all([first, second]);
  return { seen, duringWait };
}

describe('round-4 per-call notification ownership', () => {
  it('another call awaiting a hook does not swallow a detached update', async () => {
    expect(await traceOwnership(getTrackableHandler)).toEqual(await traceOwnership(referenceTrackable));
  });

  for (const preventConcurrent of [true, false])
    for (const phase of ['before', 'after'] as const)
      for (const failure of ['throw', 'reject'] as const)
        it(`${phase} ${failure}, guard=${preventConcurrent}: model notification count`, async () => {
          const run = async (create: CreateHandler) => {
            const fail = () => { if (failure === 'throw') throw Error('hook'); return Promise.reject(Error('hook')); };
            const handler = create(async () => 1, {
              preventConcurrent, initialState: { writes: 0 },
              beforeExecute: phase === 'before' ? fail : undefined,
              afterExecute: phase === 'after' ? fail : undefined,
            });
            const seen: boolean[] = [];
            handler.subscribe(() => seen.push(handler.pending));
            await expect(handler(0)).rejects.toThrow('hook');
            return seen;
          };
          const expected = await run(referenceTrackable);
          expect(expected).toHaveLength(phase === 'before' ? 1 : 2);
          expect(await run(getTrackableHandler)).toEqual(expected);
        });
});
