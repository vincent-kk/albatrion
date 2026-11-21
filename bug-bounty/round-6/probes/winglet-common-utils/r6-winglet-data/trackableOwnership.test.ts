import { expect, it } from 'vitest';
import { getTrackableHandler, type StateManager } from '@/common-utils';

it('finished failed-call updater publishes during another call before and after waits', async () => {
  for (const preventConcurrent of [true, false]) {
    const managers: StateManager<{ n: number }>[] = [];
    let releaseBefore!: () => void, releaseAfter!: () => void;
    const handler = getTrackableHandler(async () => 1, {
      preventConcurrent, initialState: { n: 0 },
      beforeExecute: ([id]: any, manager) => {
        managers[id] = manager;
        if (id === 0) throw new Error('owner failed');
        return new Promise<void>(resolve => { releaseBefore = resolve; });
      },
      afterExecute: () => new Promise<void>(resolve => { releaseAfter = resolve; }),
    });
    await expect((handler as any)(0)).rejects.toThrow('owner failed');
    const states: number[] = [];
    handler.subscribe(() => { states.push(handler.state.n); });
    const pending = (handler as any)(1);
    managers[0].update({ n: 1 });
    expect(states).toEqual([1]);
    releaseBefore();
    await new Promise(resolve => setTimeout(resolve, 0));
    managers[0].update({ n: 2 });
    expect(states).toEqual([1, 1, 2]);
    releaseAfter(); await pending;
    expect(states).toEqual([1, 1, 2, 2]);
    expect(handler.pending).toBe(false);
  }
});
