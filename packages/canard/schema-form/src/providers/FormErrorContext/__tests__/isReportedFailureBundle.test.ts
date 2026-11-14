import { expect, it } from 'vitest';

import { FormErrorCode, SchemaFormError } from '@/schema-form/errors';

import { isReportedFailureBundle } from '../utils/isReportedFailureBundle';

it('AM16 predicate directly rejects a prototype-only bundle without details', () => {
  const failure: SchemaFormError = Object.create(SchemaFormError.prototype);
  Object.defineProperty(failure, 'code', {
    value: FormErrorCode.MultipleErrors,
  });
  let result: boolean | undefined;
  expect(() => {
    result = isReportedFailureBundle([failure], new WeakSet(), new WeakSet());
  }).not.toThrow();
  expect(result).toBe(false);
});

it.each(['details', 'errors', 'index', 'length'] as const)(
  'AM16 predicate directly rejects unreadable %s without throwing',
  (kind) => {
    const A = new Error('known'),
      errors = [A];
    const failure = new SchemaFormError(
      FormErrorCode.MultipleErrors,
      'nested',
      { errors },
    );
    const get = () => {
      throw new Error('inspection');
    };
    if (kind === 'details') Object.defineProperty(failure, 'details', { get });
    else if (kind === 'errors')
      Object.defineProperty(failure.details, 'errors', { get });
    else if (kind === 'index') Object.defineProperty(errors, 0, { get });
    else
      failure.details.errors = new Proxy(errors, {
        get: (target, key, receiver) =>
          key === 'length' ? get() : Reflect.get(target, key, receiver),
      });
    let result: boolean | undefined;
    expect(() => {
      result = isReportedFailureBundle(
        [failure],
        new WeakSet([A]),
        new WeakSet(),
      );
    }).not.toThrow();
    expect(result).toBe(false);
  },
);
