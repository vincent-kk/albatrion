import { describe, expect, it } from 'vitest';

import { assembleObject } from '../assembleObject';
import { assembleObjectBaseline } from './fixtures/assembleObject.baseline';

/** Sparse declarations force the general path; only two child projections are live. */
const fixture = () => {
  const entries = [
    { name: 'a' },
    ...Array.from({ length: 240 }, (_, i) => ({ name: 'gap_' + i })),
    { name: 'b' },
    { name: 'a' },
  ];
  const node = {
    runtime: {},
    local: undefined,
    undeclaredValues: { tail: 9, blocked: 10 },
    schema: {
      schema: { type: 'object', options: { propertyOrder: ['tail', 'tail'] } },
      typeConflict: false,
    },
    blueprintNode: { childEntries: entries },
  } as unknown as Parameters<typeof assembleObject>[0];
  const children = [
    { name: 'b', emit: 2 },
    { name: 'a', emit: 1 },
    { name: 'blocked', emit: undefined },
  ];
  return { node, children, entries };
};

describe('B2-P3 active object assembly', () => {
  it('preserves first declaration order, extras and undefined-child blocking', () => {
    const { node, children } = fixture();
    const baseline = fixture();
    const actual = assembleObject(node, children);
    expect(actual).toEqual(
      assembleObjectBaseline(baseline.node, baseline.children),
    );
    expect(Object.keys(actual as object)).toEqual(['tail', 'a', 'b']);
  });

  it('does not read inactive entries after blueprint order preparation', () => {
    const { node, children, entries } = fixture();
    assembleObject(node, children);
    let visits = 0;
    for (let index = 0; index < entries.length; index++) {
      const entry = entries[index];
      Object.defineProperty(entries, index, {
        get: () => {
          visits++;
          return entry;
        },
      });
    }
    const baseline = fixture();
    expect(assembleObject(node, [...children])).toEqual(
      assembleObjectBaseline(baseline.node, baseline.children),
    );
    expect(visits).toBe(0);
  });
});
