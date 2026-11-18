import { describe, expect, it } from 'vitest';
import type { JSONObject, JSONValue } from '../../../../type';
import { difference } from '../difference/difference';
import { mergePatch } from '../mergePatch/mergePatch';

describe('round-2 json 4: reserved member round trips', () => {
  it.each(['__proto__', 'constructor', 'prototype'])('round trips %s like ordinary data', key => {
    const ordinary = mergePatch({}, difference({}, { item: { x: 1 } }));
    const result = mergePatch({}, difference({}, { [key]: { x: 1 } }));
    expect(Object.getOwnPropertyDescriptor(result, key)?.value).toEqual(Object.getOwnPropertyDescriptor(ordinary, 'item')?.value);
    expect(Object.getPrototypeOf(result)).toBe(Object.getPrototypeOf(ordinary));
    expect(mergePatch({ [key]: 1, a: 1 }, difference({ [key]: 1, a: 1 }, { a: 1 }))).toEqual(mergePatch({ item: 1, a: 1 }, difference({ item: 1, a: 1 }, { a: 1 })));
  });
});

describe('round-2 json 7: merge depth equivalence', () => {
  const deep = (leaf: JSONValue): JSONObject => {
    let node: JSONObject = { leaf };
    for (let depth = 0; depth < 10000; depth++) node = { k: node };
    return node;
  };
  const leafOf = (node: JSONValue | undefined): JSONValue | undefined => {
    while (node && typeof node === 'object' && !Array.isArray(node) && 'k' in node) node = node.k;
    return node;
  };
  it('deep difference matches shallow leaves', () => {
    expect(leafOf(difference(deep(1), deep(2)))).toEqual(difference({ leaf: 1 }, { leaf: 2 }));
  });
  it('deep merge matches shallow leaves', () => {
    expect(leafOf(mergePatch(deep(1), deep(2)))).toEqual(mergePatch({ leaf: 1 }, { leaf: 2 }));
  });
});
