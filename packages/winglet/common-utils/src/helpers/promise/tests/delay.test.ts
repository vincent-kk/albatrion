import { performance } from 'node:perf_hooks';
import { describe, expect, it, vi } from 'vitest';

import { delay } from '../delay';

describe('delay', () => {
  it('100ms delay 동작 확인', async () => {
    const start = performance.now();
    await delay(100);
    const end = performance.now();
    expect(end - start).greaterThanOrEqual(99);
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
