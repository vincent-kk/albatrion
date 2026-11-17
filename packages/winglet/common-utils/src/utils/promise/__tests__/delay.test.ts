import { describe, expect, it, vi } from 'vitest';

import { delay } from '../delay';

describe('delay', () => {
  it('100ms delay는 99ms에는 resolve되지 않고 100ms에 resolve된다', async () => {
    // 실제 타이머의 경과 시간은 이벤트 루프 시각 기준이라 1ms 짧게 측정될 수 있다.
    // 가상 타이머로 경계를 고정한다.
    vi.useFakeTimers();
    try {
      const resolved = vi.fn();
      const promise = delay(100).then(resolved);

      await vi.advanceTimersByTimeAsync(99);
      expect(resolved).not.toHaveBeenCalled();

      await vi.advanceTimersByTimeAsync(1);
      expect(resolved).toHaveBeenCalledTimes(1);
      await promise;
    } finally {
      vi.useRealTimers();
    }
  });

  it('AbortSignal을 통한 delay 취소', async () => {
    const controller = new AbortController();
    const signal = controller.signal;
    setTimeout(() => controller.abort(), 50);
    await expect(delay(100, { signal })).rejects.toThrow(
      'Abort signal received',
    );
  });

  it('delay 동작 전 abort 된 Signal 입력', async () => {
    const controller = new AbortController();
    const { signal } = controller;
    const spy = vi.spyOn(global, 'setTimeout');
    controller.abort();
    await expect(delay(100, { signal })).rejects.toThrow('Aborted before run');
    expect(spy).not.toHaveBeenCalled();
    spy.mockRestore();
  });
});
