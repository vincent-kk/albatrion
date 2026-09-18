// filid:contract legacy-coexistence
import { expect, it } from 'vitest';

import * as root from '../../../index';
import * as object from '../index';

it('exports new APIs and preserves all legacy APIs through both public barrels', () => {
  for (const name of [
    'stringifyGraph',
    'parseGraph',
    'createFingerprint',
    'createSortedFingerprint',
    'createSafeFingerprint',
    'createFingerprintFactory',
    'serializeNative',
    'serializeObject',
    'serializeWithFullSortedKeys',
    'stableSerialize',
  ] as const) {
    expect(root[name]).toBe(object[name]);
    expect(root[name]).toBeTypeOf('function');
  }
  expect(root.serializeNative).toBe(JSON.stringify);
  expect('encodeGraph' in root).toBe(false);
  expect('validateGraph' in object).toBe(false);
});
