import { describe, expect, it, vi } from 'vitest';

import { scheduleAfterMicrotask } from '../scheduleAfterMicrotask';

describe('scheduleAfterMicrotask', () => {
  it('should execute callback after the microtask queue is cleared', async () => {
    const executionOrder: number[] = [];

    // 동기 코드
    executionOrder.push(1);

    // Promise (microtask)
    Promise.resolve().then(() => {
      executionOrder.push(3);
    });

    // scheduleAfterMicrotask (macrotask)
    scheduleAfterMicrotask(() => {
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

  it('should be cancellable', async () => {
    const executionOrder: number[] = [];
    const mockFn = vi.fn(() => {
      executionOrder.push(4);
    });

    // 동기 코드
    executionOrder.push(1);

    // Promise (microtask)
    Promise.resolve().then(() => {
      executionOrder.push(3);
    });

    // scheduleAfterMicrotask (macrotask)
    const cancel = scheduleAfterMicrotask(mockFn);

    // 동기 코드
    executionOrder.push(2);

    // 즉시 취소
    cancel();

    // microtask 큐가 비워질 때까지 대기
    await Promise.resolve();

    // macrotask 큐에 있는 작업이 실행될 때까지 대기
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(executionOrder).toEqual([1, 2, 3]);
    expect(mockFn).not.toHaveBeenCalled();
  });

  it('should be cancellable even after microtask queue is cleared but before execution', async () => {
    const executionOrder: number[] = [];
    const mockFn = vi.fn(() => {
      executionOrder.push(4);
    });

    // 동기 코드
    executionOrder.push(1);

    // Promise (microtask)
    Promise.resolve().then(() => {
      executionOrder.push(3);
    });

    // scheduleAfterMicrotask (macrotask)
    const cancel = scheduleAfterMicrotask(mockFn);

    // 동기 코드
    executionOrder.push(2);

    // microtask 큐가 비워질 때까지 대기
    await Promise.resolve();

    // 이 시점에서 취소 (macrotask 실행 직전)
    cancel();

    // macrotask 큐에 있는 작업이 실행될 때까지 대기
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(executionOrder).toEqual([1, 2, 3]);
    expect(mockFn).not.toHaveBeenCalled();
  });

  it('should allow multiple schedules and cancellations', async () => {
    const executionOrder: number[] = [];

    // 동기 코드
    executionOrder.push(1);

    // Promise (microtask)
    Promise.resolve().then(() => {
      executionOrder.push(3);
    });

    // 첫 번째 scheduleAfterMicrotask (취소 예정)
    const cancel1 = scheduleAfterMicrotask(() => {
      executionOrder.push(999); // 이 콜백은 실행되지 않아야 함
    });

    // 두 번째 scheduleAfterMicrotask (실행 예정)
    scheduleAfterMicrotask(() => {
      executionOrder.push(4);
    });

    // 세 번째 scheduleAfterMicrotask (취소 예정)
    const cancel3 = scheduleAfterMicrotask(() => {
      executionOrder.push(999); // 이 콜백도 실행되지 않아야 함
    });

    // 동기 코드
    executionOrder.push(2);

    // 첫 번째와 세 번째 취소
    cancel1();
    cancel3();

    // microtask 큐가 비워질 때까지 대기
    await Promise.resolve();

    // macrotask 큐에 있는 작업이 실행될 때까지 대기
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(executionOrder).toEqual([1, 2, 3, 4]);
  });

  it('should handle nested afterMicrotask scheduling', async () => {
    const executionOrder: number[] = [];

    // 동기 코드
    executionOrder.push(1);

    // 외부 scheduleAfterMicrotask
    scheduleAfterMicrotask(() => {
      executionOrder.push(4);

      // 내부 microtask
      queueMicrotask(() => {
        executionOrder.push(5);
      });

      // 내부 scheduleAfterMicrotask (다음 macrotask 틱에서 실행)
      scheduleAfterMicrotask(() => {
        executionOrder.push(7);
      });

      // 동기 코드 (scheduleAfterMicrotask 콜백 내부)
      executionOrder.push(6);
    });

    // Promise (microtask)
    Promise.resolve().then(() => {
      executionOrder.push(3);
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
