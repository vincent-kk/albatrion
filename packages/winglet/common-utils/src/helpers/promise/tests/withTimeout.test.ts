import { describe, expect, it } from 'vitest';

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
});
