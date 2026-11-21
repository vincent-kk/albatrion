import { describe, expect, it } from 'vitest';

import { AbortError } from '@/common-utils/errors/AbortError';
import { TimeoutError } from '@/common-utils/errors/TimeoutError';

import { delay } from '../delay';
import { withTimeout } from '../withTimeout';

describe('withTimeout', () => {
  it('50ms api 호출, 100ms timeout', async () => {
    const result = await withTimeout(async () => {
      await delay(50);
      return 'foo';
    }, 100);

    expect(result).toEqual('foo');
  });

  it('100ms api 호출, 50ms timeout', async () => {
    await expect(withTimeout(() => delay(100), 50)).rejects.toThrow(
      'Timeout after 50ms',
    );
  });

  it('100ms api 호출, 50ms timeout, AbortSignal 입력', async () => {
    const controller = new AbortController();
    const signal = controller.signal;
    setTimeout(() => controller.abort(), 25);
    await expect(withTimeout(() => delay(100), 50, { signal })).rejects.toThrow(
      'Abort signal received',
    );
  });

  it('이미 abort 된 signal 이면 timeout 을 기다리지 않고 AbortError 로 거부한다.', async () => {
    const controller = new AbortController();
    controller.abort();
    const startedAt = Date.now();

    const error = await withTimeout(() => new Promise<never>(() => {}), 300, {
      signal: controller.signal,
    }).catch((reason: unknown) => reason);

    expect(error).toBeInstanceOf(AbortError);
    expect(error).not.toBeInstanceOf(TimeoutError);
    expect(Date.now() - startedAt).toBeLessThan(250);
  });
});
