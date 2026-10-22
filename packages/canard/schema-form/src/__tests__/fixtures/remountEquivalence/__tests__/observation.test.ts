import { describe, expect, it } from 'vitest';

import { compareObservations } from '../compareObservations';
import { encodeValue } from '../encodeValue';

describe('remount-equivalence observation infrastructure', () => {
  it('preserves undefined, sparse slots and own-key order', () => {
    expect(encodeValue({ a: undefined })).not.toEqual(encodeValue({}));
    expect(encodeValue([undefined])).not.toEqual(encodeValue(Array(1)));
    expect(encodeValue({ a: 1, b: 2 })).not.toEqual(
      encodeValue({ b: 2, a: 1 }),
    );
  });

  it('compares contents independently of identity and aliasing', () => {
    const shared = { n: 1 };
    expect(encodeValue([shared, shared])).toEqual(
      encodeValue([{ n: 1 }, { n: 1 }]),
    );
    expect(encodeValue(NaN)).toEqual(encodeValue(NaN));
  });

  it('reports every differing channel instead of stopping at the first', () => {
    const changes = compareObservations(
      { value: 1, active: true },
      { value: 2, active: false },
    );
    expect(changes.map(({ path }) => path)).toEqual(['/value', '/active']);
  });

  it('requires the predicted fresh value for a static mask', () => {
    const mask = {
      path: '/value',
      fresh: undefined,
      category: 'omitEmpty' as const,
      clause: 'VALUE-031(b)',
    };
    expect(
      compareObservations({ value: '' }, { value: undefined }, [mask]),
    ).toEqual([]);
    expect(
      compareObservations({ value: '' }, { value: 'wrong' }, [mask]),
    ).toHaveLength(1);
  });

  it('rejects a mask on a computed state channel', () => {
    expect(() =>
      compareObservations({ active: true }, { active: false }, [
        {
          path: '/active',
          fresh: false,
          category: 'fill',
          clause: 'SETTLE-046',
        },
      ]),
    ).toThrow('FORBIDDEN_MASK_CHANNEL');
  });

  it('keeps missing keys different from present undefined', () => {
    expect(compareObservations({}, { value: undefined })).toHaveLength(1);
  });
});
