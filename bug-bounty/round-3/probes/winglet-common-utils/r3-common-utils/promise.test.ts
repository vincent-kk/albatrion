import { describe, expect, it, vi } from 'vitest';

import { delay, withTimeout } from '@/common-utils/index';

const raceWith = <T>(promise: Promise<T>, ms: number) =>
  Promise.race([
    promise.then(
      () => 'settled',
      (error: Error) => 'rejected:' + error.name,
    ),
    new Promise<string>((resolve) => setTimeout(() => resolve('still waiting'), ms)),
  ]);

describe('long and unbounded waits', () => {
  it('delay(2 ** 31) is still waiting after 100ms', async () => {
    const warn = vi.spyOn(process, 'emitWarning').mockImplementation(() => {});
    const outcome = await raceWith(delay(2 ** 31), 100);
    warn.mockRestore();
    expect(outcome).toBe('still waiting');
  });

  it('withTimeout(fn, Infinity) does not time out after 100ms', async () => {
    const warn = vi.spyOn(process, 'emitWarning').mockImplementation(() => {});
    const never = new Promise<never>(() => {});
    const outcome = await raceWith(
      withTimeout(() => never, Infinity),
      100,
    );
    warn.mockRestore();
    expect(outcome).toBe('still waiting');
  });

  it('withTimeout(fn, 30 days) does not time out after 100ms', async () => {
    const warn = vi.spyOn(process, 'emitWarning').mockImplementation(() => {});
    const never = new Promise<never>(() => {});
    const outcome = await raceWith(
      withTimeout(() => never, 30 * 24 * 60 * 60 * 1000),
      100,
    );
    warn.mockRestore();
    expect(outcome).toBe('still waiting');
  });
});

describe('withTimeout with an already-aborted signal', () => {
  it('does not start the operation it was asked to cancel', async () => {
    const controller = new AbortController();
    controller.abort();
    const started = vi.fn(async () => 'side effect');
    await withTimeout(started, 1000, { signal: controller.signal }).catch(
      () => undefined,
    );
    expect(started).not.toHaveBeenCalled();
  });
});

describe('long waits in the rate limiters share the timer limit', () => {
  it('debounce(fn, 2 ** 31) has not run after 100ms', async () => {
    const { debounce } = await import('@/common-utils/index');
    const warn = vi.spyOn(process, 'emitWarning').mockImplementation(() => {});
    const fn = vi.fn();
    debounce(fn, 2 ** 31)();
    await new Promise((resolve) => setTimeout(resolve, 100));
    warn.mockRestore();
    expect(fn).not.toHaveBeenCalled();
  });
});
