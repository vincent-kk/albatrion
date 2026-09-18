// filid:contract fingerprint-fast fingerprint-sorted
import { expect, it } from 'vitest';

import { serializeObject } from '../../serializeObject';
import { serializeWithFullSortedKeys } from '../../serializeWithFullSortedKeys';
import { createFingerprint, createSortedFingerprint } from '../index';

it('matches shallow legacy output on normal inputs and keeps top-level omit', () => {
  const value = { z: 1, a: { secret: 2 }, secret: 3 };
  expect(createFingerprint(value)).toBe(serializeObject(value));
  expect(createFingerprint(value, { omit: ['secret'] })).toBe(
    serializeObject(value, ['secret']),
  );
  expect(createFingerprint(value, { omit: new Set(['secret']) })).toBe(
    serializeObject(value, ['secret']),
  );
  expect(createFingerprint(value, { prefix: 'x:' })).toBe(
    'x:' + serializeObject(value),
  );
});

it('retains native JSON limits while always returning a root key string', () => {
  expect(createFingerprint(undefined)).toBe('undefined');
  const value: any = {};
  value.self = value;
  expect(() => createFingerprint(value)).toThrow(TypeError);
  expect(() => createFingerprint({ value: { big: 1n } })).toThrow(TypeError);
  expect(createFingerprint(new Map([['x', 1]]))).toBe('');
});

it('matches legacy exclusions when repeated lookups justify indexing', () => {
  const value = Object.fromEntries(
    Array.from({ length: 200 }, (_, i) => ['field' + i, i]),
  );
  const omit = Array.from({ length: 128 }, (_, i) => 'field' + i);
  expect(createFingerprint(value, { omit })).toBe(serializeObject(value, omit));
  omit.push('field199');
  expect(createFingerprint(value, { omit })).toBe(serializeObject(value, omit));
});

it('matches the sorted path legacy format including cycle markers', () => {
  const value: any = { z: { x: 1 }, a: [2, 3] };
  value.self = value;
  expect(createSortedFingerprint(value)).toBe(
    serializeWithFullSortedKeys(value),
  );
  expect(createSortedFingerprint({ b: 2, a: 1 })).toBe(
    createSortedFingerprint({ a: 1, b: 2 }),
  );
  expect(createSortedFingerprint(new Set([1, 2]))).toBe('');
});

it('extends the sorted writer with recursive omit before access', () => {
  const value = {
    nested: {
      x: 1,
      get secret() {
        throw Error('must omit');
      },
    },
  };
  expect(
    createSortedFingerprint(value, { omit: ['secret'], prefix: 'x:' }),
  ).toBe('x:nested.x:1');
});
