import { expect, it } from 'vitest';

import { FormErrorCode, SchemaFormError } from '@/schema-form/errors';

import { createKnownCaptureService } from './helpers/createKnownCaptureService';

it.each(['details', 'errors', 'index', 'length'] as const)(
  'DR-16 review captures an unreadable nested %s bundle without throwing',
  (kind) => {
    const { service, onError, A, H } = createKnownCaptureService();
    const inspection = new Error('inspection must remain internal');
    const get = () => {
      throw inspection;
    };
    const errors = [A, A];
    const nested = new SchemaFormError(FormErrorCode.MultipleErrors, 'nested', {
      errors,
    });
    if (kind === 'details') Object.defineProperty(nested, 'details', { get });
    else if (kind === 'errors')
      Object.defineProperty(nested.details, 'errors', { get });
    else if (kind === 'index') Object.defineProperty(errors, 1, { get });
    else
      nested.details.errors = new Proxy(errors, {
        get: (target, key, receiver) =>
          key === 'length' ? get() : Reflect.get(target, key, receiver),
      });
    const outer = new SchemaFormError(FormErrorCode.MultipleErrors, 'outer', {
      errors: [nested, H],
    });
    expect(() => service.capture(outer, 'render', 'stack')).not.toThrow();
    expect(onError).toHaveBeenCalledExactlyOnceWith(
      expect.objectContaining({
        code: FormErrorCode.RenderFailed,
        error: outer,
      }),
    );
  },
);
