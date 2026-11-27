import { describe, expect, it } from 'vitest';

import { clone } from '../index';
import { stableEquals } from '../index';

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

  it('stableEquals does not overflow on a deeply nested circular structure (JSDoc: no risk of stack overflow)', () => {
    expect(
      outcome(() => stableEquals(chain(depth, true), chain(depth, true))),
    ).toBe('returned');
    expect(stableEquals(chain(depth, true), chain(depth, true))).toBe(true);
    const different = chain(depth, true);
    let tail: Record<string, unknown> = different;
    while (tail.next) tail = tail.next as Record<string, unknown>;
    tail.value = -1;
    expect(stableEquals(chain(depth, true), different)).toBe(false);
  });

  it('clone copies a deeply nested circular structure (the documented choice for cycles)', () => {
    expect(outcome(() => clone(chain(depth, true)))).toBe('returned');
  });
});
