// filid:contract candidate-correctness
import { expect, it } from 'vitest';

import {
  createFixture,
  fixtureNames,
} from '../../../../../bench/serialization/fixtures';
import { encodeGraph } from '../../serialization/utils/encodeGraph';
import { compact, compactFactory } from '../__bench__/compact';
import { direct } from '../__bench__/direct';
import { hash32 } from '../__bench__/hash';
import { legacyFactory, legacyFingerprint } from '../__bench__/legacy';

it('keeps supported fixture identity-independent keys and sorted properties', () => {
  for (const name of fixtureNames)
    expect(compact(createFixture(name))).toBe(compact(createFixture(name)));
  for (const name of fixtureNames)
    expect(direct(createFixture(name))).toBe(direct(createFixture(name)));
  for (const name of fixtureNames)
    expect(hash32(createFixture(name))).toBe(hash32(createFixture(name)));
  expect(compact({ b: 2, a: 1 })).toBe(compact({ a: 1, b: 2 }));
  expect(compact(Object.assign(Object.create(null), { x: 1 }))).not.toBe(
    compact({ x: 1 }),
  );
});

it('has no extra collisions on an adversarial scalar and structural corpus', () => {
  const leaf = { x: 1 };
  const values: unknown[] = [
    null,
    undefined,
    false,
    true,
    0,
    -0,
    NaN,
    Infinity,
    -Infinity,
    1,
    1n,
    '',
    'null',
    '1',
    'n1;',
    'x}r0;',
    '한글😀\ud800',
    [],
    {},
    new Array(1),
    [undefined],
    [null],
    [1],
    ['1'],
    { a: 1 },
    { a: '1' },
    { 'a.b': 1 },
    { a: { b: 1 } },
    { 'b:1|a': 2 },
    { b: 1, a: 2 },
    [leaf, leaf],
    [{ x: 1 }, { x: 1 }],
    new Date(0),
    new Date(NaN),
    /x/g,
    /x/i,
    new Map([[1, 2]]),
    new Map([['1', 2]]),
    new Set([1, 2]),
    new Set([2, 1]),
  ];
  let seed = 123456;
  const random = () =>
    (seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0) % 1000;
  for (let i = 0; i < 500; i++) {
    const object: any = {
      [String.fromCharCode(random() % 128) + ':{};']:
        random() % 2 ? String(random()) : random(),
      list: [random(), undefined, 'x:' + random()],
    };
    if (i % 3 === 0) object.self = object;
    if (i % 5 === 0) object.other = object.list;
    values.push(object);
  }
  for (const encode of [compact, direct, hash32]) {
    const keys = new Map<string, string>();
    for (const value of values) {
      const key = encode(value),
        canonical = JSON.stringify(encodeGraph(value, { sorted: true }));
      if (keys.has(key)) expect(keys.get(key)).toBe(canonical);
      else keys.set(key, canonical);
    }
  }
});

it('distinguishes cycle topology and shared nodes', () => {
  const first: any = {};
  first.self = first;
  const second: any = { self: {} };
  second.self.self = second;
  expect(compact(first)).not.toBe(compact(second));
  const shared = {};
  expect(compact([shared, shared])).not.toBe(compact([{}, {}]));
  const date = new Date(0);
  expect(compact([date, date])).not.toBe(compact([new Date(0), new Date(0)]));
});

it('omits before reading and rejects unsupported values without invoking getters', () => {
  let reads = 0;
  const value = Object.defineProperty({ x: 1 }, 'secret', {
    enumerable: true,
    get: () => {
      reads++;
      return 1;
    },
  });
  expect(() => compact(value)).toThrow(TypeError);
  expect(compact(value, { omit: ['secret'] })).toBe(compact({ x: 1 }));
  expect(reads).toBe(0);
  for (const invalid of [
    () => 1,
    Symbol('x'),
    new (class {})(),
    { [Symbol('x')]: 1 },
    Object.assign(new Date(), { x: 1 }),
  ])
    expect(() => compact(invalid)).toThrow(TypeError);
  expect(() => compact(null, { prefix: 'x'.repeat(16777216) })).toThrow(
    TypeError,
  );
  expect(() => compact(new Array(1000001))).toThrow(TypeError);
  expect(() => compact([new Array(600000), new Array(600000)])).toThrow(
    TypeError,
  );
});

it('scopes opaque identity and observes mutable input by default', () => {
  const key = compactFactory();
  const first = () => 1,
    second = () => 1;
  expect(key({ a: first })).toBe(key({ a: first }));
  expect(key(first)).not.toBe(key(second));
  expect(key(Symbol('x'))).not.toBe(key(Symbol('x')));
  const value = { x: 1 };
  const before = key(value);
  value.x++;
  expect(key(value)).not.toBe(before);
});

it('maintains exact mutable omit signatures and fixed prefixes under immutable cache', () => {
  const options = { cache: 'immutable' as const, prefix: 'app:' };
  const key = compactFactory(options);
  const value = { a: 1, b: 2, 'a,b': 3 };
  expect(key(value)).toBe('app:' + compact(value));
  options.prefix = 'changed:';
  expect(key({ ...value })).toBe(key(value));
  expect(key(value, { omit: ['a,b'] })).not.toBe(
    key(value, { omit: ['a', 'b'] }),
  );
  expect(key(value, { omit: ['b', 'a', 'a'] })).toBe(
    key(value, { omit: ['a', 'b'] }),
  );
  const omit = ['a'];
  const before = key(value, { omit });
  omit.push('b');
  expect(key(value, { omit })).not.toBe(before);
  const original = key(value);
  value.a++;
  expect(key(value)).toBe(original);
});

it('does not cache failed results and handles deep graphs iteratively', () => {
  const key = compactFactory({ cache: 'immutable' });
  const value: any = Object.defineProperty({ x: 1 }, 'bad', {
    enumerable: true,
    configurable: true,
    get() {
      throw Error();
    },
  });
  expect(() => key(value)).toThrow(TypeError);
  delete value.bad;
  expect(key(value)).toBe(key({ x: 1 }));
  let deep: any = { x: 1 };
  for (let i = 0; i < 10000; i++) deep = { next: deep };
  expect(compact(deep).length).toBeGreaterThan(10000);
});

it('pins the legacy-shaped writer subset and explicitly weaker distinctions', () => {
  expect(legacyFingerprint({ b: 2, a: 'x' })).toBe('{b:2|a:"x"}');
  expect(legacyFingerprint([1, undefined, 'x'])).toBe('[1,undefined,"x"]');
  const cycle: any = {};
  cycle.self = cycle;
  const cyclicKey = legacyFactory();
  expect(cyclicKey(cycle)).toContain('@');
  expect(cyclicKey(cycle)).toBe(cyclicKey(cycle));
  const immutable = legacyFactory(true),
    mutable = legacyFactory();
  const value = { x: 1 };
  const cached = immutable(value),
    initial = mutable(value);
  value.x++;
  expect(immutable(value)).toBe(cached);
  expect(mutable(value)).not.toBe(initial);
  expect(legacyFingerprint(1n)).toBe(legacyFingerprint(1));
  const shared = {};
  expect(legacyFingerprint([shared, shared])).toBe(legacyFingerprint([{}, {}]));
});
