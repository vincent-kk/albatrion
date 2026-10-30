import { describe, expect, it } from 'vitest';

import { getHostDerived } from '../../../../../utils/cache/derivedRecords';
import { assembleObject } from '../assembleObject';
import { assembleObjectBaseline } from './fixtures/assembleObject.baseline';

const fixture = () => {
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
    local: {},
    undeclaredValues: undefined,
    schema: { schema: { type: 'object' }, typeConflict: false },
    blueprintNode: { childEntries: observed },
  } as unknown as Parameters<typeof assembleObject>[0];
  const index = new Map<string, Map<object, number>>([
    ['alpha', new Map([[first, 0], [replacement, 2]])],
    ['beta', new Map([[second, 1]])],
  ]);
  getHostDerived<'childOrderIndex', typeof index>(
    node.blueprintNode,
  ).childOrderIndex = index;
  const children = [
    { name: 'beta', emit: 2 },
    { name: 'alpha', emit: 1, blueprintNode: replacement },
  ];
  return { node, children, reads: () => reads };
};

// filid:contract object-active-order
describe('prepared active-name order', () => {
  it('avoids dormant entry visits with an existing complete name index', () => {
    const { node, children, reads } = fixture();
    expect(Object.keys(assembleObject(node, children) as object)).toEqual([
      'alpha',
      'beta',
    ]);
    expect(reads()).toBe(0);
  });

  it('uses first name occurrence rather than the active replacement template rank', () => {
    const { node, children } = fixture();
    const expected = assembleObjectBaseline(node, children);
    expect(assembleObject(node, children)).toEqual(expected);
    expect(Object.keys(assembleObject(node, children) as object)).toEqual([
      'alpha',
      'beta',
    ]);
  });

  it.each(['missing-index', 'missing-name'])('falls back for %s', (reason) => {
    const { node, children, reads } = fixture();
    const derived = getHostDerived<
      'childOrderIndex',
      Map<string, Map<object, number>>
    >(node.blueprintNode);
    if (reason === 'missing-index') delete derived.childOrderIndex;
    else derived.childOrderIndex!.delete('alpha');
    expect(Object.keys(assembleObject(node, children) as object)).toEqual([
      'alpha',
      'beta',
    ]);
    expect(reads()).toBeGreaterThan(0);
  });

  it('preserves preferred and extra ordering, omission, NaN and equal-result identity', () => {
    const { node, children } = fixture();
    node.schema = {
      schema: { type: 'object', options: { propertyOrder: ['extra', 'beta'] } },
      typeConflict: false,
    } as typeof node.schema;
    node.undeclaredValues = { extra: NaN, absent: undefined };
    children[0].emit = NaN;
    const expected = assembleObjectBaseline(node, children);
    const result = assembleObject(node, children);
    expect(result).toEqual(expected);
    expect(Object.keys(result as object)).toEqual([
      'extra',
      'beta',
      'alpha',
      'absent',
    ]);
    node.local = result;
    expect(assembleObject(node, children)).toBe(result);
  });
});
