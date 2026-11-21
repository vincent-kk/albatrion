import { describe, expect, it } from 'vitest';

import { clone } from '../clone';
import { cloneLite } from '../cloneLite';
import { equals } from '../equals/equals';
import { stableEquals } from '../equals/utils/stableEquals';

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
