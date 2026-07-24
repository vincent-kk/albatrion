import { describe, expect, it, vi } from 'vitest';

import { waitAndExecute } from '../waitAndExecute';

describe('waitAndExecute', () => {
  it('should execute the function after the specified delay', async () => {
    // 실제 타이머로 경과 시간을 재면 Date.now()의 ms 해상도와 setTimeout의
    // 조기 발화 때문에 99ms가 측정될 수 있다. 가상 타이머로 경계를 고정한다.
    vi.useFakeTimers();
    try {
      const fn = vi.fn().mockReturnValue('result');
      const promise = waitAndExecute(fn, 100);

      // 지정한 delay 이전에는 실행되지 않는다
      await vi.advanceTimersByTimeAsync(99);
      expect(fn).not.toHaveBeenCalled();

      // 지정한 delay에 도달하면 실행된다
      await vi.advanceTimersByTimeAsync(1);
      expect(fn).toHaveBeenCalledTimes(1);
      await expect(promise).resolves.toBe('result');
    } finally {
      vi.useRealTimers();
    }
  });

  it('should use default delay of 0 if not specified', async () => {
    const fn = vi.fn().mockReturnValue('result');

    const result = await waitAndExecute(fn);

    expect(result).toBe('result');
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('should handle undefined function', async () => {
    const result = await waitAndExecute(undefined, 100);

    expect(result).toBeUndefined();
  });

  it('should handle async functions', async () => {
    const fn = vi.fn().mockResolvedValue('async result');

    const result = await waitAndExecute(fn, 100);

    expect(result).toBe('async result');
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('should handle functions that throw errors', async () => {
    const error = new Error('Test error');
    const fn = vi.fn().mockImplementation(() => {
      throw error;
    });

    await expect(waitAndExecute(fn, 100)).rejects.toThrow('Test error');
    expect(fn).toHaveBeenCalledTimes(1);
  });
});
