import { describe, expect, it } from 'vitest';

import { timeout } from '../timeout';

describe('timeout', () => {
  it('50ms 이후 timeout 에러 발생', async () => {
    await expect(timeout(50)).rejects.toThrow('Timeout after 50ms');
  });

  it('AbortSignal을 통한 timeout 취소', async () => {
    const controller = new AbortController();
    const signal = controller.signal;
    setTimeout(() => controller.abort(), 50);
    await expect(timeout(100, { signal })).rejects.toThrow(
      'Abort signal received',
    );
  });

  it('timeout 동작 전 abort 된 Signal 입력', async () => {
    const controller = new AbortController();
    const signal = controller.signal;
    controller.abort();
    await expect(timeout(100, { signal })).rejects.toThrow(
      'Aborted before run',
    );
  });
});
