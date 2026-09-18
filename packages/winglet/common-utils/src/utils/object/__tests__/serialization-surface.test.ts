// filid:contract serialization-surface
import { expect, it } from 'vitest';

import * as root from '../../../index';
import * as object from '../index';

it('exports only graph and fingerprint APIs through both public barrels', () => {
  for (const name of [
    'stringifyGraph',
    'parseGraph',
    'createFingerprint',
    'createSortedFingerprint',
    'createSafeFingerprint',
    'createFingerprintFactory',
  ] as const) {
    expect(root[name]).toBe(object[name]);
    expect(root[name]).toBeTypeOf('function');
  }
  const removed = [
    'serializeNative',
    'serializeObject',
    'serializeWithFullSortedKeys',
    'stableSerialize',
  ];
  expect(Object.keys(root)).not.toEqual(expect.arrayContaining(removed));
  expect(Object.keys(object)).not.toEqual(expect.arrayContaining(removed));
  expect('encodeGraph' in root).toBe(false);
  expect('validateGraph' in object).toBe(false);
});
