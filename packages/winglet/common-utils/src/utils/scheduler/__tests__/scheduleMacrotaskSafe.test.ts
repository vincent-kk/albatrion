import { describe, expect, it } from 'vitest';

import { scheduleMacrotaskSafe } from '../scheduleMacrotaskSafe';

describe('scheduleMacrotaskSafe', () => {
  it('should execute callback after the microtask queue is cleared', async () => {
    const executionOrder: number[] = [];

    // 동기 코드
    executionOrder.push(1);

    // Promise (microtask)
    Promise.resolve().then(() => {
      executionOrder.push(3);
    });

    // scheduleMacrotaskSafe (macrotask)
    scheduleMacrotaskSafe(() => {
      executionOrder.push(4);
    });

    // 동기 코드
    executionOrder.push(2);

    // microtask 큐가 비워질 때까지 대기
    await Promise.resolve();

    // macrotask 큐에 있는 작업이 실행될 때까지 대기
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(executionOrder).toEqual([1, 2, 3, 4]);
  });

  it('should execute after Promise.resolve but before setTimeout with longer delay', async () => {
    const executionOrder: number[] = [];

    // 동기 코드
    executionOrder.push(1);

    // setTimeout with delay (macrotask)
    setTimeout(() => {
      executionOrder.push(5);
    }, 50);

    // Promise (microtask)
    Promise.resolve().then(() => {
      executionOrder.push(3);
    });

    // scheduleMacrotaskSafe (macrotask with higher priority than setTimeout)
    scheduleMacrotaskSafe(() => {
      executionOrder.push(4);
    });

    // 동기 코드
    executionOrder.push(2);

    // microtask 큐가 비워질 때까지 대기
    await Promise.resolve();

    // macrotask 큐에 있는 첫 번째 작업이 실행될 때까지 대기
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(executionOrder).toEqual([1, 2, 3, 4]);

    // 더 긴 지연 시간을 가진 setTimeout이 실행될 때까지 대기
    await new Promise((resolve) => setTimeout(resolve, 50));

    expect(executionOrder).toEqual([1, 2, 3, 4, 5]);
  });

  it('should execute multiple callbacks in the correct order', async () => {
    const executionOrder: number[] = [];

    // 동기 코드
    executionOrder.push(1);

    // Promise (microtask)
    Promise.resolve().then(() => {
      executionOrder.push(3);
    });

    // 첫 번째 scheduleMacrotaskSafe (macrotask)
    scheduleMacrotaskSafe(() => {
      executionOrder.push(4);
    });

    // 두 번째 scheduleMacrotaskSafe (macrotask)
    scheduleMacrotaskSafe(() => {
      executionOrder.push(5);
    });

    // 동기 코드
    executionOrder.push(2);

    // microtask 큐가 비워질 때까지 대기
    await Promise.resolve();

    // 첫 번째 macrotask가 실행될 때까지 대기
    await new Promise((resolve) => setTimeout(resolve, 0));

    // 두 번째 macrotask가 실행될 때까지 대기
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(executionOrder).toEqual([1, 2, 3, 4, 5]);
  });

  it('should work with the correct timing in event loop', async () => {
    const executionOrder: number[] = [];

    // 동기 코드
    executionOrder.push(1);

    // microtask (Promise)
    queueMicrotask(() => {
      executionOrder.push(3);
    });

    // scheduleMacrotaskSafe (macrotask)
    scheduleMacrotaskSafe(() => {
      executionOrder.push(4);

      // nested microtask
      queueMicrotask(() => {
        executionOrder.push(5);
      });

      // nested scheduleMacrotaskSafe
      scheduleMacrotaskSafe(() => {
        executionOrder.push(7);
      });

      // 동기 코드 (scheduleMacrotaskSafe 콜백 내부)
      executionOrder.push(6);
    });

    // 동기 코드
    executionOrder.push(2);

    // microtask 큐가 비워질 때까지 대기
    await Promise.resolve();

    // 첫 번째 macrotask가 실행될 때까지 대기
    await new Promise((resolve) => setTimeout(resolve, 0));

    // 두 번째 microtask 큐가 비워질 때까지 대기
    await Promise.resolve();

    // 두 번째 macrotask가 실행될 때까지 대기
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(executionOrder).toEqual([1, 2, 3, 4, 6, 5, 7]);
  });
});
