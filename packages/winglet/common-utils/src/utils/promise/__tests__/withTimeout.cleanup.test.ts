import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { withTimeout } from '../withTimeout';

/**
 * withTimeout 이 경주에서 진 타이머를 남기지 않는지 검증한다.
 * 남은 타이머는 Node 프로세스 종료를 지연시키고 반복 호출에서 누적된다.
 */
describe('withTimeout cleanup', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should clear the timeout timer once the function wins the race', async () => {
    const result = await withTimeout(async () => 'fast', 3000);

    expect(result).toBe('fast');
    expect(vi.getTimerCount()).toBe(0);
  });

  it('should not accumulate timers across repeated calls', async () => {
    for (let index = 0; index < 5; index++)
      await withTimeout(async () => index, 3000);

    expect(vi.getTimerCount()).toBe(0);
  });
});
