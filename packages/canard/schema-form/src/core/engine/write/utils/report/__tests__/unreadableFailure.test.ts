import { expect, it } from 'vitest';

import { FormErrorCode, SchemaFormError } from '@/schema-form/errors';

import { forEachFailureLeaf } from '../forEachFailureLeaf';

it.each(['details', 'errors', 'index', 'length'] as const)(
  'DR-17 review visits an unreadable %s bundle as one opaque leaf at both depths',
  (kind) => {
    const inspection = new Error('inspection must remain internal');
    const get = () => {
      throw inspection;
    };
    const A = new Error('A'),
      H = new Error('H');
    const errors = [A, A];
    const failure = new SchemaFormError(
      FormErrorCode.MultipleErrors,
      'unreadable',
      { errors },
    );
    if (kind === 'details') Object.defineProperty(failure, 'details', { get });
    else if (kind === 'errors')
      Object.defineProperty(failure.details, 'errors', { get });
    else if (kind === 'index') Object.defineProperty(errors, 1, { get });
    else
      failure.details.errors = new Proxy(errors, {
        get: (target, key, receiver) =>
          key === 'length' ? get() : Reflect.get(target, key, receiver),
      });
    const direct: unknown[] = [];
    expect(() =>
      forEachFailureLeaf(failure, (value) => direct.push(value)),
    ).not.toThrow();
    expect(direct).toHaveLength(1);
    expect(direct[0]).toBe(failure);
    const outer = new SchemaFormError(FormErrorCode.MultipleErrors, 'outer', {
      errors: [A, failure, H],
    });
    const nested: unknown[] = [];
    expect(() =>
      forEachFailureLeaf(outer, (value) => nested.push(value)),
    ).not.toThrow();
    expect(nested).toHaveLength(3);
    expect(nested[0]).toBe(A);
    expect(nested[1]).toBe(failure);
    expect(nested[2]).toBe(H);
  },
);

it.each([false, true])(
  'DR-17 review preserves sink exceptions for bundle=%s',
  (bundled) => {
    const leaf = new Error('leaf');
    const failure = bundled
      ? new SchemaFormError(FormErrorCode.MultipleErrors, 'bundle', {
          errors: [leaf],
        })
      : leaf;
    const sinkFailure = new Error('sink');
    expect(() =>
      forEachFailureLeaf(failure, () => {
        throw sinkFailure;
      }),
    ).toThrow(sinkFailure);
  },
);
