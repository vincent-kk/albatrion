import { afterEach, expect, it, vi } from 'vitest';

import { ValidationMode } from '@/schema-form/core';

import type { FormErrorService } from '../../FormErrorContext';
import { createRootLoad } from '../utils/createRootLoad';
import { resetRootLoad } from '../utils/resetRootLoad';

afterEach(() => vi.unstubAllGlobals());

it.each([false, true])(
  'IR-7 round b replacement reports an unprepared construction failure once (already reported=%s)',
  (reported) => {
    const host = vi.fn();
    vi.stubGlobal('reportError', host);
    const capture = vi.fn();
    const reporter: FormErrorService = {
      loadEpoch: 0,
      warningScope: {},
      beginLoad: vi.fn(),
      capture,
      hasConsumer: () => true,
      report: vi.fn(),
      reportInLoad: vi.fn(),
    };
    const first = createRootLoad(
      { jsonSchema: { type: 'string' }, validationMode: ValidationMode.None },
      reporter,
    );
    const failure = new Error('construction before first commit');
    first.error = failure;
    first.isReported = reported;
    const second = resetRootLoad(
      first,
      { jsonSchema: { type: 'number' }, validationMode: ValidationMode.None },
      undefined,
      true,
    );
    expect(first.isPrepared).toBe(false);
    expect(first.isReported).toBe(true);
    expect(capture).toHaveBeenCalledTimes(reported ? 0 : 1);
    expect(host).toHaveBeenCalledTimes(reported ? 0 : 1);
    if (!reported) {
      expect(capture).toHaveBeenCalledWith(failure, 'load');
      expect(host).toHaveBeenCalledWith(failure);
    }
    expect(reporter.root).toBe(second.root);
  },
);
