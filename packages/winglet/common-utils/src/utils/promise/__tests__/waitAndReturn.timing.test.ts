import { describe, expect, it, vi } from 'vitest';

import { waitAndReturn } from '../waitAndReturn';

/**
 * waitAndReturn 은 결과든 예외든 지정한 지연 뒤에 전달해야 하고,
 * 그 사이 거부된 promise 를 핸들러 없이 방치해서는 안 된다.
 */
describe('waitAndReturn timing', () => {
  it('should delay a synchronous throw until the wait has elapsed', async () => {
    const start = Date.now();

    await expect(
      waitAndReturn(() => {
        throw new Error('sync failure');
      }, 60),
    ).rejects.toThrow('sync failure');

    expect(Date.now() - start).toBeGreaterThanOrEqual(50);
  });

  it('should not leave a rejected promise unhandled while waiting', async () => {
    const unhandled = vi.fn();
    process.on('unhandledRejection', unhandled);

    await waitAndReturn(() => Promise.reject(new Error('async failure')), 40)
      .then((value) => Promise.resolve(value).catch(() => undefined))
      .catch(() => undefined);
    await new Promise((resolve) => setTimeout(resolve, 60));

    process.off('unhandledRejection', unhandled);
    expect(unhandled).not.toHaveBeenCalled();
  });
});
