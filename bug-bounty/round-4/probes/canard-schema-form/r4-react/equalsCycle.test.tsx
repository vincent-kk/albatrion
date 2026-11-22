import { equals } from '@winglet/common-utils/object';
import { expect, it } from 'vitest';

/**
 * Diagnostic for the context-cycle finding: how the comparator that schema-form used before the
 * round 3 item 7 fix (useSnapshot with @winglet/common-utils equals) treats the same input.
 * Run with this folder's vitest.config.ts so equals loads from src.
 */
it('[diagnostic] source equals on two isomorphic cyclic contexts', () => {
  const reads = { count: 0 };
  const make = () => {
    const node: Record<string, unknown> = { role: 'admin' };
    Object.defineProperty(node, 'self', {
      enumerable: true,
      get() {
        if (++reads.count > 100_000) throw new Error('did not terminate');
        return node;
      },
    });
    return { graph: node };
  };
  let outcome: string;
  try {
    outcome = 'returned ' + String(equals(make(), make()));
  } catch (error) {
    outcome = (error as Error).name + ': ' + (error as Error).message;
  }
  expect(outcome).toBe('diagnostic');
});
