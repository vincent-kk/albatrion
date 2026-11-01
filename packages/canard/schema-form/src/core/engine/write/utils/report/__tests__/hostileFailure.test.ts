import { expect, it } from 'vitest';

import { FormErrorCode, SchemaFormError } from '@/schema-form/errors';

import { forEachFailureLeaf } from '../forEachFailureLeaf';

const bundle = (errors: unknown[]) =>
  new SchemaFormError(FormErrorCode.MultipleErrors, 'candidate', { errors });

it.each([
  ['NaN', NaN],
  ['negative', -1],
  ['string-zero', '0'],
  ['fraction', 0.5],
] as const)(
  'AM16 host preserves invalid length %s as an opaque leaf',
  (_label, length) => {
    const A = new Error('A');
    let reads = 0;
    const errors = new Proxy([A], {
      get: (target, key, receiver) => {
        if (key !== 'length') return Reflect.get(target, key, receiver);
        if (++reads > 8) throw new Error('length fuse');
        return length;
      },
    });
    const failure = bundle(errors),
      values: unknown[] = [];
    expect(() =>
      forEachFailureLeaf(failure, (value) => values.push(value)),
    ).not.toThrow();
    expect(reads).toBeLessThanOrEqual(2);
    expect(values).toHaveLength(1);
    expect(values[0] === failure).toBe(true);
  },
);

it('AM16 host preserves a nested length changing from one to Infinity', () => {
  const A = new Error('A'),
    H = new Error('H');
  let reads = 0;
  const errors = new Proxy([A], {
    get: (target, key, receiver) => {
      if (key === 'length') {
        if (++reads > 8) throw new Error('length fuse');
        return reads === 1 ? 1 : Infinity;
      }
      return typeof key === 'string' && /^\d+$/.test(key)
        ? A
        : Reflect.get(target, key, receiver);
    },
    getOwnPropertyDescriptor: (target, key) =>
      typeof key === 'string' && /^\d+$/.test(key)
        ? { value: A, writable: true, enumerable: true, configurable: true }
        : Reflect.getOwnPropertyDescriptor(target, key),
  });
  const failure = bundle(errors),
    values: unknown[] = [];
  expect(() =>
    forEachFailureLeaf(bundle([failure, H]), (value) => values.push(value)),
  ).not.toThrow();
  expect(reads).toBeLessThanOrEqual(2);
  expect(values).toHaveLength(2);
  expect(values[0] === failure).toBe(true);
  expect(values[1]).toBe(H);
});

it('AM16 host terminates when an index getter keeps appending', () => {
  const A = new Error('A'),
    errors: unknown[] = [];
  let reads = 0;
  const get = (): unknown => {
    if (++reads > 16) throw new Error('append fuse');
    Object.defineProperty(errors, errors.length, { get, configurable: true });
    return A;
  };
  Object.defineProperty(errors, 0, { get, configurable: true });
  const failure = bundle(errors),
    values: unknown[] = [];
  expect(() =>
    forEachFailureLeaf(failure, (value) => values.push(value)),
  ).not.toThrow();
  expect(reads).toBeLessThanOrEqual(1);
  expect(values).toHaveLength(1);
  expect(values[0] === failure).toBe(true);
});

it('AM16 host preserves a bundle beyond the one-million element budget', () => {
  const A = new Error('A'),
    failure = bundle(new Array(1_000_001).fill(A));
  let count = 0,
    first: unknown;
  expect(() =>
    forEachFailureLeaf(failure, (value) => {
      if (!count) first = value;
      count++;
    }),
  ).not.toThrow();
  expect(count).toBe(1);
  expect(first === failure).toBe(true);
});

it('AM16 host shares the element budget across nested arrays', () => {
  const A = new Error('A'),
    B = new Error('B');
  const left = bundle(new Array(600_000).fill(A)),
    right = bundle(new Array(600_000).fill(B));
  let count = 0,
    last: unknown;
  expect(() =>
    forEachFailureLeaf(bundle([left, right]), (value) => {
      last = value;
      count++;
    }),
  ).not.toThrow();
  expect(count).toBe(600_001);
  expect(last === right).toBe(true);
});

it('AM16 host charges a failed snapshot to the shared element budget', () => {
  const A = new Error('A'),
    H = new Error('H');
  const badErrors = new Array(600_000).fill(A);
  Object.defineProperty(badErrors, 599_999, {
    get: () => {
      throw new Error('last index');
    },
  });
  const goodErrors = new Array(400_000).fill(A);
  let goodReads = 0;
  Object.defineProperty(goodErrors, 0, {
    get: () => {
      goodReads++;
      return A;
    },
  });
  const bad = bundle(badErrors),
    good = bundle(goodErrors);
  const first: unknown[] = [];
  let count = 0;
  expect(() =>
    forEachFailureLeaf(bundle([A, bad, good, H]), (value) => {
      if (count < 4) first.push(value);
      count++;
    }),
  ).not.toThrow();
  expect(count).toBe(4);
  expect(goodReads).toBe(0);
  for (const [index, expected] of [A, bad, good, H].entries())
    expect(first[index] === expected).toBe(true);
});
