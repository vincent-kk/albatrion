// filid:contract fingerprint-surface
import { expect, it } from 'vitest';

import * as fingerprint from '../index';

it('exports only purpose-specific generators without an implicit prefix', () => {
  expect(Object.keys(fingerprint).sort()).toEqual([
    'createFingerprint',
    'createFingerprintFactory',
    'createSafeFingerprint',
    'createSortedFingerprint',
  ]);
  expect(fingerprint.createFingerprint({ x: 1 })).toBe('x:1');
  expect(fingerprint.createFingerprintFactory()({ x: 1 })).toBe(
    fingerprint.createSafeFingerprint({ x: 1 }),
  );
});
