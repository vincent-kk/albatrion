import { describe, expect, it } from 'vitest';

import { getValue, setValue } from '../../JSONPointer/utils/manipulator';
import {
  applyPatch,
  compare,
  difference,
  mergePatch,
} from '../../JSONPointer/utils/patch';
import {
  escapePath,
  escapeSegment,
  unescapePath,
} from '../../JSONPointer/utils/escape';
import { convertJSONPointerToPath } from '../../JSONPointer/utils/common';

const throws = (fn: () => unknown) => {
  try {
    fn();
    return false;
  } catch {
    return true;
  }
};

describe('bounty json probes', () => {
  it('P1 RFC 6902 A.2 add into array middle', () => {
    expect(
      applyPatch({ foo: ['bar', 'baz'] }, [
        { op: 'add', path: '/foo/1', value: 'qux' },
      ] as any),
    ).toEqual({ foo: ['bar', 'qux', 'baz'] });
  });
  it('P2 add at index beyond length is an error (A.? / 4.1)', () => {
    expect(
      throws(() =>
        applyPatch({ foo: ['bar'] }, [
          { op: 'add', path: '/foo/5', value: 'x' },
        ] as any),
      ),
    ).toBe(true);
  });
  it('P3 add at index == length appends', () => {
    expect(
      applyPatch({ foo: ['bar'] }, [
        { op: 'add', path: '/foo/1', value: 'x' },
      ] as any),
    ).toEqual({ foo: ['bar', 'x'] });
  });
  it('P4 remove nonexistent is an error', () => {
    expect(
      throws(() => applyPatch({ a: 1 }, [{ op: 'remove', path: '/b' }] as any)),
    ).toBe(true);
  });
  it('P5 replace nonexistent is an error', () => {
    expect(
      throws(() =>
        applyPatch({ a: 1 }, [{ op: 'replace', path: '/b', value: 2 }] as any),
      ),
    ).toBe(true);
  });
  it('P6 test failing value is an error (A.9) in default mode', () => {
    expect(
      throws(() =>
        applyPatch({ baz: 'qux' }, [
          { op: 'test', path: '/baz', value: 'bar' },
        ] as any),
      ),
    ).toBe(true);
  });
  it('P7 test deep equality ignores key order (A.8)', () => {
    expect(
      throws(() =>
        applyPatch({ a: { x: 1, y: [1, { z: 2 }] } }, [
          { op: 'test', path: '/a', value: { y: [1, { z: 2 }], x: 1 } },
        ] as any, { strict: true }),
      ),
    ).toBe(false);
  });
  it('P8 test for missing location is an error', () => {
    expect(
      throws(() =>
        applyPatch({ a: 1 }, [
          { op: 'test', path: '/b', value: null },
        ] as any, { strict: true }),
      ),
    ).toBe(true);
  });
  it('P9 leading-zero array index is invalid', () => {
    expect(
      throws(() =>
        applyPatch({ a: [1, 2] }, [{ op: 'remove', path: '/a/01' }] as any),
      ),
    ).toBe(true);
  });
  it('P10 move into own child is an error', () => {
    expect(
      throws(() =>
        applyPatch({ a: { b: {} } }, [
          { op: 'move', from: '/a', path: '/a/b/c' },
        ] as any),
      ),
    ).toBe(true);
  });
  it('P11 move from==path is a no-op', () => {
    expect(
      applyPatch({ a: 1 }, [{ op: 'move', from: '/a', path: '/a' }] as any),
    ).toEqual({ a: 1 });
  });
  it('P12 copy deep-copies the value', () => {
    const result: any = applyPatch({ a: { x: 1 } }, [
      { op: 'copy', from: '/a', path: '/b' },
      { op: 'add', path: '/b/x', value: 2 },
    ] as any);
    expect(result).toEqual({ a: { x: 1 }, b: { x: 2 } });
  });
  it('P12b copy deep-copies with immutable false', () => {
    const result: any = applyPatch(
      { a: { x: 1 } },
      [
        { op: 'copy', from: '/a', path: '/b' },
        { op: 'add', path: '/b/x', value: 2 },
      ] as any,
      { immutable: false },
    );
    expect(result).toEqual({ a: { x: 1 }, b: { x: 2 } });
  });
  it('P13 add with empty-string key path "/"', () => {
    expect(applyPatch({}, [{ op: 'add', path: '/', value: 1 }] as any)).toEqual(
      { '': 1 },
    );
  });
  it('P14 add to missing parent is an error (A.12)', () => {
    expect(
      throws(() =>
        applyPatch({ q: { bar: 2 } }, [
          { op: 'add', path: '/a/b', value: 1 },
        ] as any),
      ),
    ).toBe(true);
  });
  it('P15 immutable failure leaves source unchanged', () => {
    const source = { a: [1, 2], b: 1 };
    throws(() =>
      applyPatch(source, [
        { op: 'add', path: '/a/0', value: 0 },
        { op: 'remove', path: '/zzz' },
      ] as any),
    );
    expect(source).toEqual({ a: [1, 2], b: 1 });
  });
  it('P17 remove "-" index is an error', () => {
    expect(
      throws(() => applyPatch({ a: [1] }, [{ op: 'remove', path: '/a/-' }] as any)),
    ).toBe(true);
  });
  it('P18 move array element (A.7)', () => {
    expect(
      applyPatch({ foo: ['all', 'grass', 'cows', 'eat'] }, [
        { op: 'move', from: '/foo/1', path: '/foo/3' },
      ] as any),
    ).toEqual({ foo: ['all', 'cows', 'eat', 'grass'] });
  });
  it('P19 replace root', () => {
    expect(
      applyPatch({ a: 1 }, [{ op: 'replace', path: '', value: { b: 2 } }] as any),
    ).toEqual({ b: 2 });
  });
  it('P20 test number 1 equals 1.0 and strings with ~ (A.14)', () => {
    expect(
      throws(() =>
        applyPatch({ '/': 9, '~1': 10 }, [
          { op: 'test', path: '/~01', value: 10 },
        ] as any, { strict: true }),
      ),
    ).toBe(false);
  });
  it('P21 compare round trips through applyPatch for arrays', () => {
    const cases: Array<[any, any]> = [
      [{ a: [1, 2, 3] }, { a: [3] }],
      [{ a: [1, 2, 3] }, { a: [1, 2, 3, 4, 5] }],
      [[1, 2, 3], [4]],
      [{ a: [{ x: 1 }, { y: 2 }] }, { a: [{ y: 2 }] }],
      [{ 'a/b': 1, 'c~d': { e: 1 } }, { 'a/b': 2, 'c~d': {} }],
      [{ a: null }, { a: { b: 1 } }],
      [{ a: { b: 1 } }, { a: null }],
      [{ a: [1] }, { a: { 0: 1 } }],
      [{ '': 1 }, { '': 2 }],
      [{ a: undefined, b: 1 }, { b: 1 }],
    ];
    for (const [s, t] of cases) {
      const patches = compare(s, t);
      expect(applyPatch(s, patches)).toEqual(t);
    }
  });
  it('P22 mergePatch RFC 7396 appendix A cases', () => {
    const cases: Array<[any, any, any]> = [
      [{ a: 'b' }, { a: 'c' }, { a: 'c' }],
      [{ a: 'b' }, { b: 'c' }, { a: 'b', b: 'c' }],
      [{ a: 'b' }, { a: null }, {}],
      [{ a: 'b', b: 'c' }, { a: null }, { b: 'c' }],
      [{ a: ['b'] }, { a: 'c' }, { a: 'c' }],
      [{ a: 'c' }, { a: ['b'] }, { a: ['b'] }],
      [{ a: { b: 'c' } }, { a: { b: 'd', c: null } }, { a: { b: 'd' } }],
      [{ a: [{ b: 'c' }] }, { a: [1] }, { a: [1] }],
      [['a', 'b'], ['c', 'd'], ['c', 'd']],
      [{ a: 'b' }, ['c'], ['c']],
      [{ a: 'foo' }, null, null],
      [{ a: 'foo' }, 'bar', 'bar'],
      [{ e: null }, { a: 1 }, { e: null, a: 1 }],
      [[1, 2], { a: 'b', c: null }, { a: 'b' }],
      [{}, { a: { bb: { ccc: null } } }, { a: { bb: {} } }],
    ];
    for (const [s, p, r] of cases)
      expect({ s, p, out: mergePatch(s, p) }).toEqual({ s, p, out: r });
  });
  it('P24 pointer edge cases', () => {
    expect(getValue({ '': 1 } as any, '/')).toBe(1);
    expect(getValue({ a: { '': 2 } } as any, '/a/')).toBe(2);
    expect(getValue({ '~1': 3 } as any, '/~01')).toBe(3);
    expect(convertJSONPointerToPath('/~01')).toEqual(['~1']);
    expect(unescapePath(escapePath('/a~1b'))).toBe('/a~1b');
    expect(escapeSegment('~1')).toBe('~01');
    expect(throws(() => getValue({ a: [1, 2] } as any, '/a/01'))).toBe(true);
    expect(throws(() => getValue({ a: 1 } as any, 'a'))).toBe(true);
  });
  it('P25 setValue with "-" on nested new array and with leading zero', () => {
    const doc: any = { a: [1, 2] };
    setValue(doc, '/a/-', 3);
    expect(doc.a).toEqual([1, 2, 3]);
    const doc2: any = { a: [1, 2] };
    expect(throws(() => setValue(doc2, '/a/01', 9)) || doc2.a[1] !== 9).toBe(true);
  });
  it('P26 getValue does not read inherited properties for missing keys', () => {
    expect(throws(() => getValue({} as any, '/toString'))).toBe(true);
    expect(throws(() => getValue({ a: [1] } as any, '/a/length'))).toBe(true);
  });
});
