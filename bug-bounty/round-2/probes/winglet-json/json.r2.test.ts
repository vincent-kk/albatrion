import * as fjp from 'fast-json-patch';
import { isEqual } from 'lodash';
import { describe, expect, it } from 'vitest';

import {
  applyPatch,
  compare,
  compilePointer,
  difference,
  escapeSegment,
  getJSONPath,
  getValue,
  mergePatch,
  setValue,
  unescapePath,
} from '../../index';
import { getJSONPointer } from '../../JSONPointer/utils/common';

const mulberry32 = (seed: number) => () => {
  seed |= 0;
  seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

const KEYS = ['a', 'b', 'c', '~', '/', 'a/b', '~1', '', '0', '1', 'x y', '-'];

const deepFreeze = <T>(value: T): T => {
  if (value && typeof value === 'object') {
    Object.freeze(value);
    for (const key of Object.keys(value)) deepFreeze((value as any)[key]);
  }
  return value;
};

const makeDoc = (rand: () => number, depth: number): any => {
  const pick = rand();
  if (depth <= 0 || pick < 0.3) {
    const p = rand();
    if (p < 0.4) return Math.floor(rand() * 10);
    if (p < 0.7) return KEYS[Math.floor(rand() * KEYS.length)];
    if (p < 0.85) return null;
    return rand() < 0.5;
  }
  if (pick < 0.6) {
    const out: any = {};
    const n = Math.floor(rand() * 4);
    for (let i = 0; i < n; i++)
      out[KEYS[Math.floor(rand() * KEYS.length)]] = makeDoc(rand, depth - 1);
    return out;
  }
  const n = Math.floor(rand() * 4);
  const out: any[] = [];
  for (let i = 0; i < n; i++) out.push(makeDoc(rand, depth - 1));
  return out;
};

type Loc = { path: string; parentIsArray: boolean | null; value: any };
const locations = (doc: any, path = '', parentIsArray: boolean | null = null, out: Loc[] = []) => {
  out.push({ path, parentIsArray, value: doc });
  if (doc && typeof doc === 'object') {
    const isArr = Array.isArray(doc);
    for (const key of Object.keys(doc))
      locations(doc[key], path + '/' + escapeSegment(key), isArr, out);
  }
  return out;
};

const randomOp = (rand: () => number, doc: any, allowMoveCopy: boolean) => {
  const locs = locations(doc);
  const containers = locs.filter((l) => l.value && typeof l.value === 'object');
  const nonRoot = locs.filter((l) => l.path !== '');
  const r = rand();
  if (r < 0.35 || nonRoot.length === 0) {
    const c = containers[Math.floor(rand() * containers.length)];
    if (Array.isArray(c.value)) {
      const idx = rand() < 0.2 ? '-' : String(Math.floor(rand() * (c.value.length + 1)));
      return { op: 'add', path: c.path + '/' + idx, value: makeDoc(rand, 2) };
    }
    const key = KEYS[Math.floor(rand() * KEYS.length)];
    return { op: 'add', path: c.path + '/' + escapeSegment(key), value: makeDoc(rand, 2) };
  }
  const l = nonRoot[Math.floor(rand() * nonRoot.length)];
  if (r < 0.6) return { op: 'remove', path: l.path };
  if (r < 0.8 || !allowMoveCopy) return { op: 'replace', path: l.path, value: makeDoc(rand, 2) };
  if (r < 0.9) return { op: 'test', path: l.path, value: JSON.parse(JSON.stringify(l.value)) };
  // move / copy only between object parents, never into own subtree (round-1 known bugs filtered)
  const objFrom = nonRoot.filter((x) => x.parentIsArray === false);
  if (objFrom.length === 0) return { op: 'remove', path: l.path };
  const from = objFrom[Math.floor(rand() * objFrom.length)];
  const objContainers = containers.filter(
    (c) => !Array.isArray(c.value) && c.path !== from.path && !c.path.startsWith(from.path + '/'),
  );
  if (objContainers.length === 0) return { op: 'remove', path: l.path };
  const dest = objContainers[Math.floor(rand() * objContainers.length)];
  const path = dest.path + '/' + escapeSegment(KEYS[Math.floor(rand() * KEYS.length)]);
  if (path === from.path || from.path.startsWith(path + '/')) return { op: 'remove', path: l.path };
  return { op: rand() < 0.5 ? 'move' : 'copy', from: from.path, path };
};

describe('r2-json @winglet/json', () => {
  it('J1 compare immutable:true clones the value of an object<->array type-change replace', () => {
    const target = { a: [1, 2] };
    const patches = compare({ a: { x: 1 } }, target);
    const replace = patches.find((p) => p.op === 'replace') as any;
    expect(replace.path).toBe('/a');
    expect(replace.value).toEqual([1, 2]);
    expect(replace.value).not.toBe(target.a);
    target.a.push(3);
    expect(replace.value).toEqual([1, 2]);
  });

  it('J1b compare immutable:true strict test value is not a live reference to source', () => {
    const source = { a: { x: 1 } };
    const patches = compare(source, { a: [1] }, { strict: true });
    const test = patches.find((p) => p.op === 'test') as any;
    expect(test.value).not.toBe(source.a);
  });

  it('J2 applyPatch immutable: move to root then add must not mutate the input', () => {
    const doc = deepFreeze({ a: { b: 1 }, c: 2 });
    const run = () =>
      applyPatch(doc, [
        { op: 'move', from: '/a', path: '' },
        { op: 'add', path: '/z', value: 3 },
      ] as any);
    expect(run).not.toThrow();
    expect(run()).toEqual({ b: 1, z: 3 });
  });

  it('J2b applyPatch immutable: copy to root then replace must not mutate the input', () => {
    const doc = { a: { b: 1 } };
    const result = applyPatch(doc, [
      { op: 'copy', from: '/a', path: '' },
      { op: 'replace', path: '/b', value: 99 },
    ] as any);
    expect(result).toEqual({ b: 99 });
    expect(doc).toEqual({ a: { b: 1 } });
  });

  it('J3 move to an ancestor location (RFC 6902 4.4: remove then add)', () => {
    expect(
      applyPatch({ a: { b: { c: 5 } } }, [{ op: 'move', from: '/a/b/c', path: '/a' }] as any),
    ).toEqual({ a: 5 });
  });

  it('J3b move to an ancestor with an object value yields the moved value only and leaves input intact', () => {
    const doc = { a: { b: { c: { d: 1 } } } };
    const snapshot = JSON.stringify(doc);
    const result = applyPatch(doc, [{ op: 'move', from: '/a/b/c', path: '/a' }] as any);
    expect(result).toEqual({ a: { d: 1 } });
    expect(JSON.stringify(doc)).toBe(snapshot);
  });

  it('J3c fast-json-patch agrees on the move-to-ancestor result', () => {
    const doc = { a: { b: { c: { d: 1 } } } };
    const ref = fjp.applyPatch(doc, [{ op: 'move', from: '/a/b/c', path: '/a' }] as any, true, false).newDocument;
    expect(ref).toEqual({ a: { d: 1 } });
  });

  it('J4 difference + mergePatch round-trips reserved member names as data', () => {
    const source = {};
    const target = JSON.parse('{"constructor": 1, "__proto__": {"x": 1}}');
    const patch = difference(source, target);
    expect(patch).not.toBeUndefined();
    const merged = mergePatch(source, patch as any);
    expect(Object.keys(merged as any).sort()).toEqual(['__proto__', 'constructor']);
  });

  it('J4b difference reports removal of a reserved member key', () => {
    const source = JSON.parse('{"constructor": 1, "a": 1}');
    const target = { a: 1 };
    const patch = difference(source, target);
    const merged = mergePatch(source, patch as any);
    expect(merged).toEqual(target);
    expect(Object.prototype.hasOwnProperty.call(merged, 'constructor')).toBe(false);
  });

  it('J5 docs: setValue("/__proto__/pwn") is documented as abandoned (pointers-and-paths.md:263,269)', () => {
    const doc: any = { x: 1 };
    setValue(doc, '/__proto__/pwn', true);
    expect(Object.keys(doc)).toEqual(['x']);
  });

  it('J6 differential applyPatch add/remove/replace/test/move/copy vs fast-json-patch', () => {
    const rand = mulberry32(12345);
    const failures: string[] = [];
    for (let iter = 0; iter < 3000 && failures.length < 5; iter++) {
      const doc = makeDoc(rand, 4);
      if (!doc || typeof doc !== 'object') continue;
      const ops: any[] = [];
      let state = JSON.parse(JSON.stringify(doc));
      for (let k = 0; k < 4; k++) {
        const op = JSON.parse(JSON.stringify(randomOp(rand, state, true)));
        try {
          state = fjp.applyPatch(state, [JSON.parse(JSON.stringify(op))], true, false).newDocument;
          ops.push(op);
        } catch {
          break;
        }
      }
      const opsJSON = JSON.stringify(ops);
      const expected = fjp.applyPatch(JSON.parse(JSON.stringify(doc)), JSON.parse(opsJSON), true, false).newDocument;
      const frozen = deepFreeze(JSON.parse(JSON.stringify(doc)));
      let actual: any;
      try {
        actual = applyPatch(frozen, JSON.parse(opsJSON), { strict: true });
      } catch (e: any) {
        failures.push(`THROW ${e?.message} doc=${JSON.stringify(doc)} ops=${JSON.stringify(ops)}`);
        continue;
      }
      if (!isEqual(actual, expected))
        failures.push(`DIFF doc=${JSON.stringify(doc)} ops=${JSON.stringify(ops)} actual=${JSON.stringify(actual)} expected=${JSON.stringify(expected)}`);
    }
    expect(failures).toEqual([]);
  });

  it('J7 differential compare round trip (ours and fast-json-patch apply)', () => {
    const rand = mulberry32(777);
    const failures: string[] = [];
    for (let iter = 0; iter < 3000 && failures.length < 5; iter++) {
      const a = makeDoc(rand, 4);
      const b = makeDoc(rand, 4);
      if (!a || typeof a !== 'object' || !b || typeof b !== 'object') continue;
      if (Array.isArray(a) !== Array.isArray(b)) continue;
      for (const strict of [false, true]) {
        const patches = compare(a, b, { strict });
        let viaOurs: any;
        let viaRef: any;
        try {
          viaOurs = applyPatch(a, patches, { strict: true });
        } catch (e: any) {
          viaOurs = 'THROW ' + e?.message;
        }
        try {
          viaRef = fjp.applyPatch(JSON.parse(JSON.stringify(a)), JSON.parse(JSON.stringify(patches)), true, false).newDocument;
        } catch (e: any) {
          viaRef = 'THROW ' + e?.message;
        }
        if (!isEqual(viaOurs, b) || !isEqual(viaRef, b))
          failures.push(`strict=${strict} a=${JSON.stringify(a)} b=${JSON.stringify(b)} patches=${JSON.stringify(patches)} ours=${JSON.stringify(viaOurs)} ref=${JSON.stringify(viaRef)}`);
      }
    }
    expect(failures).toEqual([]);
  });

  it('J8 differential difference/mergePatch round trip', () => {
    const rand = mulberry32(4242);
    const failures: string[] = [];
    for (let iter = 0; iter < 3000 && failures.length < 5; iter++) {
      const a = makeDoc(rand, 4);
      const b = makeDoc(rand, 4);
      const patch = difference(a, b);
      const merged = mergePatch(a, patch as any);
      // RFC 7396 cannot express a null member value; skip targets holding null inside objects
      if (JSON.stringify(b).includes('null')) continue;
      if (!isEqual(merged, b))
        failures.push(`a=${JSON.stringify(a)} b=${JSON.stringify(b)} patch=${JSON.stringify(patch)} merged=${JSON.stringify(merged)}`);
    }
    expect(failures).toEqual([]);
  });

  it('J9 escape round trips: compilePointer(join(escapeSegment)) recovers tokens', () => {
    const rand = mulberry32(99);
    const alphabet = ['~', '/', '0', '1', 'a', '%', '#', ' '];
    const failures: string[] = [];
    for (let i = 0; i < 5000; i++) {
      const n = 1 + Math.floor(rand() * 4);
      const tokens: string[] = [];
      for (let j = 0; j < n; j++) {
        let s = '';
        const len = Math.floor(rand() * 5);
        for (let k = 0; k < len; k++) s += alphabet[Math.floor(rand() * alphabet.length)];
        tokens.push(s);
      }
      const pointer = '/' + tokens.map(escapeSegment).join('/');
      const compiled = compilePointer(pointer);
      if (!isEqual(compiled, ['', ...tokens])) failures.push(`tokens=${JSON.stringify(tokens)} compiled=${JSON.stringify(compiled)}`);
      for (const t of tokens) if (unescapePath(escapeSegment(t)) !== t) failures.push(`seg ${JSON.stringify(t)}`);
      const doc: any = {};
      setValue(doc, pointer, 42);
      if (getValue(doc, pointer) !== 42) failures.push(`set/get ${pointer}`);
      if (failures.length > 5) break;
    }
    expect(failures).toEqual([]);
  });

  it('J10 getValue/setValue address a top-level key named "#"', () => {
    const doc: any = { '#': { x: 1 } };
    expect(getValue(doc, '/#/x')).toBe(1);
    expect(getValue(doc, ['#'])).toEqual({ x: 1 });
  });

  it('J11 URI fragment pointer "#/a%20b" is percent-decoded (RFC 6901 section 6)', () => {
    expect(getValue({ 'a b': 1 }, '#/a%20b')).toBe(1);
  });

  const deep = (n: number, leaf: any = 1) => {
    let v: any = leaf;
    for (let i = 0; i < n; i++) v = { k: v };
    return v;
  };
  const deepPointer = (n: number) => '/k'.repeat(n);
  const N = 10000;

  it('J12a deep 10k: compare does not overflow', () => {
    expect(() => compare(deep(N, 1), deep(N, 2))).not.toThrow();
  });
  it('J12b deep 10k: applyPatch replace at depth does not overflow', () => {
    expect(() => applyPatch(deep(N, 1), [{ op: 'replace', path: deepPointer(N), value: 2 }])).not.toThrow();
  });
  it('J12c deep 10k: mergePatch does not overflow', () => {
    expect(() => mergePatch(deep(N, 1), deep(N, 2))).not.toThrow();
  });
  it('J12d deep 10k: difference does not overflow', () => {
    expect(() => difference(deep(N, 1), deep(N, 2))).not.toThrow();
  });
  it('J12e deep 10k: getValue/setValue do not overflow', () => {
    const d = deep(N, 1);
    expect(getValue(d, deepPointer(N))).toBe(1);
    expect(() => setValue(d, deepPointer(N), 2)).not.toThrow();
  });
  it('J12f deep 10k: getJSONPointer / getJSONPath do not overflow', () => {
    const d = deep(N, { leaf: true });
    let leaf = d;
    for (let i = 0; i < N; i++) leaf = leaf.k;
    expect(() => getJSONPointer(d, leaf)).not.toThrow();
    expect(() => getJSONPath(d, leaf)).not.toThrow();
  });
  it('J12g deep 10k: applyPatch strict test on deep value does not overflow', () => {
    const d = deep(N, 1);
    expect(() => applyPatch({ r: d }, [{ op: 'test', path: '/r', value: deep(N, 1) }], { strict: true })).not.toThrow();
  });
  it('J12h deep 10k reference: fast-json-patch compare', () => {
    expect(() => fjp.compare(deep(N, 1), deep(N, 2))).not.toThrow();
  });

  it('J12z depth thresholds (informational)', () => {
    const limit = (fn: (n: number) => unknown) => {
      let lo = 100;
      let hi = 200000;
      while (lo < hi) {
        const mid = (lo + hi + 1) >> 1;
        try {
          fn(mid);
          lo = mid;
        } catch {
          hi = mid - 1;
        }
      }
      return lo;
    };
    const out = {
      compare: limit((n) => compare(deep(n, 1), deep(n, 2))),
      fjpCompare: limit((n) => fjp.compare(deep(n, 1), deep(n, 2))),
      mergePatch: limit((n) => mergePatch(deep(n, 1), deep(n, 2))),
      difference: limit((n) => difference(deep(n, 1), deep(n, 2))),
      applyPatchTestStrict: limit((n) => applyPatch({ r: deep(n, 1) }, [{ op: 'test', path: '/r', value: deep(n, 1) }], { strict: true })),
      fjpTest: limit((n) => fjp.applyPatch({ r: deep(n, 1) }, [{ op: 'test', path: '/r', value: deep(n, 1) }] as any, true, false)),
      jsonStringify: limit((n) => JSON.stringify(deep(n, 1))),
    };
    expect(JSON.stringify(out)).toBe('DEPTH');
  });

  it('J3d move to an ancestor in default immutable mode leaves the input untouched', () => {
    const doc = { a: { b: { c: { d: 1 } } } };
    const snapshot = JSON.stringify(doc);
    try {
      applyPatch(doc, [{ op: 'move', from: '/a/b/c', path: '/a' }] as any);
    } catch {
      /* result correctness is J3b; this test checks input only */
    }
    expect(JSON.stringify(doc)).toBe(snapshot);
  });

  it('J14 getJSONPointer under a root-level empty key keeps the empty token', () => {
    const target = { t: 1 };
    const doc: any = { '': { x: target } };
    const pointer = getJSONPointer(doc, target);
    expect(pointer).toBe('//x');
    expect(getValue(doc, pointer as string)).toBe(target);
  });

  it('J14b getJSONPointer under a root-level empty key in an array path', () => {
    const target = { t: 1 };
    const doc: any = { '': [target] };
    expect(getJSONPointer(doc, target)).toBe('//0');
  });

  it('J15 docs: pointers-and-paths.md:312 says getJSONPointer(doc, doc) returns "/"', () => {
    const doc = { a: 1 };
    expect(getJSONPointer(doc, doc)).toBe('/');
  });

  it('J13 difference(NaN, NaN) reports no change like nested NaN', () => {
    expect(difference({ a: NaN } as any, { a: NaN } as any)).toBeUndefined();
    expect(difference(NaN as any, NaN as any)).toBeUndefined();
  });
});
