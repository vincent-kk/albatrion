import { describe, expect, it } from 'vitest';
import { DataLoader } from '../index';

describe('round-4 failed cache writes do not enter batches', () => {
  for (const open of [false, true])
    for (const writesBeforeThrow of [false, true])
      for (const batchFailure of [false, true])
        it(`open=${open}, partial write=${writesBeforeThrow}, batch failure=${batchFailure}`, async () => {
          const store = new Map<string, Promise<string>>();
          const calls: string[][] = [];
          const ghostErrors: unknown[] = [];
          let shouldThrow = true;
          const loader = new DataLoader<string, string>(async keys => {
            calls.push([...keys]);
            if (batchFailure) throw Error('backend');
            return keys.map(key => key === 'failed' ? Error('ghost key') : key);
          }, {
            batchScheduler: task => queueMicrotask(task),
            cache: {
              get: key => store.get(key),
              set: (key, promise) => {
                if (key === 'failed' && shouldThrow) {
                  void promise.catch(error => ghostErrors.push(error));
                  if (writesBeforeThrow) store.set(key, promise);
                  throw Error('cache write');
                }
                store.set(key, promise);
              },
              delete: key => store.delete(key), clear: () => store.clear(),
            },
          });
          const first = open ? loader.load('good').catch(() => 'backend') : Promise.resolve('unused');
          expect(() => loader.load('failed')).toThrow('cache write');
          await first;
          await new Promise<void>(resolve => setTimeout(resolve, 0));
          expect(calls).toEqual(open ? [['good']] : []);
          expect(ghostErrors).toEqual([]);
          expect(store.has('failed')).toBe(false);
          shouldThrow = false;
          const reference = new DataLoader<string, string>(async keys => keys, { cache: false });
          expect(await loader.load('recovered').catch(() => 'backend')).toBe(batchFailure ? 'backend' : await reference.load('recovered'));
        });

  it('loadMany retains per-key isolation when load throws synchronously', async () => {
    const failure = Error('cache write');
    const loader = new DataLoader<string, string>(async keys => keys, {
      batchScheduler: task => queueMicrotask(task),
      cache: {
        get: () => undefined,
        set: key => { if (key === 'failed') throw failure; },
        delete: () => {}, clear: () => {},
      },
    });
    const reference = await Promise.all(['good', 'failed', 'other'].map(async key => {
      try { return await loader.load(key); } catch (error) { return error; }
    }));
    expect(await loader.loadMany(['good', 'failed', 'other'])).toEqual(reference);
  });
});
