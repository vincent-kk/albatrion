import { expect, it, vi } from 'vitest';

import { FormErrorCode, SchemaFormError } from '@/schema-form/errors';

import { deliverChainRecords } from '../deliverChainRecords';
import { reportValidationFailure } from '../reportValidationFailure';

it('AM16 deliverChainRecords expands an ownerless handler bundle', () => {
  const X = new Error('X'),
    Y = new Error('Y');
  const handler = new SchemaFormError(FormErrorCode.MultipleErrors, 'handler', {
    errors: [X, Y],
  });
  const runtime = {
    reportingErrors: false,
    errorReporter: {
      hasConsumer: () => true,
      report: vi.fn(() => {
        throw handler;
      }),
    },
  };
  const host = vi.spyOn(console, 'error').mockImplementation(() => undefined);
  try {
    deliverChainRecords(
      runtime,
      [
        {
          level: 'error',
          code: FormErrorCode.ListenerThrew,
          message: 'target',
        },
      ],
      undefined,
      false,
      'write',
    );
    expect(runtime.errorReporter.report).toHaveBeenCalledTimes(1);
    expect(host).toHaveBeenCalledTimes(2);
    expect(host.mock.calls[0][0]).toBe(X);
    expect(host.mock.calls[1][0]).toBe(Y);
    expect(runtime.reportingErrors).toBe(false);
  } finally {
    host.mockRestore();
  }
});

it('AM16 reportValidationFailure expands handler leaves before the original', () => {
  const X = new Error('X'),
    Y = new Error('Y'),
    E = new Error('E');
  const handler = new SchemaFormError(FormErrorCode.MultipleErrors, 'handler', {
    errors: [X, Y],
  });
  const runtime = {
    reportingErrors: false,
    errorReporter: {
      hasConsumer: () => true,
      report: vi.fn(() => {
        throw handler;
      }),
    },
  };
  const host = vi.spyOn(console, 'error').mockImplementation(() => undefined);
  try {
    reportValidationFailure(runtime, E);
    expect(runtime.errorReporter.report).toHaveBeenCalledTimes(1);
    expect(host).toHaveBeenCalledTimes(3);
    expect(host.mock.calls[0][0]).toBe(X);
    expect(host.mock.calls[1][0]).toBe(Y);
    expect(host.mock.calls[2][0]).toBe(E);
    expect(runtime.reportingErrors).toBe(false);
  } finally {
    host.mockRestore();
  }
});

it('AM16 reportValidationFailure expands the original bundle without a reporter', () => {
  const X = new Error('X'),
    Y = new Error('Y');
  const failure = new SchemaFormError(
    FormErrorCode.MultipleErrors,
    'original',
    { errors: [X, Y] },
  );
  const host = vi.spyOn(console, 'error').mockImplementation(() => undefined);
  try {
    reportValidationFailure({ reportingErrors: false }, failure);
    expect(host).toHaveBeenCalledTimes(2);
    expect(host.mock.calls[0][0]).toBe(X);
    expect(host.mock.calls[1][0]).toBe(Y);
  } finally {
    host.mockRestore();
  }
});
