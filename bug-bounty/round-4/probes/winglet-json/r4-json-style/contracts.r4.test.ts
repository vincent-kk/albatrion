import { describe, expect, it } from 'vitest';

import {
  convertJSONPointerToPath,
  difference,
  getValue,
  mergePatch,
  setValue,
} from '../../index';

describe('r4 @winglet/json contracts', () => {
  it('SRC0 control: @winglet/common-utils is loaded from its source, not from dist', () => {
    let stack = '';
    const source = {};
    Object.defineProperty(source, 'x', {
      enumerable: true,
      get() {
        stack = new Error().stack ?? '';
        return 1;
      },
    });
    mergePatch(source, { y: 1 });
    expect(stack).toContain('common-utils/src/');
    expect(stack).not.toContain('common-utils/dist/');
  });

  describe('mergePatch: a member whose value is undefined', () => {
    it('JM1 a new member set to undefined leaves the target like an empty patch (immutable)', () => {
      const source = { name: 'a' };
      const viaUndefined = mergePatch<any>(source, { name: 'b', nickname: undefined });
      const viaAbsent = mergePatch<any>(source, { name: 'b' });
      expect(viaUndefined).toEqual(viaAbsent);
      expect('nickname' in viaUndefined).toBe(false);
    });

    it('JM1b the same with immutable: false', () => {
      const viaUndefined = mergePatch<any>({ name: 'a' }, { nickname: undefined }, false);
      expect(viaUndefined).toEqual({ name: 'a' });
    });

    it('JM1c a nested new member set to undefined does not become an empty object', () => {
      const result = mergePatch<any>({ profile: { name: 'a' } }, { profile: { age: undefined } });
      expect(result).toEqual({ profile: { name: 'a' } });
    });

    it('JM1d control: an existing member set to undefined is kept, as the package tests pin', () => {
      expect(mergePatch<any>({ a: 1 }, { a: undefined })).toEqual({ a: 1 });
    });

    it('JM1e control: difference treats an undefined member as absent, so the round trip has no extra member', () => {
      const target = { a: 1, b: undefined } as any;
      const patch = difference({ a: 0 }, target);
      expect(mergePatch<any>({ a: 0 }, patch as any)).toEqual({ a: 1 });
    });
  });

  describe('convertJSONPointerToPath: empty reference tokens (round 3 open lead)', () => {
    it('JC1 "//x" (member x under the empty key) does not convert to the same path as "/x"', () => {
      expect(convertJSONPointerToPath('//x')).not.toBe(convertJSONPointerToPath('/x'));
    });
    it('JC1b "/a//b" does not convert to the same path as "/a/b"', () => {
      expect(convertJSONPointerToPath('/a//b')).not.toBe(convertJSONPointerToPath('/a/b'));
    });
    it('JC1c control: the two documents differ at those pointers', () => {
      const doc = { '': { x: 1 }, x: 2 };
      expect(getValue(doc, '//x')).toBe(1);
      expect(getValue(doc, '/x')).toBe(2);
    });
  });

  describe('setValue: a primitive intermediate', () => {
    it('JS1 writing below a number fails with the documented JSONPointerError', () => {
      let error: any;
      try {
        setValue({ a: 5 }, '/a/b', 1);
      } catch (e) {
        error = e;
      }
      expect({ name: error?.name, isTypeError: error instanceof TypeError }).toEqual({
        name: 'JSONPointer',
        isTypeError: false,
      });
    });
  });
});
