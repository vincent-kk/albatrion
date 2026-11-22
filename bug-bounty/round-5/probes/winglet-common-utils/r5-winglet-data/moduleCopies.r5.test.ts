import { createRequire } from 'node:module';
import { describe, expect, it } from 'vitest';

import * as source from '@/common-utils';

type Library = typeof source;

/** Runs the same behavior checks against one loaded copy of the package. */
const observe = async (library: Library) => {
  class Registry extends Map {}
  const registry = new Registry([['a', 1]]);
  const error = new Error('failed', { cause: { code: 7 } });
  const handler = library.getTrackableHandler(async (value: number) => value, {
    preventConcurrent: false,
    initialState: { count: 0 },
    beforeExecute: (_args, manager) => { manager.update((previous) => ({ count: previous.count + 1 })); },
  });
  const seen: number[] = [];
  handler.subscribe(() => seen.push(handler.state.count));
  await Promise.all([handler(1), handler(2)]);
  const ids: number[] = [];
  const scheduler = library.MessageChannelScheduler.getInstance();
  ids.push(scheduler.schedule(() => {}));
  scheduler.destroy();
  const next = library.MessageChannelScheduler.getInstance();
  const fresh = next.schedule(() => {});
  ids.push(fresh, Number(next.cancel(ids[0])));
  next.destroy();
  return {
    subclassKept: Object.getPrototypeOf(library.clone(registry)) === Registry.prototype,
    causeEnumerable: Object.getOwnPropertyDescriptor(library.clone(error), 'cause')?.enumerable,
    equalsRoundTrip: library.equals(error, library.clone(error)),
    notifications: seen,
    idsDistinct: ids[0] !== ids[1],
    staleCancel: ids[2],
    nullPrototype: Object.getPrototypeOf(library.shallowClone(Object.create(null))),
  };
};

describe('one behavior through the ESM build, the CommonJS build and the source (EQ3)', () => {
  it('the ESM dist, the CommonJS dist and src agree', async () => {
    const esm = (await import('@winglet/common-utils')) as unknown as Library;
    const cjs = createRequire(import.meta.url)('@winglet/common-utils') as Library;
    const fromSource = await observe(source);
    expect(await observe(esm)).toEqual(fromSource);
    expect(await observe(cjs)).toEqual(fromSource);
    expect(esm.clone).not.toBe(cjs.clone);
  });
});
