import { describe, expect, it, vi } from 'vitest';

import { waitAndReturn } from '../waitAndReturn';

describe('waitAndReturn', () => {
  it('should call the function at once and deliver its result only after the delay', async () => {
    // 실제 타이머로 경과 시간을 재면 Node 타이머가 이벤트 루프의 캐시된 시각을 기준으로
    // 잡혀 99ms가 측정될 수 있다. 가상 타이머로 경계를 고정한다.
    vi.useFakeTimers();
    try {
      const fn = vi.fn().mockReturnValue('result');
      const delivered = vi.fn();
      const promise = waitAndReturn(fn, 100).then(delivered);

      // fn은 마이크로태스크에서 시작하므로 시간을 흘리지 않고 큐만 비운다
      await vi.advanceTimersByTimeAsync(0);
      expect(fn).toHaveBeenCalledTimes(1);

      await vi.advanceTimersByTimeAsync(99);
      expect(delivered).not.toHaveBeenCalled();

      await vi.advanceTimersByTimeAsync(1);
      expect(delivered).toHaveBeenCalledWith('result');
      await promise;
    } finally {
      vi.useRealTimers();
    }
  });

  it('should use default delay of 0 if not specified', async () => {
    const fn = vi.fn().mockReturnValue('result');

    const result = await waitAndReturn(fn);

    expect(result).toBe('result');
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('should handle undefined function', async () => {
    const result = await waitAndReturn(undefined, 100);

    expect(result).toBeUndefined();
  });

  it('should handle async functions', async () => {
    const fn = vi.fn().mockResolvedValue('async result');

    const result = await waitAndReturn(fn, 100);

    expect(result).toBe('async result');
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('should handle functions that throw errors', async () => {
    const error = new Error('Test error');
    const fn = vi.fn().mockImplementation(() => {
      throw error;
    });

    await expect(waitAndReturn(fn, 100)).rejects.toThrow('Test error');
    expect(fn).toHaveBeenCalledTimes(1);
  });
});
