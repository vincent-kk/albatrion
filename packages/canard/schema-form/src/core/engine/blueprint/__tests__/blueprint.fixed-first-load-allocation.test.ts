import { expect, it } from 'vitest';

import { blueprint } from '../blueprint';
import { buildFixedFirstLoadPlan } from '../utils/staticFirst/buildFixedFirstLoadPlan';

/** Benchmark-shaped root conditional with 500 unconstrained terminal fields. */
const schema = {
  type: 'object',
  properties: {
    kind: { type: 'string', default: 'a' },
    ...Object.fromEntries(
      Array.from({ length: 500 }, (_, index) => [
        `field_${index}`,
        { type: 'string' },
      ]),
    ),
  },
  if: { properties: { kind: { const: 'a' } } },
  then: { properties: { field_0: { minLength: 2 } } },
};

it('preserves the complete plan, borrowed entries and frozen affected order', () => {
  const analysis = blueprint(schema);
  const root = analysis.root;
  const plan = buildFixedFirstLoadPlan(analysis, true)!;
  const expected = {
    hosts: {
      [root.id]: {
        entries: root.childEntries,
        affected: [root.childEntries.find((entry) => entry.name === 'field_0')],
      },
    },
  };
  expect(plan).toEqual(expected);
  expect(plan).toEqual(analysis.fixedFirstLoadPlan);
  expect(plan.hosts[root.id].entries).toBe(root.childEntries);
  expect(Object.isFrozen(plan.hosts[root.id].affected)).toBe(true);
  expect(Object.isFrozen(plan.hosts[root.id])).toBe(true);
  expect(Object.isFrozen(plan.hosts)).toBe(true);
  expect(Object.isFrozen(plan)).toBe(true);
});

it('allocates a child-name Map only for the object host, never its 501 terminals', () => {
  const analysis = blueprint(schema);
  const OriginalMap = globalThis.Map;
  let allocations = 0;
  class CountingMap<K, V> extends OriginalMap<K, V> {
    constructor(entries?: Iterable<readonly [K, V]> | null) {
      super(entries);
      allocations++;
    }
  }
  try {
    globalThis.Map = CountingMap;
    buildFixedFirstLoadPlan(analysis, true);
  } finally {
    globalThis.Map = OriginalMap;
  }
  expect(allocations).toBe(1);
});
