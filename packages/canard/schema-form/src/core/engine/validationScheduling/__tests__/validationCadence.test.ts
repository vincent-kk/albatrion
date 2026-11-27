import { afterEach, describe, expect, it, vi } from 'vitest';

import { createValidationFrameClock } from '@/schema-form/__tests__/helpers/createValidationFrameClock';

import { createValidationCadence } from '../utils/cadence/createValidationCadence';

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe('IR-6 continuous-input cadence', () => {
  it('runs an isolated request after its next frame and stops watching at the quiet frame', async () => {
    const clock = createValidationFrameClock();
    const run = vi.fn(() => true);
    const cadence = createValidationCadence(run, clock.now);
    cadence.request();
    await clock.task();
    expect(run).not.toHaveBeenCalled();
    clock.frame();
    await clock.task();
    expect(run).toHaveBeenCalledTimes(1);
    clock.frame();
    await clock.task();
    expect(run).toHaveBeenCalledTimes(1);
    expect(clock.pending()).toBe(0);
  });

  it('carries consecutive-frame requests and runs once after the first quiet frame', async () => {
    const clock = createValidationFrameClock();
    const run = vi.fn(() => true);
    const cadence = createValidationCadence(run, clock.now);
    for (let frame = 0; frame < 6; frame++) {
      cadence.request();
      clock.frame();
      await clock.task();
      expect(run).toHaveBeenCalledTimes(1);
    }
    clock.frame();
    await clock.task();
    expect(run).toHaveBeenCalledTimes(2);
    clock.frame();
    await clock.task();
    expect(clock.pending()).toBe(0);
  });

  it('covers a request after the frame but before its run without a continuation', async () => {
    const clock = createValidationFrameClock();
    const run = vi.fn(() => true);
    const cadence = createValidationCadence(run, clock.now);
    cadence.request();
    clock.frame();
    cadence.request();
    await clock.task();
    expect(run).toHaveBeenCalledTimes(1);
    clock.frame();
    await clock.task();
    expect(run).toHaveBeenCalledTimes(1);
    expect(clock.pending()).toBe(0);
  });

  it('caps an uninterrupted stream every 100ms from the last run and then trails', async () => {
    const clock = createValidationFrameClock();
    const starts: number[] = [];
    const cadence = createValidationCadence(() => {
      starts.push(clock.now());
      return true;
    }, clock.now);
    for (let frame = 0; frame < 80; frame++) {
      cadence.request();
      clock.frame();
      await clock.task();
    }
    expect(starts).toEqual([
      16, 128, 240, 352, 464, 576, 688, 800, 912, 1024, 1136, 1248,
    ]);
    clock.frame();
    await clock.task();
    expect(starts).toEqual([
      16, 128, 240, 352, 464, 576, 688, 800, 912, 1024, 1136, 1248, 1296,
    ]);
    clock.frame();
    await clock.task();
    expect(clock.pending()).toBe(0);
  });

  it('runs each key when keys are two frames apart', async () => {
    const clock = createValidationFrameClock();
    const run = vi.fn(() => true);
    const cadence = createValidationCadence(run, clock.now);
    for (let key = 0; key < 3; key++) {
      cadence.request();
      clock.frame();
      await clock.task();
      clock.frame();
      await clock.task();
      expect(run).toHaveBeenCalledTimes(key + 1);
    }
    expect(clock.pending()).toBe(0);
  });

  it.each(['hidden', 'no-frame', 'no-cancel'] as const)(
    'uses one macrotask without carry-over for %s',
    async (mode) => {
      const clock = createValidationFrameClock();
      if (mode === 'hidden') vi.stubGlobal('document', { hidden: true });
      if (mode === 'no-frame')
        vi.stubGlobal('requestAnimationFrame', undefined);
      if (mode === 'no-cancel')
        vi.stubGlobal('cancelAnimationFrame', undefined);
      const run = vi.fn(() => true);
      const cadence = createValidationCadence(run, clock.now);
      cadence.request();
      cadence.request();
      cadence.request();
      await Promise.resolve();
      expect(run).not.toHaveBeenCalled();
      await clock.task();
      expect(run).toHaveBeenCalledTimes(1);
      expect(clock.pending()).toBe(0);
    },
  );

  it('runs a stalled frame once at 100ms and returns to idle', async () => {
    const clock = createValidationFrameClock();
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
    const run = vi.fn(() => true);
    const cadence = createValidationCadence(run, clock.now);
    cadence.request();
    vi.advanceTimersByTime(100);
    await clock.task();
    expect(run).toHaveBeenCalledTimes(1);
    expect(clock.pending()).toBe(0);
    cadence.request();
    clock.frame();
    await clock.task();
    expect(run).toHaveBeenCalledTimes(2);
    vi.advanceTimersByTime(100);
    await clock.task();
    expect(run).toHaveBeenCalledTimes(2);
    expect(clock.pending()).toBe(0);
  });

  it('a hidden request replaces a carrying frame wait with one macrotask', async () => {
    const clock = createValidationFrameClock();
    const run = vi.fn(() => true);
    const cadence = createValidationCadence(run, clock.now);
    cadence.request();
    clock.frame();
    await clock.task();
    cadence.request();
    clock.frame();
    await clock.task();
    vi.stubGlobal('document', { hidden: true });
    cadence.request();
    cadence.request();
    await clock.task();
    expect(run).toHaveBeenCalledTimes(2);
    expect(clock.pending()).toBe(0);
  });

  it('a stalled carrying frame runs once and releases its loop', async () => {
    const clock = createValidationFrameClock();
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
    const run = vi.fn(() => true);
    const cadence = createValidationCadence(run, clock.now);
    cadence.request();
    clock.frame();
    await clock.task();
    cadence.request();
    clock.frame();
    await clock.task();
    vi.advanceTimersByTime(100);
    await clock.task();
    expect(run).toHaveBeenCalledTimes(2);
    expect(clock.pending()).toBe(0);
    expect(vi.getTimerCount()).toBe(0);
  });

  it('cancel permanently clears the frame loop and pending tasks', async () => {
    const clock = createValidationFrameClock();
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
    const run = vi.fn(() => true);
    const cadence = createValidationCadence(run, clock.now);
    cadence.request();
    clock.frame();
    cadence.cancel();
    await clock.task();
    cadence.request();
    clock.frame();
    vi.advanceTimersByTime(100);
    await clock.task();
    expect(run).not.toHaveBeenCalled();
    expect(clock.pending()).toBe(0);
    expect(vi.getTimerCount()).toBe(0);
  });
});

it('IR-6 a cap covers the final request without a redundant quiet-frame run', async () => {
  const clock = createValidationFrameClock();
  const run = vi.fn(() => true);
  const cadence = createValidationCadence(run, clock.now);
  for (let frame = 0; frame < 8; frame++) {
    cadence.request();
    clock.frame();
    await clock.task();
  }
  expect(run).toHaveBeenCalledTimes(2);
  clock.frame();
  await clock.task();
  expect(run).toHaveBeenCalledTimes(2);
  expect(clock.pending()).toBe(0);
});

it('IR-6 checks the cap on the first delayed watch frame', async () => {
  const clock = createValidationFrameClock();
  const run = vi.fn(() => true);
  const cadence = createValidationCadence(run, clock.now);
  cadence.request();
  clock.frame();
  await clock.task();
  cadence.request();
  clock.frame(101);
  await clock.task();
  expect(run).toHaveBeenCalledTimes(2);
  clock.frame();
  await clock.task();
  expect(clock.pending()).toBe(0);
});

it('IR-6 a skipped run preserves the last actual start for the cap clock', async () => {
  const clock = createValidationFrameClock();
  const run = vi
    .fn(() => true)
    .mockReturnValueOnce(true)
    .mockReturnValueOnce(false);
  const cadence = createValidationCadence(run, clock.now);
  cadence.request();
  clock.frame();
  await clock.task();
  cadence.request();
  clock.frame();
  await clock.task();
  clock.frame();
  await clock.task();
  expect(run).toHaveBeenCalledTimes(2);
  cadence.request();
  clock.frame(70);
  await clock.task();
  expect(run).toHaveBeenCalledTimes(3);
  cadence.cancel();
});
