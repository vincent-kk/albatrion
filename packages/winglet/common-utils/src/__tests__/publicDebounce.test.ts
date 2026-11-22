import { describe, expect, it, vi } from 'vitest';

import { debounce } from '../index';

describe('debounce', () => {
  it('디바운스된 함수 안에서 다시 호출한 호출은 다음 trailing 에서 실행된다.', () => {
    vi.useFakeTimers();
    try {
      const calls: number[] = [];
      const debounced = debounce((value: number) => {
        calls.push(value);
        if (value === 1) debounced(2);
      }, 100);

      debounced(1);
      vi.advanceTimersByTime(100);
      vi.advanceTimersByTime(100);

      expect(calls).toEqual([1, 2]);
    } finally {
      vi.useRealTimers();
    }
  });

  it('execute() 로 실행한 함수 안의 재호출도 다음 trailing 에서 실행된다.', () => {
    vi.useFakeTimers();
    try {
      const calls: number[] = [];
      const debounced = debounce((value: number) => {
        calls.push(value);
        if (value === 1) debounced(2);
      }, 100);

      debounced(1);
      debounced.execute();
      vi.advanceTimersByTime(100);

      expect(calls).toEqual([1, 2]);
    } finally {
      vi.useRealTimers();
    }
  });

  it('예외를 던진 leading 호출은 trailing 에서 다시 실행되지 않는다.', () => {
    vi.useFakeTimers();
    try {
      const fn = vi.fn(() => {
        throw new Error('fail');
      });
      const debounced = debounce(fn, 100, { leading: true, trailing: true });

      expect(() => debounced()).toThrow('fail');
      vi.advanceTimersByTime(100);

      expect(fn).toHaveBeenCalledTimes(1);
    } finally {
      vi.useRealTimers();
    }
  });
});
