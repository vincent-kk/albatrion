import { describe, expect, it, vi } from 'vitest';

import { delay } from '../../promise';
import { debounce } from '../debounce';

describe('debounce', () => {
  it('연속해서 발생한 함수는 한번만 실행된다.', async () => {
    const fn = vi.fn();
    const delayMs = 50;
    const debouncedFn = debounce(fn, delayMs);

    debouncedFn();
    expect(fn).toHaveBeenCalledTimes(0);

    debouncedFn();
    debouncedFn();

    await delay(delayMs * 2);

    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('immediate 옵션을 주면 즉시 실행된다.', async () => {
    const fn = vi.fn();
    const delayMs = 50;
    const debouncedFn = debounce(fn, delayMs, {
      leading: true,
      trailing: true,
    });

    debouncedFn();

    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('immediate 옵션을 주면 1회 즉시 실행 후 이외 실행은 debounce 시간 후 실행된다.', async () => {
    const fn = vi.fn();
    const delayMs = 50;
    const debouncedFn = debounce(fn, delayMs, {
      leading: true,
      trailing: true,
    });

    debouncedFn();
    debouncedFn();

    expect(fn).toHaveBeenCalledTimes(1);

    debouncedFn();
    debouncedFn();
    debouncedFn();

    await delay(delayMs * 2);

    expect(fn).toHaveBeenCalledTimes(2);
  });

  it('immediate 옵션을 주지 않으면, debounce 시간 이내에는 실행되지 않는다.', async () => {
    const fn = vi.fn();
    const delayMs = 50;
    const debouncedFn = debounce(fn, delayMs);

    const halfDelay = delayMs / 2;

    debouncedFn();
    await delay(halfDelay);
    expect(fn).toHaveBeenCalledTimes(0);

    await delay(halfDelay + 1);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('delayMs 이내에 연속해서 호출되면, 마지막 호출 후 delayMs 이후에 실행된다.', async () => {
    const fn = vi.fn();
    const delayMs = 50;
    const debouncedFn = debounce(fn, delayMs);

    const halfDelay = delayMs / 2;

    debouncedFn();
    await delay(halfDelay);
    debouncedFn();
    await delay(halfDelay);
    debouncedFn();
    await delay(halfDelay);
    debouncedFn();

    expect(fn).toHaveBeenCalledTimes(0);

    await delay(delayMs + 1);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('clear 메소드를 호출하면, 실행되지 않는다.', async () => {
    const fn = vi.fn();
    const delayMs = 50;
    const debounceFn = debounce(fn, delayMs);

    debounceFn();
    debounceFn.clear();
    await delay(delayMs);

    expect(fn).toHaveBeenCalledTimes(0);
  });

  it('함수로 전달된 매개변수는 정상적으로 전달된다', async () => {
    const fn = vi.fn();
    const delayMs = 50;
    const debouncedFn = debounce(fn, delayMs);

    debouncedFn('foo', 2025);

    await delay(delayMs * 2);

    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledWith('foo', 2025);
  });

  it('signal을 옵션으로 주면, abort 할 수 있다.', async () => {
    const fn = vi.fn();
    const delayMs = 50;
    const abortController = new AbortController();
    const debounceFn = debounce(fn, delayMs, {
      signal: abortController.signal,
    });

    debounceFn();
    abortController.abort();

    await delay(delayMs);

    expect(fn).toHaveBeenCalledTimes(0);
  });

  it('이미 abort 된 signal을 옵션으로 주면, 실행되지 않는다.', async () => {
    const fn = vi.fn();
    const delayMs = 50;
    const abortController = new AbortController();
    const debounceFn = debounce(fn, delayMs, {
      signal: abortController.signal,
    });

    abortController.abort();

    debounceFn();
    await delay(delayMs + 1);
    debounceFn();
    await delay(delayMs + 1);

    expect(fn).toHaveBeenCalledTimes(0);
  });
});
