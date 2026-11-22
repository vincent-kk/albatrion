import { describe, expect, it } from 'vitest';

import {
  applyPatch,
  convertJSONPathToPointer,
  convertJSONPointerToPath,
  getValue,
  mergePatch,
} from '@/json';

describe('convertJSONPointerToPath and convertJSONPathToPointer as an inverse pair (RG1 of round 4 item 3)', () => {
  const document = { '': { x: 1 }, x: 2, a: { '': { b: 3 }, b: 4 } };

  it('control: an ordinary pointer round-trips', () => {
    expect(convertJSONPathToPointer(convertJSONPointerToPath('/users/0/name'))).toBe('/users/0/name');
  });

  for (const pointer of ['//x', '/a//b'])
    it(`${pointer} round-trips to a pointer that reads the same value`, () => {
      const path = convertJSONPointerToPath(pointer);
      const back = convertJSONPathToPointer(path);
      expect({ path, back, value: getValue(document, back) }).toEqual({
        path,
        back: pointer,
        value: getValue(document, pointer),
      });
    });
});

const prototypeName = (value: object | null) =>
  value === null ? 'null' : value === Object.prototype ? 'Object.prototype' : 'other';

describe('applyPatch on a null-prototype dictionary: immutable against mutable (EQ11)', () => {
  const makeSource = () => {
    const root = Object.assign(Object.create(null), { users: Object.assign(Object.create(null), { alice: 1 }) });
    return root as Record<string, any>;
  };

  for (const immutable of [true, false])
    it(`immutable=${immutable}: the result root and the written container keep a null prototype`, () => {
      const result = applyPatch(makeSource(), [{ op: 'add', path: '/users/bob', value: 2 }], { immutable });
      expect({
        root: prototypeName(Object.getPrototypeOf(result)),
        users: prototypeName(Object.getPrototypeOf(result.users)),
        constructorLookup: typeof result.users.constructor,
      }).toEqual({ root: 'null', users: 'null', constructorLookup: 'undefined' });
    });

  it('mergePatch keeps the null prototype of the same source (control for the sibling)', () => {
    const result = mergePatch(makeSource() as any, { users: { bob: 2 } }) as Record<string, any>;
    expect({
      root: prototypeName(Object.getPrototypeOf(result)),
      users: prototypeName(Object.getPrototypeOf(result.users)),
    }).toEqual({ root: 'null', users: 'null' });
  });
});
