import type { TrackableHandlerFunction, TrackableHandlerOptions } from '../../type';

/** Trace a finite pair of calls, including updates on either side of nested execution. */
export async function runLifecycle(
  create: (origin: (id: number) => Promise<number>, options: TrackableHandlerOptions<[number], { writes: number }>) => TrackableHandlerFunction<[number], number, { writes: number }>,
  location: 'before' | 'after' | 'origin' | 'overlap',
  asynchronous: boolean, preventConcurrent: boolean, outcome: 'resolve' | 'reject' | 'throw',
) {
  const calls = { before: 0, after: 0, origin: 0 };
  const snapshots: { pending: boolean; writes: number }[] = [];
  const nested: Promise<unknown>[] = [];
  let handler: TrackableHandlerFunction<[number], number, { writes: number }>;
  const enter = (phase: 'before' | 'after' | 'origin', id: number) => {
    calls[phase]++;
    if (location === phase && id === 0) nested.push(handler(1).catch(() => 'rejected'));
  };
  const hook = (phase: 'before' | 'after', id: number, manager: Parameters<NonNullable<TrackableHandlerOptions<[number], { writes: number }>['beforeExecute']>>[1]) => {
    manager.update(previous => ({ writes: previous.writes + 1 }));
    enter(phase, id);
    if (asynchronous) return Promise.resolve().then(() => manager.update(previous => ({ writes: previous.writes + 1 })));
    manager.update(previous => ({ writes: previous.writes + 1 }));
    return undefined;
  };
  handler = create(id => {
    enter('origin', id);
    if (outcome === 'throw') throw Error('origin');
    return outcome === 'reject' ? Promise.reject(Error('origin')) : Promise.resolve(id);
  }, {
    preventConcurrent, initialState: { writes: 0 },
    beforeExecute: ([id], manager) => hook('before', id, manager),
    afterExecute: ([id], manager) => hook('after', id, manager),
  });
  handler.subscribe(() => snapshots.push({ pending: handler.pending, writes: handler.state.writes }));
  const first = handler(0).catch(() => 'rejected');
  if (location === 'overlap') nested.push(handler(1).catch(() => 'rejected'));
  const result = await first;
  await Promise.all(nested);
  return { calls, snapshots, result, pending: handler.pending };
}
