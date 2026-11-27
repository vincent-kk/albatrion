import { expect, vi } from 'vitest';

import { FormErrorCode } from '@/schema-form/errors';

import type { FormErrorService } from '../../type';
import { createFormErrorService } from '../../utils/createFormErrorService';

/**
 * Prepare two reported failures and an exception thrown by their consumer.
 * @returns The reporter, callback and original objects for identity assertions.
 */
export const createKnownCaptureService = () => {
  const service = createFormErrorService();
  const onError = vi.fn<NonNullable<FormErrorService['onError']>>();
  const A = new Error('first listener');
  const B = new Error('second listener');
  const H = new Error('error handler');
  service.onError = onError;
  onError.mockImplementationOnce(() => {
    throw H;
  });
  for (const error of [A, B]) {
    const report = () =>
      service.report({
        level: 'error',
        code: FormErrorCode.ListenerThrew,
        message: error.message,
        origin: 'write',
        error,
      });
    if (error === A) expect(report).toThrow(H);
    else report();
  }
  onError.mockClear();
  return { service, onError, A, B, H };
};
