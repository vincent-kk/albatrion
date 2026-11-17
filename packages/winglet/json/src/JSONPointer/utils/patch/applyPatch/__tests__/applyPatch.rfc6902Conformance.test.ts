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

describe('applyPatch RFC 6902 conformance', () => {
  describe('move removes the source, then adds at the target (RFC 6902 4.4)', () => {
    it.each([true, false])(
      'moves an array element by insertion, Appendix A.7 (immutable %s)',
      (immutable) => {
        const source = { foo: ['all', 'grass', 'cows', 'eat'] };
        const patches: Patch[] = [
          { op: Operation.MOVE, from: '/foo/1', path: '/foo/3' },
        ];

        expect(applyPatch(source, patches, { immutable })).toEqual({
          foo: ['all', 'cows', 'eat', 'grass'],
        });
      },
    );

    it.each([true, false])(
      'closes the gap when moving out of an array (immutable %s)',
      (immutable) => {
        const result = applyPatch(
          { a: [1, 2, 3] },
          [{ op: Operation.MOVE, from: '/a/0', path: '/b' }],
          { immutable },
        );

        expect(result).toEqual({ a: [2, 3], b: 1 });
        expect(Object.keys(result.a)).toEqual(['0', '1']);
      },
    );

    it('leaves an immutable source unchanged after an array move', () => {
      const source = { foo: ['all', 'grass', 'cows', 'eat'], bar: [{ n: 1 }] };
      applyPatch(source, [
        { op: Operation.MOVE, from: '/foo/1', path: '/foo/3' },
        { op: Operation.MOVE, from: '/bar/0/n', path: '/n' },
      ]);

      expect(source).toEqual({
        foo: ['all', 'grass', 'cows', 'eat'],
        bar: [{ n: 1 }],
      });
    });

    it('inserts a moved object member into an array index', () => {
      expect(
        applyPatch({ items: [1, 2, 3], value: 10 }, [
          { op: Operation.MOVE, from: '/value', path: '/items/0' },
        ]),
      ).toEqual({ items: [10, 1, 2, 3] });
    });

    it('resolves the target path after the source is removed', () => {
      expect(
        applyPatch({ a: [{ n: 0 }, { n: 1 }, { n: 2 }] }, [
          { op: Operation.MOVE, from: '/a/0', path: '/a/1/moved' },
        ]),
      ).toEqual({ a: [{ n: 1 }, { n: 2, moved: { n: 0 } }] });
    });

    it.each([
      [{ a: 1 }, '/missing', 'PATCH_OBJECT_PROPERTY_NOT_FOUND'],
      [{ a: 1 }, '/toString', 'PATCH_OBJECT_PROPERTY_NOT_FOUND'],
      [{ a: [1] }, '/a/1', 'PATCH_ARRAY_INDEX_OUT_OF_BOUNDS'],
    ])(
      'fails when the from location of %j at %s does not exist',
      (source, from, code) => {
        expect(
          errorCodeOf(() =>
            applyPatch(source, [{ op: Operation.MOVE, from, path: '/b' }]),
          ),
        ).toBe(code);
      },
    );
  });

  describe('copy adds at the target (RFC 6902 4.5)', () => {
    it.each([
      [{ a: 1 }, '/missing'],
      [{ a: [1] }, '/a/1'],
      [{ a: 1 }, '/missing/deeper'],
    ])(
      'fails when the from location of %j at %s does not exist',
      (source, from) => {
        expect(
          errorCodeOf(() =>
            applyPatch(source, [{ op: Operation.COPY, from, path: '/b' }]),
          ),
        ).toBe('PATCH_OBJECT_PROPERTY_NOT_FOUND');
      },
    );

    it.each([true, false])(
      'inserts the copy into an array index (immutable %s)',
      (immutable) => {
        expect(
          applyPatch(
            { a: [1, 2, 3], x: 9 },
            [{ op: Operation.COPY, from: '/x', path: '/a/1' }],
            { immutable },
          ),
        ).toEqual({ a: [1, 9, 2, 3], x: 9 });
      },
    );

    it('copies a value into its own descendant', () => {
      expect(
        applyPatch({ a: { x: 1 } }, [
          { op: Operation.COPY, from: '/a', path: '/a/y' },
        ]),
      ).toEqual({ a: { x: 1, y: { x: 1 } } });
    });

    it('copies the root into its own member', () => {
      expect(
        applyPatch({ x: 1 }, [{ op: Operation.COPY, from: '', path: '/y' }]),
      ).toEqual({ x: 1, y: { x: 1 } });
    });
  });

  describe('from equal to path is not a circular reference', () => {
    it.each([
      [Operation.MOVE, { a: [1, 2] }, '/a/0', { a: [1, 2] }],
      [Operation.MOVE, { a: 1 }, '/a', { a: 1 }],
      [Operation.MOVE, { a: 1 }, '', { a: 1 }],
      [Operation.COPY, { a: { b: 1 } }, '/a', { a: { b: 1 } }],
      // copy is an add at the target, and an add at an array index inserts
      [Operation.COPY, { a: [1, 2] }, '/a/0', { a: [1, 1, 2] }],
    ] as const)('%s %j from and to %s', (op, source, pointer, expected) => {
      expect(
        applyPatch(source, [{ op, from: pointer, path: pointer }]),
      ).toEqual(expected);
    });
  });

  describe('test compares values in every mode (RFC 6902 4.6 and 5)', () => {
    it.each([
      [{ status: 'published' }, '/status', 'draft'],
      [{ list: [1, 2] }, '/list/1', 3],
      [{ baz: 'qux' }, '', { baz: 'bar' }],
    ])('rejects a mismatch in %j at %j by default', (source, path, value) => {
      expect(
        errorCodeOf(() =>
          applyPatch(source, [
            { op: Operation.TEST, path, value },
            { op: Operation.REPLACE, path: '/changed', value: true },
          ]),
        ),
      ).toBe('PATCH_TEST_FAILED');
    });
  });

  describe('replace requires an existing target (RFC 6902 4.3)', () => {
    it.each([false, true])(
      'rejects replacing a missing object member (strict %s)',
      (strict) => {
        expect(
          errorCodeOf(() =>
            applyPatch(
              { a: 1 },
              [{ op: Operation.REPLACE, path: '/b', value: 2 }],
              { strict },
            ),
          ),
        ).toBe('PATCH_OBJECT_PROPERTY_NOT_FOUND');
      },
    );
  });

  describe('inherited members are not document members', () => {
    it.each([
      [
        Operation.REPLACE,
        { op: Operation.REPLACE, path: '/toString', value: 1 },
      ],
      [Operation.TEST, { op: Operation.TEST, path: '/toString', value: 1 }],
      [Operation.TEST, { op: Operation.TEST, path: '/missing', value: 1 }],
    ] as const)('%s of an absent member fails', (_, patch) => {
      expect(errorCodeOf(() => applyPatch({ a: 1 }, [patch]))).toBe(
        'PATCH_OBJECT_PROPERTY_NOT_FOUND',
      );
    });
  });
});
