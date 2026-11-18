import { cloneLite } from '@winglet/common-utils/object';
import { describe, expect, it } from 'vitest';

import { applyPatch, compare, difference, mergePatch } from '../index';
import type { JSONObject } from '../type';

const nest = (leaf: JSONObject, depth: number): JSONObject => {
  while (depth--) leaf = { k: leaf };
  return leaf;
};
const leafOf = (value: unknown): unknown => {
  while (value !== null && typeof value === 'object' && 'k' in value)
    value = value.k;
  return value;
};
const cases: Array<{
  name: string;
  run: (source: JSONObject, target: JSONObject) => unknown;
}> = [
  { name: 'cloneLite', run: (source) => cloneLite(source) },
  {
    name: 'compare',
    run: (source, target) => applyPatch(source, compare(source, target)),
  },
  { name: 'difference', run: (source, target) => difference(source, target) },
  {
    name: 'immutable mergePatch',
    run: (source, target) => mergePatch(source, target),
  },
  {
    name: 'mutable mergePatch',
    run: (source, target) => mergePatch(source, target, false),
  },
  {
    name: 'applyPatch test',
    run: (source) =>
      applyPatch({ document: source }, [
        { op: 'test', path: '/document', value: cloneLite(source) },
      ]).document,
  },
];

describe('round-2 json 7: deep document equivalence across operations', () => {
  it.each([
    'cloneLite',
    'compare',
    'difference',
    'immutable mergePatch',
    'mutable mergePatch',
    'applyPatch test',
  ])(
    '%s produces the same leaf as a shallow document',
    (name) => {
      const run = cases.find((candidate) => candidate.name === name)?.run;
      if (!run) throw new Error('Missing operation: ' + name);
      const expected = run({ value: 1 }, { value: 2 });
      const result = run(nest({ value: 1 }, 10000), nest({ value: 2 }, 10000));
      expect(leafOf(result)).toEqual(expected);
    },
  );
});

describe('round-2 json 7: deep traversal preserves shallow policies', () => {
  it.each([false, true])(
    'preserves compare ordering and values (strict %s)',
    (strict) => {
      const source = { list: [1, 2, 3], value: { x: 1 }, removed: 4 };
      const target = { list: [9], value: [1, 2], added: 5 };
      const shallow = compare(source, target, { strict });
      const prefix = '/k'.repeat(300);
      const deep = compare(nest(source, 300), nest(target, 300), { strict });
      expect(
        deep.map((patch) => ({
          ...patch,
          path: patch.path.slice(prefix.length),
        })),
      ).toEqual(shallow);
    },
  );
  it('preserves reserved data, deletions and additions below a deep prefix', () => {
    const source = { ['__proto__']: { x: 1 }, remove: 2 };
    const target = { ['__proto__']: { x: 3 }, added: [1, 2] };
    const patch = difference(nest(source, 300), nest(target, 300));
    expect(leafOf(patch)).toEqual(difference(source, target));
    expect(leafOf(mergePatch(nest(source, 300), patch))).toEqual(
      mergePatch(source, difference(source, target)),
    );
  });
});

describe('round-2 json 7: serialization traversal order', () => {
  it('reads sibling values in the same order around toJSON at any depth', () => {
    const observe = (depth: number) => {
      const log: string[] = [];
      const date = new Date(0);
      date.toJSON = () => {
        log.push('serialize');
        return '0';
      };
      const source = {
        get first() {
          log.push('first');
          return date;
        },
        get second() {
          log.push('second');
          return 1;
        },
      };
      compare(
        nest(source, depth),
        nest({ first: new Date(1), second: 2 }, depth),
      );
      return log;
    };
    expect(observe(300)).toEqual(observe(0));
  });
});
