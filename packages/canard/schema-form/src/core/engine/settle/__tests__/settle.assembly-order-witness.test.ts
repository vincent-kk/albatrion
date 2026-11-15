import { expect, it } from 'vitest';

import { objectBehavior } from '../../behaviors/objectBehavior';
import { getSlotChildIndex } from '../utils/slots/getSlotChildIndex';

// filid:contract settle-assembly-order-witness
it('connects the real slot order writer to object assembly without dormant visits', () => {
  const first = {},
    second = {},
    replacement = {};
  const entries = [
    { name: 'alpha', node: first },
    { name: 'beta', node: second },
    { name: 'alpha', node: replacement },
    ...Array.from({ length: 80 }, (_, rank) => ({
      name: 'dormant' + rank,
      node: {},
    })),
  ];
  let reads = 0;
  const observed = new Proxy(entries, {
    get(target, name, receiver) {
      if (typeof name === 'string' && /^\d+$/.test(name)) reads++;
      return Reflect.get(target, name, receiver);
    },
  });
  const node = {
    runtime: {},
    storedValue: {},
    extras: undefined,
    schema: { schema: { type: 'object' }, hasTypeConflict: false },
    blueprintNode: { childEntries: observed },
  } as unknown as Parameters<typeof objectBehavior.branch.assemble>[0];
  expect(
    getSlotChildIndex(
      node.blueprintNode,
      'alpha',
      node.blueprintNode.childEntries[0].node,
    ),
  ).toBe(0);
  expect(reads).toBeGreaterThan(0);
  reads = 0;
  const result = objectBehavior.branch.assemble(node, [
    { name: 'beta', storedOutputValue: 2 },
    { name: 'alpha', storedOutputValue: 1, blueprintNode: replacement },
  ]);
  expect(result).toEqual({ alpha: 1, beta: 2 });
  expect(Object.keys(result as object)).toEqual(['alpha', 'beta']);
  expect(reads).toBe(0);
});
