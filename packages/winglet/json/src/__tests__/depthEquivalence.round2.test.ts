import { cloneLite } from '@winglet/common-utils/object';
import { describe, expect, it } from 'vitest';
import { applyPatch, compare, difference, mergePatch } from '../index';
import type { JSONObject } from '../type';

const nest = (leaf: JSONObject, depth: number): JSONObject => {
  while (depth--) leaf = { k: leaf };
  return leaf;
};
const leafOf = (value: unknown): unknown => {
  while (value !== null && typeof value === 'object' && 'k' in value) value = value.k;
  return value;
};
const cases: Array<{ name: string; run: (source: JSONObject, target: JSONObject) => unknown }> = [
  { name: 'cloneLite', run: source => cloneLite(source) },
  { name: 'compare', run: (source, target) => applyPatch(source, compare(source, target)) },
  { name: 'difference', run: (source, target) => difference(source, target) },
  { name: 'immutable mergePatch', run: (source, target) => mergePatch(source, target) },
  { name: 'mutable mergePatch', run: (source, target) => mergePatch(source, target, false) },
  { name: 'applyPatch test', run: source => applyPatch({ document: source }, [{ op: 'test', path: '/document', value: cloneLite(source) }]).document },
];

describe('round-2 json 7: deep document equivalence across operations', () => {
  it.each(cases)('$name produces the same leaf as a shallow document', ({ run }) => {
    const expected = run({ value: 1 }, { value: 2 });
    const result = run(nest({ value: 1 }, 10000), nest({ value: 2 }, 10000));
    expect(leafOf(result)).toEqual(expected);
  });
});
