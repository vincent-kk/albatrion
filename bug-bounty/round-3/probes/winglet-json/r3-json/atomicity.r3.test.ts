import { describe, expect, it } from 'vitest';

import { applyPatch, compare, difference, mergePatch } from '@/json';

// Round 3 json probes. Test names start with A (atomicity and immutability) or N (numbers).

const deepFreeze = <T>(value: T): T => {
  if (value !== null && typeof value === 'object') {
    for (const key of Object.keys(value)) deepFreeze((value as any)[key]);
    Object.freeze(value);
  }
  return value;
};

describe('A: immutable applyPatch and root add/replace values', () => {
  it('A1 root replace with a shared template, then add: the template is mutated', () => {
    const TEMPLATE = { name: '', tags: [] as string[] };
    const snapshot = structuredClone(TEMPLATE);
    const result = applyPatch({ old: true }, [
      { op: 'replace', path: '', value: TEMPLATE },
      { op: 'replace', path: '/name', value: 'x' },
    ]);
    expect(result).toEqual({ name: 'x', tags: [] });
    expect(TEMPLATE).toEqual(snapshot);
  });

  it('A1b control: the same value under a non-root path is not mutated', () => {
    const TEMPLATE = { name: '', tags: [] as string[] };
    const snapshot = structuredClone(TEMPLATE);
    const result = applyPatch({ old: true }, [
      { op: 'add', path: '/doc', value: TEMPLATE },
      { op: 'replace', path: '/doc/name', value: 'x' },
    ]);
    expect(result).toEqual({ old: true, doc: { name: 'x', tags: [] } });
    expect(TEMPLATE).toEqual(snapshot);
  });

  it('A2 root replace with a subtree of the source, then add: the source is mutated', () => {
    const source = { config: { debug: false }, other: 1 };
    const snapshot = structuredClone(source);
    const result = applyPatch(source, [
      { op: 'replace', path: '', value: source.config },
      { op: 'add', path: '/verbose', value: true },
    ]);
    expect(result).toEqual({ debug: false, verbose: true });
    expect(source).toEqual(snapshot);
  });

  it('A2b deeply frozen source: root replace with its subtree, then a nested write throws', () => {
    const source = deepFreeze({ config: { flags: { a: 1 } } });
    expect(() =>
      applyPatch(source, [
        { op: 'replace', path: '', value: source.config },
        { op: 'add', path: '/flags/b', value: 2 },
      ]),
    ).not.toThrow();
  });

  it('A3 a failing batch after a root add leaves the caller value changed (not atomic)', () => {
    const value = { a: 1 };
    const snapshot = structuredClone(value);
    expect(() =>
      applyPatch({}, [
        { op: 'add', path: '', value },
        { op: 'add', path: '/b', value: 2 },
        { op: 'remove', path: '/missing' },
      ]),
    ).toThrow();
    expect(value).toEqual(snapshot);
  });

  it('A4 applying the same patch list twice gives different results', () => {
    const patches = [
      { op: 'replace' as const, path: '', value: { a: 1, b: 2 } },
      { op: 'remove' as const, path: '/b' },
    ];
    const first = applyPatch({}, patches);
    expect(first).toEqual({ a: 1 });
    let second: unknown;
    let error: unknown;
    try {
      second = applyPatch({}, patches);
    } catch (caught) {
      error = caught;
    }
    expect(error).toBeUndefined();
    expect(second).toEqual({ a: 1 });
  });

  it('A5 root add of an array, then append: the caller array grows', () => {
    const items = [1, 2];
    applyPatch({}, [
      { op: 'add', path: '', value: items },
      { op: 'add', path: '/-', value: 3 },
    ]);
    expect(items).toEqual([1, 2]);
  });

  it('A6 control: root copy then write leaves the source intact', () => {
    const source = { a: { b: 1 } };
    const snapshot = structuredClone(source);
    applyPatch(source, [
      { op: 'copy', from: '/a', path: '' },
      { op: 'add', path: '/c', value: 2 },
    ]);
    expect(source).toEqual(snapshot);
  });

  it('A7 control: root move then write leaves the source intact', () => {
    const source = { a: { b: 1 } };
    const snapshot = structuredClone(source);
    applyPatch(source, [
      { op: 'move', from: '/a', path: '' },
      { op: 'add', path: '/c', value: 2 },
    ]);
    expect(source).toEqual(snapshot);
  });

  it('A9 reference: fast-json-patch 3.1.1 without mutateDocument, same root replace then write', async () => {
    const jsonpatch: any = await import('fast-json-patch');
    const TEMPLATE = { name: '' };
    jsonpatch.applyPatch(
      { old: true },
      [
        { op: 'replace', path: '', value: TEMPLATE },
        { op: 'replace', path: '/name', value: 'x' },
      ],
      false,
      false,
    );
    // Passes when the reference leaves the template alone
    expect(TEMPLATE).toEqual({ name: '' });
  });

  it('A8 control: immutable failing batch without root ops leaves the source intact', () => {
    const source = { a: { b: [1, 2] }, c: 1 };
    const snapshot = structuredClone(source);
    expect(() =>
      applyPatch(source, [
        { op: 'add', path: '/a/b/-', value: 3 },
        { op: 'move', from: '/a/b/0', path: '/c' },
        { op: 'remove', path: '/a/b/5' },
      ]),
    ).toThrow();
    expect(source).toEqual(snapshot);
  });
});

describe('N: numbers in compare, test and difference', () => {
  it('N1 test treats -0 and 0 as equal at every depth (RFC 6902 4.6 numeric equality)', () => {
    expect(() =>
      applyPatch({ a: 0, b: [0], c: { d: -0 } }, [
        { op: 'test', path: '/a', value: -0 },
        { op: 'test', path: '/b', value: [-0] },
        { op: 'test', path: '/c', value: { d: 0 } },
        { op: 'test', path: '', value: { a: -0, b: [0], c: { d: 0 } } },
      ]),
    ).not.toThrow();
  });

  it('N2 compare and difference agree on -0 versus 0 and on large numbers', () => {
    const source = JSON.parse('{"a":0,"b":1e21,"c":9007199254740993,"d":[0]}');
    const target = JSON.parse('{"a":-0,"b":1e21,"c":9007199254740992,"d":[-0]}');
    expect(compare(source, target)).toEqual([]);
    expect(difference(source, target)).toBeUndefined();
    // JSON cannot tell -0 from 0, so compare serialized forms
    expect(JSON.stringify(mergePatch(source, difference(source, target)))).toBe(
      JSON.stringify(target),
    );
  });

  it('N3 compare round trip with -0 values through applyPatch', () => {
    const source = { a: [1, 2], b: { c: 0 } };
    const target = { a: [-0], b: { c: -0, d: 1e300 } };
    const patches = compare(source, target, { strict: true });
    expect(JSON.stringify(applyPatch(source, patches))).toBe(
      JSON.stringify(target),
    );
  });
});
