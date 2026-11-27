import { afterEach, expect, it, vi } from 'vitest';

import {
  FormErrorCode,
  type FormErrorRecord,
  SchemaFormError,
} from '@/schema-form/errors';

import { createFormErrorService } from '../utils/createFormErrorService';

afterEach(() => vi.unstubAllGlobals());

it.each(['code', 'details', 'toString'] as const)(
  'AM16 capture opaque fallback for unreadable top-level %s',
  (kind) => {
    const inspection = new Error('inspection');
    const get = () => {
      throw inspection;
    };
    const failure =
      kind === 'details'
        ? new SchemaFormError(FormErrorCode.MultipleErrors, 'unreadable', {
            errors: [],
          })
        : {};
    if (kind === 'toString')
      Object.defineProperty(failure, 'toString', { value: get });
    else Object.defineProperty(failure, kind, { get });
    const service = createFormErrorService(),
      onError = vi.fn(),
      host = vi.fn();
    service.onError = onError;
    vi.stubGlobal('reportError', host);
    expect(() =>
      service.capture(failure, 'submit', undefined, '/field'),
    ).not.toThrow();
    expect(onError).toHaveBeenCalledTimes(1);
    const record = onError.mock.calls[0][0];
    expect(record.error).toBe(failure);
    expect(record).toMatchObject({
      code: FormErrorCode.RenderFailed,
      message: 'Unable to inspect captured failure',
      origin: 'submit',
      path: '/field',
    });
    expect(record.details).toBeUndefined();
    expect(host).not.toHaveBeenCalled();
  },
);

it('AM16 capture fallback still routes its handler bundle exactly once', () => {
  const failure = Object.defineProperty({}, 'code', {
    get: () => {
      throw new Error('inspection');
    },
  });
  const X = new Error('X'),
    Y = new Error('Y');
  const handler = new SchemaFormError(FormErrorCode.MultipleErrors, 'handler', {
    errors: [X, Y],
  });
  const service = createFormErrorService(),
    onError = vi.fn<(record: FormErrorRecord) => void>(() => {
      throw handler;
    }),
    host = vi.fn();
  service.onError = onError;
  vi.stubGlobal('reportError', host);
  expect(() =>
    service.capture(failure, 'render', 'component stack', '/field'),
  ).not.toThrow();
  expect(onError).toHaveBeenCalledTimes(1);
  const record = onError.mock.calls[0][0];
  expect(record.error).toBe(failure);
  expect(record).toMatchObject({
    message: 'Unable to inspect captured failure',
    origin: 'render',
    componentStack: 'component stack',
    path: '/field',
  });
  expect(host).toHaveBeenCalledTimes(2);
  expect(host.mock.calls[0][0]).toBe(X);
  expect(host.mock.calls[1][0]).toBe(Y);
});

it('AM16 capture host expands an onError handler bundle', () => {
  const X = new Error('X'),
    Y = new Error('Y'),
    E = new Error('E');
  const handler = new SchemaFormError(FormErrorCode.MultipleErrors, 'handler', {
    errors: [X, Y],
  });
  const service = createFormErrorService(),
    onError = vi.fn<(record: FormErrorRecord) => void>(() => {
      throw handler;
    }),
    host = vi.fn();
  service.onError = onError;
  vi.stubGlobal('reportError', host);
  service.capture(E, 'render', 'stack');
  expect(onError).toHaveBeenCalledTimes(1);
  expect(host).toHaveBeenCalledTimes(2);
  expect(host.mock.calls[0][0]).toBe(X);
  expect(host.mock.calls[1][0]).toBe(Y);
});
