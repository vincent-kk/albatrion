import { afterEach, expect, it, vi } from 'vitest';

import { ValidationMode } from '@/schema-form/core';
import {
  FormErrorCode,
  type FormErrorRecord,
  SchemaFormError,
} from '@/schema-form/errors';

import type { FormErrorService } from '../../FormErrorContext';
import { createRootLoad } from '../utils/createRootLoad';
import { flushRootLoad } from '../utils/flushRootLoad';
import { reportLoadValidationFailure } from '../utils/reportLoadValidationFailure';
import { resetRootLoad } from '../utils/resetRootLoad';

afterEach(() => vi.unstubAllGlobals());

it.each(['flush', 'reset'] as const)(
  'AM16 %s load expands a buffered-record handler bundle',
  (kind) => {
    const X = new Error('X'),
      Y = new Error('Y');
    const handler = new SchemaFormError(
      FormErrorCode.MultipleErrors,
      'handler',
      { errors: [X, Y] },
    );
    const onError = vi.fn<(record: FormErrorRecord) => void>((record) => {
      if (record.message === 'target') throw handler;
    });
    const service: FormErrorService = {
      load: 0,
      warningScope: {},
      beginLoad: vi.fn(),
      capture: vi.fn(),
      hasConsumer: () => true,
      report: onError,
      reportInLoad: onError,
    };
    const load = createRootLoad(
      { jsonSchema: { type: 'string' }, validationMode: ValidationMode.None },
      service,
    );
    load.records.length = 0;
    load.records.push({
      level: 'error',
      origin: 'load',
      code: FormErrorCode.ListenerThrew,
      message: 'target',
    });
    const host = vi.fn();
    vi.stubGlobal('reportError', host);
    if (kind === 'flush') flushRootLoad(load);
    else
      resetRootLoad(
        load,
        { jsonSchema: { type: 'number' }, validationMode: ValidationMode.None },
        undefined,
        true,
      );
    expect(
      onError.mock.calls.filter(([record]) => record.message === 'target'),
    ).toHaveLength(1);
    expect(host).toHaveBeenCalledTimes(2);
    expect(host.mock.calls[0][0]).toBe(X);
    expect(host.mock.calls[1][0]).toBe(Y);
  },
);

it('AM16 slot reports a malformed non-array bundle exactly once', () => {
  const failure = new SchemaFormError(
    FormErrorCode.MultipleErrors,
    'malformed',
    { errors: 'not an array' },
  );
  const host = vi.fn();
  vi.stubGlobal('reportError', host);
  reportLoadValidationFailure(failure);
  expect(host).toHaveBeenCalledTimes(1);
  expect(host.mock.calls[0][0]).toBe(failure);
});
