import { describe, expect, it } from 'vitest';

import type { Patch } from '../../../patchModel';
import { Operation } from '../../../patchModel';
import { applyPatch } from '../applyPatch';
import { JSONPatchError } from '../utils/error';

/**
 * Returns the structured code of the JSONPatchError that applying the patches throws.
 *
 * @param run - Applies the patches under test
 * @returns The error's specific code, or null when the call does not throw
 */
const errorCodeOf = (run: () => unknown): string | null => {
  try {
    run();
  } catch (error) {
    expect(error).toBeInstanceOf(JSONPatchError);
    return (error as JSONPatchError).specific;
  }
  return null;
};

describe('applyPatch array index syntax (RFC 6901 4)', () => {
  it.each([
    [false, '/a/01'],
    [true, '/a/01'],
    [false, '/a/00'],
    [false, '/a/01/x'],
  ])('rejects a leading-zero index (strict %s, path %s)', (strict, path) => {
    expect(
      errorCodeOf(() =>
        applyPatch(
          { a: [{ x: 1 }, { x: 2 }] },
          [{ op: Operation.REMOVE, path }],
          { strict },
        ),
      ),
    ).toBe('PATCH_ARRAY_INDEX_INVALID');
  });

  it('still accepts the index 0 and multi-digit indexes', () => {
    const source = { a: Array.from({ length: 12 }, (_, index) => index) };

    expect(
      applyPatch(source, [
        { op: Operation.REMOVE, path: '/a/10' },
        { op: Operation.REMOVE, path: '/a/0' },
      ]),
    ).toEqual({ a: [1, 2, 3, 4, 5, 6, 7, 8, 9, 11] });
  });

  // ~~ truncates to a 32-bit integer, so these indexes would wrap onto real elements
  const wrappingIndexPatches: Patch[] = [
    { op: Operation.REMOVE, path: '/a/4294967296' },
    { op: Operation.REMOVE, path: '/a/4294967295' },
    { op: Operation.ADD, path: '/a/4294967295', value: 9 },
    { op: Operation.REPLACE, path: '/a/1000000000', value: 9 },
    { op: Operation.MOVE, from: '/a/4294967296', path: '/b' },
  ];

  it.each(wrappingIndexPatches)(
    'rejects an index longer than nine digits in %j',
    (patch) => {
      expect(errorCodeOf(() => applyPatch({ a: [1, 2, 3] }, [patch]))).toBe(
        'PATCH_ARRAY_INDEX_INVALID',
      );
    },
  );

  it('keeps nine-digit indexes on the bounds check', () => {
    expect(
      errorCodeOf(() =>
        applyPatch({ a: [1] }, [
          { op: Operation.REMOVE, path: '/a/999999999' },
        ]),
      ),
    ).toBe('PATCH_ARRAY_INDEX_OUT_OF_BOUNDS');
  });
});
