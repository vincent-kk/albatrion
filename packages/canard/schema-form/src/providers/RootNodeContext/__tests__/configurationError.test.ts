import { afterEach, expect, it, vi } from 'vitest';

import { FormErrorCode, SchemaFormError } from '@/schema-form/errors';

import type { FormErrorService } from '../../FormErrorContext';
import { createRootLoad } from '../utils/createRootLoad';
import { flushRootLoad } from '../utils/flushRootLoad';

afterEach(() => vi.unstubAllGlobals());

it('keeps configuration failure speculative until the load is flushed once', () => {
  const host = vi.fn();
  vi.stubGlobal('reportError', host);
  const capture = vi.fn();
  const reporter: FormErrorService = {
    load: 0,
    warningScope: {},
    beginLoad: vi.fn(),
    capture,
    hasConsumer: () => true,
    report: vi.fn(),
    reportInLoad: vi.fn(),
  };
  const error = new SchemaFormError(
    FormErrorCode.FormTypeInputMap,
    'Invalid input-map pattern',
    { path: '/**' },
  );
  const load = createRootLoad(
    { jsonSchema: { type: 'string' }, inputMapError: error },
    reporter,
  );

  expect(load.root).toBeUndefined();
  expect(capture).not.toHaveBeenCalled();
  expect(host).not.toHaveBeenCalled();
  flushRootLoad(load);
  flushRootLoad(load);
  expect(capture).toHaveBeenCalledExactlyOnceWith(error, 'load');
  expect(host).toHaveBeenCalledExactlyOnceWith(error);
});
