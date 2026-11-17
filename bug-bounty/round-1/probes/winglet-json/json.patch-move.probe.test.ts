import { describe, expect, it } from 'vitest';

import { applyPatch } from '../../JSONPointer/utils/patch';
import { convertJSONPointerToPath } from '../../JSONPointer/utils/common';

const run = (source: any, patches: any[], options?: any) => {
  try {
    return { value: applyPatch(source, patches, options) };
  } catch (error) {
    return { error: (error as any).code ?? String(error) };
  }
};

describe('bounty json patch move/copy probes', () => {
  it.each([true, false])(
    'M1 RFC 6902 A.7 move array element inserts (immutable %s)',
    (immutable) => {
      expect(
        run(
          { foo: ['all', 'grass', 'cows', 'eat'] },
          [{ op: 'move', from: '/foo/1', path: '/foo/3' }],
          { immutable },
        ),
      ).toEqual({ value: { foo: ['all', 'cows', 'eat', 'grass'] } });
    },
  );
  it('M2 move from array element to object key removes the element', () => {
    expect(
      run({ a: [1, 2, 3] }, [{ op: 'move', from: '/a/0', path: '/b' }]),
    ).toEqual({ value: { a: [2, 3], b: 1 } });
  });
  it('M3 copy into array index inserts (copy behaves like add)', () => {
    expect(
      run({ a: [1, 2, 3], x: 9 }, [{ op: 'copy', from: '/x', path: '/a/1' }]),
    ).toEqual({ value: { a: [1, 9, 2, 3], x: 9 } });
  });
  it('M4 move into same array index (from == path) is a no-op', () => {
    expect(
      run({ a: [1, 2] }, [{ op: 'move', from: '/a/0', path: '/a/0' }]),
    ).toEqual({ value: { a: [1, 2] } });
  });
  it('M5 move child over its parent (from is below path)', () => {
    expect(
      run({ a: { b: 1 } }, [{ op: 'move', from: '/a/b', path: '/a' }]),
    ).toEqual({ value: { a: 1 } });
  });
  it('M6 copy into own descendant is allowed by RFC 6902 4.5', () => {
    expect(
      run({ a: { x: 1 } }, [{ op: 'copy', from: '/a', path: '/a/y' }]),
    ).toEqual({ value: { a: { x: 1, y: { x: 1 } } } });
  });
  it('M7 replace of a missing object member is an error even in strict mode', () => {
    expect(
      run({ a: 1 }, [{ op: 'replace', path: '/b', value: 2 }], { strict: true }),
    ).toHaveProperty('error');
  });
  it('M8 test op in default (non-strict) mode compares values', () => {
    expect(
      run({ status: 'published' }, [
        { op: 'test', path: '/status', value: 'draft' },
        { op: 'replace', path: '/status', value: 'archived' },
      ]),
    ).toHaveProperty('error');
  });
  it('M9 leading-zero array index rejected in strict mode', () => {
    expect(
      run({ a: [1, 2] }, [{ op: 'remove', path: '/a/01' }], { strict: true }),
    ).toHaveProperty('error');
  });
  it('M10 move source array is not mutated in immutable mode', () => {
    const source = { foo: ['a', 'b', 'c'] };
    run(source, [{ op: 'move', from: '/foo/0', path: '/bar' }]);
    expect(source).toEqual({ foo: ['a', 'b', 'c'] });
  });
  it('M11 convertJSONPointerToPath unescapes ~1 and ~0 tokens', () => {
    expect(convertJSONPointerToPath('/a~1b/c~0d')).toEqual(
      convertJSONPointerToPath('/x').startsWith('.') ? '.["a/b"]["c~d"]' : ['a/b', 'c~d'],
    );
  });
});
