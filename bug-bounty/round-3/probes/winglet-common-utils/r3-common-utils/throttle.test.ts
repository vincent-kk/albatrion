import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { debounce, throttle } from '@/common-utils/index';

describe('throttle window bookkeeping', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it('after clear(), calls inside the old window are still throttled', () => {
    const fn = vi.fn();
    const throttled = throttle(fn, 1000);
    throttled(1); // leading run, window opens
    throttled.clear();
    vi.advanceTimersByTime(10);
    throttled(2);
    vi.advanceTimersByTime(10);
    throttled(3);
    vi.advanceTimersByTime(10);
    throttled(4);
    // Either clear() keeps the window (no new leading run) or it starts a new window
    // (one leading run); a third and fourth synchronous run is never throttling.
    expect(fn.mock.calls.length).toBeLessThanOrEqual(2);
  });

  it('after clear(), a trailing-only throttle still delivers the next call', () => {
    const fn = vi.fn();
    const throttled = throttle(fn, 1000, { leading: false });
    throttled(1);
    throttled.clear();
    vi.advanceTimersByTime(10);
    throttled(2);
    vi.advanceTimersByTime(10_000);
    expect(fn.mock.calls).toEqual([[2]]);
  });

  it('a call that lands exactly when the window timer fires does not disable throttling', () => {
    const fn = vi.fn();
    const throttled = throttle(fn, 100);
    throttled(1); // t=0, leading
    vi.advanceTimersByTime(100); // window timer fires, nothing pending
    throttled(2); // t=100
    throttled(3); // t=100, same millisecond
    vi.advanceTimersByTime(1);
    throttled(4); // t=101
    // At most one leading run for the window that starts at t=100.
    expect(fn.mock.calls.slice(1).length).toBeLessThanOrEqual(1);
  });

  it('a trailing-only call that lands exactly when the window timer fires is delivered', () => {
    const fn = vi.fn();
    const throttled = throttle(fn, 100, { leading: false });
    throttled(1); // t=0
    vi.advanceTimersByTime(100); // trailing run with 1
    throttled(2); // t=100, last call ever
    vi.advanceTimersByTime(10_000);
    expect(fn.mock.calls).toEqual([[1], [2]]);
  });

  it('control: debounce clear() then call still runs once after the wait', () => {
    const fn = vi.fn();
    const debounced = debounce(fn, 100);
    debounced(1);
    debounced.clear();
    debounced(2);
    vi.advanceTimersByTime(100);
    expect(fn.mock.calls).toEqual([[2]]);
  });
});

describe('throttle with real timers', () => {
  it('a trailing-only throttle fed by an interval of the same period delivers the final value', async () => {
    const trials = [5, 6, 7, 8, 9, 10, 11, 12];
    const lost: number[] = [];
    await Promise.all(
      trials.map(
        (last) =>
          new Promise<void>((resolve) => {
            const delivered: number[] = [];
            const throttled = throttle((value: number) => delivered.push(value), 40, {
              leading: false,
            });
            let i = 0;
            const interval = setInterval(() => {
              i++;
              throttled(i);
              if (i === last) {
                clearInterval(interval);
                setTimeout(() => {
                  if (delivered[delivered.length - 1] !== last) lost.push(last);
                  resolve();
                }, 300);
              }
            }, 40);
          }),
      ),
    );
    expect(lost).toEqual([]);
  });
});

describe('throttle with real timers, leading and trailing', () => {
  it('never runs three times inside one window when fed every few milliseconds', async () => {
    const wait = 30;
    const runs: number[] = [];
    const throttled = throttle(() => runs.push(performance.now()), wait);
    await new Promise<void>((resolve) => {
      const started = performance.now();
      const interval = setInterval(() => {
        throttled();
        if (performance.now() - started > 1500) {
          clearInterval(interval);
          setTimeout(resolve, wait * 3);
        }
      }, 1);
    });
    let triples = 0;
    for (let i = 2; i < runs.length; i++)
      if (runs[i] - runs[i - 2] < wait / 2) triples++;
    expect({ runs: runs.length, triples }).toEqual({ runs: runs.length, triples: 0 });
  });
});

describe('control: lodash throttle under the same real-timer feed', () => {
  it('lodash never runs three times inside one window', async () => {
    const { default: lodashThrottle } = await import('lodash/throttle.js');
    const wait = 30;
    const runs: number[] = [];
    const throttled = lodashThrottle(() => runs.push(performance.now()), wait);
    await new Promise<void>((resolve) => {
      const started = performance.now();
      const interval = setInterval(() => {
        throttled();
        if (performance.now() - started > 1500) {
          clearInterval(interval);
          setTimeout(resolve, wait * 3);
        }
      }, 1);
    });
    let triples = 0;
    for (let i = 2; i < runs.length; i++)
      if (runs[i] - runs[i - 2] < wait / 2) triples++;
    expect({ runs: runs.length, triples }).toEqual({ runs: runs.length, triples: 0 });
  });
});

describe('throttle reentrancy from inside the throttled function', () => {
  it('a function that re-triggers its own throttle runs once per window (fake timers)', () => {
    vi.useFakeTimers();
    try {
      let runs = 0;
      const throttled = throttle(() => {
        runs++;
        if (runs < 500) throttled();
      }, 100);
      throttled(); // t=0, leading run; the reentrant call becomes the trailing run
      vi.advanceTimersByTime(100); // t=100, trailing run
      // Two runs so far is the documented leading + trailing pattern; anything more
      // means the reentrant call from the trailing run ran synchronously.
      expect(runs).toBeLessThanOrEqual(3);
    } finally {
      vi.useRealTimers();
    }
  });

  it('a function that re-triggers its own throttle runs about once per window (real timers)', async () => {
    let runs = 0;
    let stop = false;
    const throttled = throttle(() => {
      runs++;
      if (!stop) throttled();
    }, 20);
    throttled();
    await new Promise((resolve) => setTimeout(resolve, 400));
    stop = true;
    // 400ms / 20ms windows is about 20 windows; allow leading + trailing per window.
    expect(runs).toBeLessThanOrEqual(45);
  });
});

describe('control: lodash throttle reentrancy', () => {
  it('lodash runs a self-re-triggering function about once per window (real timers)', async () => {
    const { default: lodashThrottle } = await import('lodash/throttle.js');
    let runs = 0;
    let stop = false;
    const throttled = lodashThrottle(() => {
      runs++;
      if (!stop) throttled();
    }, 20);
    throttled();
    await new Promise((resolve) => setTimeout(resolve, 400));
    stop = true;
    expect(runs).toBeLessThanOrEqual(45);
  });
});

describe('throttle unbounded reentrancy', () => {
  it('a function that always re-triggers its own throttle does not overflow the stack', () => {
    vi.useFakeTimers();
    let outcome = 'ok';
    try {
      const throttled = throttle(() => throttled(), 100);
      throttled();
      vi.advanceTimersByTime(100);
    } catch (error) {
      outcome = (error as Error).name + ': ' + (error as Error).message;
    } finally {
      vi.clearAllTimers();
      vi.useRealTimers();
    }
    expect(outcome).toBe('ok');
  });
});
