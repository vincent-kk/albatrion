import { bench, describe } from 'vitest';

import {
  createFingerprint,
  createFingerprintFactory,
  createSafeFingerprint,
  createSortedFingerprint,
} from '../src/utils/object/fingerprint';
import { createFixture } from './serialization/fixtures';

describe('fingerprint source contracts', () => {
  const value = createFixture('small');
  const mutable = createFingerprintFactory({ mode: 'safe' });
  const immutable = createFingerprintFactory({
    mode: 'safe',
    cache: 'immutable',
  });
  immutable(value);
  const cases = [
    ['fast', () => createFingerprint(value)],
    ['sorted', () => createSortedFingerprint(value)],
    ['safe + sort', () => createSafeFingerprint(value)],
    ['safe without sort', () => createSafeFingerprint(value, { sort: false })],
    ['factory mutable', () => mutable(value)],
    ['factory immutable hit', () => immutable(value)],
    ['factory creation', () => createFingerprintFactory({ mode: 'safe' })],
  ] as const;
  for (const [name, run] of cases) {
    bench(
      name,
      () => {
        run();
      },
      {
        time: 100,
        iterations: 30,
        warmupTime: 30,
      },
    );
  }
});
