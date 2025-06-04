import { describe, expect, it, vi } from 'vitest';

import { delay } from '../../../promise';
import { throttle } from '../throttle';

describe('throttle', async () => {
  it('throttle 기본 동작: 최초에 1회 실행 후, delay 이내 발생한 마지막 함수 실행', async () => {
    const fn = vi.fn();
    const throttledFn = throttle(fn, 100);
    throttledFn(1);
    throttledFn(2);
    throttledFn(3);
    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledWith(1);

    await delay(200);
    expect(fn).toHaveBeenCalledTimes(2);
    expect(fn).toHaveBeenCalledWith(3);
  });

  it('throttle 중첩 동작: 최초에 1회 실행 후, delay 이내 발생한 마지막 함수 실행', async () => {
    const fn = vi.fn();
    const delayMs = 50;
    const throttledFn = throttle(fn, delayMs);

    throttledFn(1); // 실행1
    throttledFn(2); // 실행2
    throttledFn(3); // 실행3
    throttledFn(4); // 실행4
    throttledFn(5); // 실행5

    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledWith(1); // 최초 Leading 실행: 실행1

    await delay(delayMs * 2);
    expect(fn).toHaveBeenCalledTimes(2);
    expect(fn).toHaveBeenCalledWith(5); // delay 초과 후 Tailing 실행: 실행5

    throttledFn(6); // 실행6
    throttledFn(7); // 실행7
    throttledFn(8); // 실행8
    expect(fn).toHaveBeenCalledTimes(3);
    expect(fn).toHaveBeenCalledWith(6); // 최초 Leading 실행: 실행6

    await delay(delayMs / 2 + 5);
    throttledFn(9); // 실행9
    throttledFn(10); // 실행10
    throttledFn(11); // 실행11
    expect(fn).toHaveBeenCalledTimes(3);
    expect(fn).toHaveBeenCalledWith(6); // delay 초과 후 Tailing 실행: 실행11

    throttledFn(12); // 실행12
    throttledFn(13); // 실행13
    throttledFn(14); // 실행14
    expect(fn).toHaveBeenCalledTimes(3);
    expect(fn).toHaveBeenCalledWith(6); // delay 초과 후 Tailing 실행: 실행14

    await delay(delayMs);

    expect(fn).toHaveBeenCalledTimes(4);
    expect(fn).toHaveBeenCalledWith(14); // delay 초과 후 Tailing 실행: 실행14
  });

  it('delay 시간 내에 연속해서 발생한 함수는 한번만 실행된다.', async () => {
    const fn = vi.fn();
    const delayMs = 50;
    const halfDelayMs = delayMs / 2;
    const throttledFn = throttle(fn, delayMs);

    throttledFn(); // 실행1
    expect(fn).toHaveBeenCalledTimes(1); // 최초 Leading 실행: 실행1

    await delay(halfDelayMs);
    expect(fn).toHaveBeenCalledTimes(1); // delay 내에 발생한 함수는 실행되지 않음
    throttledFn(); // 실행2
    expect(fn).toHaveBeenCalledTimes(1); // delay 내에 발생한 함수는 실행되지 않음

    await delay(halfDelayMs + 5); // delay 초과
    expect(fn).toHaveBeenCalledTimes(2); // delay 초과 후 발생한 함수는 Tailing 실행: 실행2

    throttledFn(); // 실행3
    expect(fn).toHaveBeenCalledTimes(3); // Tailing 이후, Leading 실행: 실행3
    await delay(delayMs / 2 - 1);
    expect(fn).toHaveBeenCalledTimes(3); // delay 내에 발생한 함수는 실행되지 않음
    throttledFn(); // 실행4
    expect(fn).toHaveBeenCalledTimes(3); // delay 내에 발생한 함수는 실행되지 않음
    await delay(delayMs / 2 + 5);
    expect(fn).toHaveBeenCalledTimes(4); // delay 초과 후 발생한 함수는 Tailing 실행: 실행4
    throttledFn();
    expect(fn).toHaveBeenCalledTimes(5); // Tailing 이후, Leading 실행: 실행4
  });

  it('throttle 함수는 인자를 전달받는다.', () => {
    const fn = vi.fn();
    const delayMs = 50;
    const throttledFn = throttle(fn, delayMs);
    throttledFn('bar', 2025);
    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledWith('bar', 2025);
  });
  it('throttle 함수는 최초 1회 실행 후 delay가 지나도 추가로 실행되지 않는다.', async () => {
    const fn = vi.fn();
    const delayMs = 50;
    const throttled = throttle(fn, delayMs);
    throttled();
    expect(fn).toBeCalledTimes(1);
    await delay(delayMs + 5);
    expect(fn).toBeCalledTimes(1);
  });
  it('Tailing 옵션에 의해, 최초 실행 후 delay 내에 발생한 함수 실행', async () => {
    const fn = vi.fn();
    const delayMs = 50;
    const throttled = throttle(fn, delayMs);
    throttled();
    throttled();
    throttled();
    expect(fn).toBeCalledTimes(1);
    await delay(delayMs + 5);
    expect(fn).toBeCalledTimes(2);
  });
  it('time window 외부에서 실행되는 경우, 즉시 실행된다.', async () => {
    const fn = vi.fn();
    const delayMs = 50;
    const throttled = throttle(fn, delayMs);
    throttled();
    throttled();
    throttled();
    expect(fn).toBeCalledTimes(1);
    await delay(delayMs + 5);
    expect(fn).toBeCalledTimes(2);
    throttled();
    throttled();
    expect(fn).toBeCalledTimes(3);
    await delay(delayMs + 5);
    expect(fn).toBeCalledTimes(4);
  });
  it('abort 된 throttle 함수는 실행되지 않는다.', async () => {
    const fn = vi.fn();
    const delayMs = 50;
    const controller = new AbortController();
    controller.abort();
    const throttled = throttle(fn, delayMs, { signal: controller.signal });
    throttled();
    throttled();
    expect(fn).toBeCalledTimes(0);
    await delay(delayMs + 5);
    expect(fn).toBeCalledTimes(0);
  });
  it('throttle 함수가 실행된 후 abort 되면 실행되지 않는다.', async () => {
    const fn = vi.fn();
    const delayMs = 50;
    const controller = new AbortController();
    const throttled = throttle(fn, delayMs, { signal: controller.signal });
    throttled();
    throttled();
    expect(fn).toBeCalledTimes(1);
    controller.abort();
    await delay(delayMs + 5);
    expect(fn).toBeCalledTimes(1);
  });
});
