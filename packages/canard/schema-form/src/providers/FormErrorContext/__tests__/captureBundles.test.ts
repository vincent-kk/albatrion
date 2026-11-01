import { expect, it, vi } from 'vitest';

import { FormErrorCode, SchemaFormError } from '@/schema-form/errors';

import { createFormErrorService } from '../utils/createFormErrorService';

it('DR-14 drops a known failure bundle and a bare handler exception during capture', () => {
  const service = createFormErrorService();
  const failure = new Error('compile');
  const handler = new Error('handler');
  const onError = vi.fn().mockImplementationOnce(() => {
    throw handler;
  });
  service.onError = onError;
  expect(() =>
    service.report({
      level: 'error',
      code: FormErrorCode.ValidatorCompileFailed,
      message: 'compile',
      origin: 'validate',
      error: failure,
    }),
  ).toThrow(handler);
  service.capture(
    new SchemaFormError(FormErrorCode.MultipleErrors, 'bundle', {
      errors: [failure, handler],
    }),
    'submit',
  );
  service.capture(handler, 'render', 'component stack');
  expect(onError).toHaveBeenCalledOnce();
});

it('DR-14 captures a bundle containing an unseen object', () => {
  const service = createFormErrorService();
  const onError = vi.fn();
  service.onError = onError;
  const first = new Error('known');
  service.report({
    level: 'error',
    code: FormErrorCode.ValidatorCompileFailed,
    message: 'compile',
    origin: 'validate',
    error: first,
  });
  const bundle = new SchemaFormError(
    FormErrorCode.MultipleErrors,
    'unseen bundle',
    { errors: [first, new Error('unseen')] },
  );
  service.capture(bundle, 'submit');
  expect(onError).toHaveBeenCalledTimes(2);
  expect(onError.mock.calls[1][0].error).toBe(bundle);
});
