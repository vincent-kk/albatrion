import { afterEach, describe, expect, it, vi } from 'vitest';

import { scheduleValidationSlot } from '../utils/scheduleValidationSlot';

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe('validation scheduling environment and fallback race', () => {
  it('IR-6 keeps the scheduling host cancellation after its globals are torn down', () => {
    vi.stubGlobal('requestAnimationFrame', () => 10);
    const cancel = vi.fn();
    vi.stubGlobal('cancelAnimationFrame', cancel);
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
    const run = vi.fn();
    scheduleValidationSlot(run);
    vi.stubGlobal('cancelAnimationFrame', undefined);
    expect(() => vi.advanceTimersByTime(100)).not.toThrow();
    expect(cancel).toHaveBeenCalledWith(10);
    expect(run).toHaveBeenCalledTimes(1);
  });

  it('IR-6 R4 a frame API without cancellation uses exactly one macrotask', async () => {
    const frame = vi.fn(() => 1);
    vi.stubGlobal('requestAnimationFrame', frame);
    vi.stubGlobal('cancelAnimationFrame', undefined);
    const run = vi.fn();
    expect(() => scheduleValidationSlot(run)).not.toThrow();
    await new Promise<void>((resolve) => setImmediate(resolve));
    expect(run).toHaveBeenCalledTimes(1);
    expect(frame).not.toHaveBeenCalled();
  });

  it('IR-6 R7 waits for its frame before posting validation work', async () => {
    vi.stubGlobal('requestAnimationFrame', () => 1);
    vi.stubGlobal('cancelAnimationFrame', vi.fn());
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
    const run = vi.fn();
    scheduleValidationSlot(run);
    await new Promise<void>((resolve) => setImmediate(resolve));
    expect(run).not.toHaveBeenCalled();
    vi.advanceTimersByTime(100);
    expect(run).toHaveBeenCalledTimes(1);
  });

  it('IR-6 (f) reads missing frame support on every call and uses a macrotask', async () => {
    vi.stubGlobal('requestAnimationFrame', undefined);
    const run = vi.fn();
    scheduleValidationSlot(run);
    await Promise.resolve();
    expect(run).not.toHaveBeenCalled();
    await new Promise<void>((resolve) => setImmediate(resolve));
    expect(run).toHaveBeenCalledTimes(1);
    const frame = vi.fn(() => 1);
    vi.stubGlobal('requestAnimationFrame', frame);
    vi.stubGlobal('cancelAnimationFrame', vi.fn());
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
    scheduleValidationSlot(run);
    expect(frame).toHaveBeenCalledTimes(1);
    await vi.advanceTimersByTimeAsync(100);
    expect(run).toHaveBeenCalledTimes(2);
  });

  it('IR-6 (f) a hidden document does not wait for a frame', async () => {
    const frame = vi.fn(() => 1);
    vi.stubGlobal('requestAnimationFrame', frame);
    vi.stubGlobal('document', { hidden: true });
    const run = vi.fn();
    scheduleValidationSlot(run);
    await Promise.resolve();
    expect(run).not.toHaveBeenCalled();
    await new Promise<void>((resolve) => setImmediate(resolve));
    expect(run).toHaveBeenCalledTimes(1);
    expect(frame).not.toHaveBeenCalled();
  });

  it('IR-6 (g) a frame winning the race cancels the timer and runs once', async () => {
    let frame!: FrameRequestCallback;
    vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => {
      frame = callback;
      return 7;
    });
    const cancel = vi.fn();
    vi.stubGlobal('cancelAnimationFrame', cancel);
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
    const run = vi.fn();
    scheduleValidationSlot(run);
    frame(0);
    expect(run).not.toHaveBeenCalled();
    await new Promise<void>((resolve) => setImmediate(resolve));
    expect(run).toHaveBeenCalledTimes(1);
    await vi.advanceTimersByTimeAsync(100);
    expect(run).toHaveBeenCalledTimes(1);
    expect(cancel).toHaveBeenCalledWith(7);
    expect(vi.getTimerCount()).toBe(0);
  });

  it('IR-6 (g) a timeout winning the race cancels a posted macrotask', async () => {
    let frame!: FrameRequestCallback;
    vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => {
      frame = callback;
      return 8;
    });
    const cancel = vi.fn();
    vi.stubGlobal('cancelAnimationFrame', cancel);
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
    const run = vi.fn();
    scheduleValidationSlot(run);
    frame(0);
    vi.advanceTimersByTime(100);
    await new Promise<void>((resolve) => setImmediate(resolve));
    expect(run).toHaveBeenCalledTimes(1);
    expect(cancel).toHaveBeenCalledWith(8);
  });

  it('IR-6 (g) a stalled frame falls back at 100ms and ignores a late callback', async () => {
    let frame!: FrameRequestCallback;
    vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => {
      frame = callback;
      return 9;
    });
    vi.stubGlobal('cancelAnimationFrame', vi.fn());
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
    const run = vi.fn();
    scheduleValidationSlot(run);
    vi.advanceTimersByTime(99);
    expect(run).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1);
    expect(run).toHaveBeenCalledTimes(1);
    frame(100);
    await new Promise<void>((resolve) => setImmediate(resolve));
    expect(run).toHaveBeenCalledTimes(1);
  });
});
