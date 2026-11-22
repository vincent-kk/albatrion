import { describe, expect, it } from 'vitest';

import { DataLoader } from '../index';

describe('round-3 retired scheduler batch equivalence', () => {
  it.each([
    ['before', 'resolve', 1],
    ['before', 'resolve', 2],
    ['before', 'reject', 1],
    ['before', 'reject', 2],
    ['after', 'resolve', 1],
    ['after', 'resolve', 2],
    ['after', 'reject', 1],
    ['after', 'reject', 2],
  ])(
    '%s dispatch, late %s, next key %s matches a fresh loader',
    async (phase, outcome, key) => {
      const nextKey = Number(key);
      const calls: number[][] = [],
        referenceCalls: number[][] = [];
      const finish: Array<() => void> = [],
        finishReference: Array<() => void> = [];
      let firstSchedule = true;
      let retiredTask: (() => void) | undefined;
      let settleOld = () => {};
      let retiredKeys: ReadonlyArray<number> = [];
      const loader = new DataLoader<number, number>(
        async (keys) => {
          calls.push([...keys]);
          if (phase === 'after' && calls.length === 1) {
            const gate = new Promise<ReadonlyArray<number>>(
              (resolve, reject) => {
                settleOld = () =>
                  outcome === 'resolve'
                    ? resolve(keys.map((value) => value * 10))
                    : reject(new Error('retired origin'));
              },
            );
            try {
              return await gate;
            } finally {
              retiredKeys = [...keys];
            }
          }
          return new Promise<ReadonlyArray<number>>((resolve) =>
            finish.push(() => resolve(keys.map((value) => value * 10))),
          );
        },
        {
          batchScheduler: (task) => {
            if (firstSchedule) {
              firstSchedule = false;
              retiredTask = task;
              if (phase === 'after') task();
              throw new Error('scheduler');
            }
            task();
          },
        },
      );
      const reference = new DataLoader<number, number>(
        (keys) => {
          referenceCalls.push([...keys]);
          return new Promise<ReadonlyArray<number>>((resolve) =>
            finishReference.push(() =>
              resolve(keys.map((value) => value * 10)),
            ),
          );
        },
        { batchScheduler: (task) => task() },
      );
      expect(() => loader.load(1)).toThrow('scheduler');
      const next = loader.load(nextKey),
        expected = reference.load(nextKey);
      settleOld();
      await Promise.resolve();
      await Promise.resolve();
      await Promise.resolve();
      retiredTask?.();
      const duplicate = loader.load(nextKey),
        expectedDuplicate = reference.load(nextKey);
      for (const resolve of [...finish, ...finishReference]) resolve();
      const settled = await Promise.all([next, duplicate]);
      const referenceSettled = await Promise.all([expected, expectedDuplicate]);
      expect(settled).toEqual(referenceSettled);
      const retiredCount = phase === 'after' ? 1 : 0;
      expect(calls.slice(retiredCount)).toEqual(referenceCalls);
      expect(calls).toHaveLength(retiredCount + 1);
      if (phase === 'after') expect(retiredKeys).toEqual([1]);
      retiredTask?.();
      settleOld();
      await Promise.resolve();
      await Promise.resolve();
      await Promise.resolve();
      expect(await Promise.all([next, duplicate])).toEqual(settled);
      expect(calls).toHaveLength(retiredCount + 1);
    },
  );
});
