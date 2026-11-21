import { afterEach, describe, expect, it, vi } from 'vitest';
import { delay } from '../delay';
import { timeout } from '../timeout';
import { withTimeout } from '../withTimeout';

describe('round-3 cancellation and long durations', () => {
  afterEach(() => { vi.clearAllTimers(); vi.useRealTimers(); });

  it('already-aborted input does not invoke the operation, like delay does not start its timer', async () => {
    const controller = new AbortController(); controller.abort();
    const origin = vi.fn(async () => 1);
    await expect(withTimeout(origin, 100, { signal: controller.signal })).rejects.toHaveProperty('name', 'Abort');
    expect(origin).not.toHaveBeenCalled();
  });

  it('long waits remain pending and are cancellable like ordinary waits', async () => {
    vi.useFakeTimers();
    for (const ms of [2 ** 31, 30 * 86400000, Infinity]) {
      const controller = new AbortController();
      let outcome = 'pending';
      const pending = delay(ms, { signal: controller.signal }).then(() => { outcome = 'resolved'; }, () => { outcome = 'aborted'; });
      await vi.advanceTimersByTimeAsync(100);
      expect(outcome).toBe('pending');
      controller.abort(); await pending;
      expect(outcome).toBe('aborted');
      expect(vi.getTimerCount()).toBe(0);
    }
  });

  it('long finite waits complete after the full requested duration', async () => {
    vi.useFakeTimers();
    let done = false;
    const ms = 2 ** 31 + 100;
    const pending = delay(ms).then(() => { done = true; });
    await vi.advanceTimersByTimeAsync(ms - 1); expect(done).toBe(false);
    await vi.advanceTimersByTimeAsync(1); await pending; expect(done).toBe(true);
  });

  it('timeout and withTimeout share the long-delay contract', async () => {
    vi.useFakeTimers();
    for (const ms of [2 ** 31, Infinity]) {
      const controller = new AbortController();
      const operation = new Promise<never>(() => {});
      let timed = false; let raced = false;
      const a = timeout(ms, { signal: controller.signal }).catch(() => { timed = true; });
      const b = withTimeout(() => operation, ms, { signal: controller.signal }).catch(() => { raced = true; });
      await vi.advanceTimersByTimeAsync(100);
      expect([timed, raced]).toEqual([false, false]);
      controller.abort(); await Promise.all([a,b]);
      expect(vi.getTimerCount()).toBe(0);
    }
  });
});
