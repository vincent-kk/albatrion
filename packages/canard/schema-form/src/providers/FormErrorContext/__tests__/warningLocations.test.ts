import { expect, it, vi } from 'vitest';

import { type FormErrorRecord, FormWarningCode } from '@/schema-form/errors';

import { createFormErrorService } from '../utils/createFormErrorService';

/** A blueprint warning has a schema location even when it has no data path. */
const first: FormErrorRecord = {
  code: FormWarningCode.DiscriminatorBranchUnreachable,
  level: 'warning',
  message: 'Unreachable discriminator branch',
  schemaPath: '#/oneOf/0',
  origin: 'load',
  details: { propertyName: 'kind', reason: 'empty' },
};

it('delivers each schema location once and starts a fresh scope for a new load', () => {
  const service = createFormErrorService();
  const onError = vi.fn();
  service.onError = onError;
  const second: FormErrorRecord = { ...first, schemaPath: '#/oneOf/1' };
  service.report(first);
  service.report(second);
  service.report({ ...first });
  expect(onError.mock.calls.map(([record]) => record)).toEqual([first, second]);
  service.beginLoad();
  service.report(first);
  service.report(second);
  service.report(second);
  expect(onError.mock.calls.map(([record]) => record)).toEqual([
    first,
    second,
    first,
    second,
  ]);
});

it('retains runtime data-path deduplication independently of origin', () => {
  const service = createFormErrorService();
  const onError = vi.fn();
  service.onError = onError;
  const runtime: FormErrorRecord = {
    ...first,
    schemaPath: undefined,
    path: '/field',
  };
  service.report(runtime);
  service.report({ ...runtime, origin: 'write' });
  service.report({ ...runtime, path: '/other' });
  expect(onError).toHaveBeenCalledTimes(2);
  service.beginLoad();
  service.report(runtime);
  expect(onError).toHaveBeenCalledTimes(3);
});

it('keeps a buffered warning in its original load scope after replacement', () => {
  const service = createFormErrorService();
  const onError = vi.fn();
  service.onError = onError;
  const previous = service.warningScope;
  service.report(first);
  service.beginLoad();
  service.reportInLoad({ ...first }, previous);
  expect(onError).toHaveBeenCalledTimes(1);
  service.report(first);
  service.reportInLoad({ ...first }, previous);
  expect(onError).toHaveBeenCalledTimes(2);
});
