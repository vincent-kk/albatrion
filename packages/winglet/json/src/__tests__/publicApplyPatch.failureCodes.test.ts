import { describe, expect, it } from 'vitest';

import { type Patch, applyPatch } from '../index';

describe('applyPatch failure codes', () => {
  describe.each([true, false])('immutable %s', (immutable) => {
    it.each<{ name: string; patch: Patch; specific: string }>([
      {
        name: 'a test whose value differs',
        patch: { op: 'test', path: '/a/b', value: 2 },
        specific: 'PATCH_TEST_FAILED',
      },
      {
        name: 'a test of a missing member',
        patch: { op: 'test', path: '/a/missing', value: 2 },
        specific: 'PATCH_OBJECT_PROPERTY_NOT_FOUND',
      },
      {
        name: 'a remove of a missing member',
        patch: { op: 'remove', path: '/a/missing' },
        specific: 'PATCH_OBJECT_PROPERTY_NOT_FOUND',
      },
      {
        name: 'a replace of a missing member',
        patch: { op: 'replace', path: '/a/missing', value: 1 },
        specific: 'PATCH_OBJECT_PROPERTY_NOT_FOUND',
      },
      {
        name: 'a non-numeric array index',
        patch: { op: 'replace', path: '/items/x', value: 1 },
        specific: 'PATCH_ARRAY_INDEX_INVALID',
      },
      {
        name: 'an array index with a leading zero',
        patch: { op: 'replace', path: '/items/01', value: 1 },
        specific: 'PATCH_ARRAY_INDEX_INVALID',
      },
      {
        name: 'an array index above 4294967294',
        patch: { op: 'add', path: '/items/4294967295', value: 1 },
        specific: 'PATCH_ARRAY_INDEX_INVALID',
      },
      {
        name: 'an out-of-bounds array index',
        patch: { op: 'replace', path: '/items/9', value: 1 },
        specific: 'PATCH_ARRAY_INDEX_OUT_OF_BOUNDS',
      },
      {
        name: 'an unknown op',
        patch: { op: 'bogus', path: '/a', value: 1 } as unknown as Patch,
        specific: 'PATCH_OPERATION_INVALID',
      },
      {
        name: 'a move whose from does not exist',
        patch: { op: 'move', from: '/a/missing', path: '/q' },
        specific: 'PATCH_OBJECT_PROPERTY_NOT_FOUND',
      },
      {
        name: 'a copy whose from does not exist',
        patch: { op: 'copy', from: '/a/missing', path: '/q' },
        specific: 'PATCH_OBJECT_PROPERTY_NOT_FOUND',
      },
      {
        name: 'a move into its own from subtree',
        patch: { op: 'move', from: '/a', path: '/a/c' },
        specific: 'PATCH_MOVE_INTO_DESCENDANT_FORBIDDEN',
      },
      {
        name: 'a path that does not start with / or #',
        patch: { op: 'add', path: 'a', value: 1 },
        specific: 'PATCH_PATH_INVALID',
      },
      {
        name: 'a missing intermediate container',
        patch: { op: 'add', path: '/nope/x', value: 1 },
        specific: 'PATCH_PATH_INVALID_INTERMEDIATE',
      },
    ])('throws $specific for $name', ({ patch, specific }) => {
      const document = { a: { b: 1 }, items: [1, 2, 3] };
      expect(() => applyPatch(document, [patch], { immutable })).toThrow(
        expect.objectContaining({ name: 'JSONPatch', specific }),
      );
    });
  });

  it('throws PATCH_TARGET_NOT_OBJECT when the document is a primitive', () => {
    expect(() =>
      applyPatch(5 as unknown as object, [{ op: 'add', path: '/a', value: 1 }]),
    ).toThrow(expect.objectContaining({ specific: 'PATCH_TARGET_NOT_OBJECT' }));
  });
});
