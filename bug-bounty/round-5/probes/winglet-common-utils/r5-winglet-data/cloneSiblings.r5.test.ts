import { runInNewContext } from 'node:vm';
import { describe, expect, it } from 'vitest';

import { clone, cloneLite, equals, stableEquals } from '@/common-utils';

const causeShape = (error: object) => {
  const descriptor = Object.getOwnPropertyDescriptor(error, 'cause');
  return descriptor === undefined ? 'absent' : descriptor.enumerable ? 'enumerable' : 'hidden';
};

describe('clone: Error cause enumerability across realms (RG1 of round 4 item 2)', () => {
  const script = 'const error = new Error("failed"); error.cause = { code: 7 }; error';

  it('control: a local Error with an assigned (enumerable) cause keeps it enumerable', () => {
    const local = runInNewContext(script, { Error });
    expect(causeShape(local)).toBe('enumerable');
    expect(causeShape(clone(local))).toBe('enumerable');
    expect(equals(local, clone(local))).toBe(true);
  });

  it('a foreign Error with an assigned (enumerable) cause keeps it enumerable', () => {
    const foreign = runInNewContext(script);
    expect(causeShape(foreign)).toBe('enumerable');
    expect(causeShape(clone(foreign))).toBe('enumerable');
  });

  it('equals(error, clone(error)) is true for a foreign Error with an assigned cause', () => {
    const foreign = runInNewContext(script);
    expect(equals(foreign, clone(foreign))).toBe(true);
  });
});

/** Builds a chain of `depth` nested objects, optionally linked back to its parent. */
const chain = (depth: number, linkBack: boolean) => {
  const head: Record<string, unknown> = { value: 0 };
  let node = head;
  for (let index = 1; index < depth; index++) {
    const next: Record<string, unknown> = { value: index };
    if (linkBack) next.previous = node;
    node.next = next;
    node = next;
  }
  return head;
};

const outcome = (run: () => unknown) => {
  try {
    run();
    return 'returned';
  } catch (error) {
    return error instanceof RangeError ? 'RangeError' : String(error);
  }
};

describe('deep acyclic and cyclic chains through sibling functions (EQ11)', () => {
  const depth = 20_000;

  it('control: cloneLite and equals handle a 20,000-level acyclic chain', () => {
    const value = chain(depth, false);
    expect(outcome(() => cloneLite(value))).toBe('returned');
    expect(outcome(() => equals(value, chain(depth, false)))).toBe('returned');
  });

  it('clone handles the same 20,000-level acyclic chain as cloneLite', () => {
    const value = chain(depth, false);
    expect(outcome(() => clone(value))).toBe(outcome(() => cloneLite(value)));
  });

  it('stableEquals handles the same 20,000-level acyclic chain as equals', () => {
    expect(outcome(() => stableEquals(chain(depth, false), chain(depth, false)))).toBe(
      outcome(() => equals(chain(depth, false), chain(depth, false))),
    );
  });

  it('stableEquals does not overflow on a deeply nested circular structure (JSDoc: no risk of stack overflow)', () => {
    expect(outcome(() => stableEquals(chain(depth, true), chain(depth, true)))).toBe('returned');
  });

  it('clone copies a deeply nested circular structure (the documented choice for cycles)', () => {
    expect(outcome(() => clone(chain(depth, true)))).toBe('returned');
  });
});

describe('measurement: largest chain depth each function completes', () => {
  const largest = (run: (depth: number) => unknown) => {
    let low = 1;
    let high = 200_000;
    while (low < high) {
      const middle = Math.ceil((low + high) / 2);
      if (outcome(() => run(middle)) === 'returned') low = middle;
      else high = middle - 1;
    }
    return low;
  };

  it('reports the depths', async () => {
    const { default: cloneDeep } = await import('lodash/cloneDeep.js');
    const { default: isEqual } = await import('lodash/isEqual.js');
    const depths = {
      lodashCloneDeep: largest((depth) => cloneDeep(chain(depth, false))),
      lodashIsEqual: largest((depth) => isEqual(chain(depth, false), chain(depth, false))),
      structuredClone: largest((depth) => structuredClone(chain(depth, false))),
      clone: largest((depth) => clone(chain(depth, false))),
      cloneCyclic: largest((depth) => clone(chain(depth, true))),
      stableEquals: largest((depth) => stableEquals(chain(depth, false), chain(depth, false))),
      stableEqualsCyclic: largest((depth) => stableEquals(chain(depth, true), chain(depth, true))),
    };
    process.stderr.write(`DEPTHS ${JSON.stringify(depths)}\n`);
    expect(depths.clone).toBeGreaterThan(0);
  });
});
