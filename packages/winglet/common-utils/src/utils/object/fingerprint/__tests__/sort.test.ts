// filid:contract fingerprint-sort
import { expect, it } from 'vitest';

import {
  createFingerprint,
  createFingerprintFactory,
  createSafeFingerprint,
  createSortedFingerprint,
} from '../index';

it('can skip safe property sorting while preserving cycle handling', () => {
  const first: any = { b: 2, a: 1 },
    second: any = { a: 1, b: 2 };
  first.self = first;
  second.self = second;
  expect(createSafeFingerprint(first)).toBe(createSafeFingerprint(second));
  expect(createSafeFingerprint(first, { sort: false })).not.toBe(
    createSafeFingerprint(second, { sort: false }),
  );
});

it('captures safe sorting in the factory including cached results', () => {
  const options = {
    mode: 'safe' as const,
    sort: false,
    cache: 'immutable' as const,
  };
  const key = createFingerprintFactory(options);
  const first = { b: 2, a: 1 },
    second = { a: 1, b: 2 };
  const before = key(first);
  options.sort = true;
  expect(key(first)).toBe(before);
  expect(key(first)).not.toBe(key(second));
  expect(createFingerprintFactory({ mode: 'safe', sort: true })(first)).toBe(
    createSafeFingerprint(first),
  );
});

it('selects all three modes without sharing their comparison policies', () => {
  const value = { b: 2, a: { x: 1 } };
  expect(createFingerprintFactory({ mode: 'fast' })(value)).toBe(
    createFingerprint(value),
  );
  expect(createFingerprintFactory({ mode: 'sorted' })(value)).toBe(
    createSortedFingerprint(value),
  );
  expect(createFingerprintFactory({ mode: 'safe' })(value)).toBe(
    createSafeFingerprint(value),
  );
  expect(() => createFingerprintFactory({ mode: 'invalid' as any })).toThrow(
    TypeError,
  );
});

it('uses opaque Map and Set identities only in the safe scope', () => {
  const key = createFingerprintFactory({ mode: 'safe', sort: false });
  const map = new Map([['x', 1]]),
    set = new Set([1]);
  expect(key(map)).toBe(key(map));
  expect(key(map)).not.toBe(key(new Map([['x', 1]])));
  const before = key(map);
  map.set('x', 2);
  expect(key(map)).toBe(before);
  expect(key(set)).not.toBe(key(new Set([1])));
});
