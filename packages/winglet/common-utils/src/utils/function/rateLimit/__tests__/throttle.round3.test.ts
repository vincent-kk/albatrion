import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { debounce } from '../debounce';
import { throttle } from '../throttle';

describe('round-3 throttle window ownership', () => {
  beforeEach(() => { vi.useFakeTimers(); vi.setSystemTime(0); });
  afterEach(() => { vi.clearAllTimers(); vi.useRealTimers(); });

  it('a cleared wrapper starts the same window as a fresh wrapper', () => {
    for (const leading of [true, false]) {
      const resumed = vi.fn();
      const fresh = vi.fn();
      const first = throttle(resumed, 100, { leading });
      first(0);
      first.clear();
      resumed.mockClear();
      vi.advanceTimersByTime(10);
      const second = throttle(fresh, 100, { leading });
      for (const value of [1, 2, 3]) { first(value); second(value); }
      vi.advanceTimersByTime(100);
      expect(resumed.mock.calls).toEqual(fresh.mock.calls);
      expect(resumed.mock.calls).toEqual(leading ? [[1], [3]] : [[3]]);
      first.dispose(); second.dispose();
    }
  });

  it('an exact timer boundary behaves like a later idle window', () => {
    for (const leading of [true, false]) {
      const exact = vi.fn(); const late = vi.fn();
      const a = throttle(exact, 100, { leading });
      const b = throttle(late, 100, { leading });
      a(0); b(0);
      vi.advanceTimersByTime(100);
      a(1); a(2); a(3);
      vi.advanceTimersByTime(1);
      b(1); b(2); b(3);
      vi.advanceTimersByTime(100);
      expect(exact.mock.calls).toEqual(late.mock.calls);
      expect(exact.mock.calls.slice(-1)[0]).toEqual([3]);
      a.dispose(); b.dispose();
    }
  });

  it('long waits do not overflow the host timer range', () => {
    for (const ms of [2 ** 31, Infinity]) {
      for (const create of [debounce, throttle]) {
        const fn = vi.fn(); const wrapper = create(fn, ms, { leading: false });
        wrapper(); vi.advanceTimersByTime(100);
        expect(fn).not.toHaveBeenCalled(); wrapper.dispose();
      }
    }
  });

  it('a trailing callback can reenter without synchronous recursion', () => {
    let count = 0;
    const wrapper = throttle(() => { count++; wrapper(); }, 100);
    expect(() => { wrapper(); vi.advanceTimersByTime(100); }).not.toThrow();
    expect(count).toBeLessThanOrEqual(3);
    wrapper.dispose();
  });
});
