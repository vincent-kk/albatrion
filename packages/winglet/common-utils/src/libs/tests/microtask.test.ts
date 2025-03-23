import { describe, expect, it } from 'vitest';

import { microtask } from '../microtask';

describe('microtask', () => {
  it('should execute callback in the next microtask', async () => {
    const executionOrder: number[] = [];

    // 동기 코드
    executionOrder.push(1);

    // microtask 큐에 작업 추가
    microtask(() => {
      executionOrder.push(3);
    });

    // 동기 코드
    executionOrder.push(2);

    // microtask 큐가 비워질 때까지 대기
    await Promise.resolve();

    expect(executionOrder).toEqual([1, 2, 3]);
  });

  it('should maintain correct execution order with multiple microtasks', async () => {
    const executionOrder: number[] = [];

    // 동기 코드
    executionOrder.push(1);

    // 여러 microtask 큐에 작업 추가
    microtask(() => {
      executionOrder.push(3);
      microtask(() => {
        executionOrder.push(5);
      });
    });

    microtask(() => {
      executionOrder.push(4);
    });

    // 동기 코드
    executionOrder.push(2);

    // microtask 큐가 비워질 때까지 대기
    await Promise.resolve();

    await Promise.resolve();

    expect(executionOrder).toEqual([1, 2, 3, 4, 5]);
  });

  it('should execute before setTimeout', async () => {
    const executionOrder: number[] = [];

    // 동기 코드
    executionOrder.push(1);

    // setTimeout (macrotask)
    setTimeout(() => {
      executionOrder.push(4);
    }, 0);

    // microtask
    microtask(() => {
      executionOrder.push(3);
    });

    // 동기 코드
    executionOrder.push(2);

    // microtask 큐가 비워질 때까지 대기
    await Promise.resolve();

    setTimeout(() => {
      expect(executionOrder).toEqual([1, 2, 3, 4]);
    });
  });

  it('should work with async callbacks', async () => {
    const executionOrder: number[] = [];

    // 동기 코드
    executionOrder.push(1);

    // async 콜백
    microtask(async () => {
      executionOrder.push(3);
      await Promise.resolve();
      executionOrder.push(4);
    });

    // 동기 코드
    executionOrder.push(2);

    // microtask 큐가 비워질 때까지 대기
    await Promise.resolve();

    expect(executionOrder).toEqual([1, 2, 3]);

    await Promise.resolve();

    expect(executionOrder).toEqual([1, 2, 3, 4]);
  });
});
