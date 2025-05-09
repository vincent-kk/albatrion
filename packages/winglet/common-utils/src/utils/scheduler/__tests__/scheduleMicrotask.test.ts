import { describe, expect, it } from 'vitest';

import { scheduleMicrotask } from '../scheduleMicrotask';

describe('scheduleMicrotask', () => {
  it('should execute callback in the next scheduleMicrotask', async () => {
    const executionOrder: number[] = [];

    // 동기 코드
    executionOrder.push(1);

    // scheduleMicrotask 큐에 작업 추가
    scheduleMicrotask(() => {
      executionOrder.push(3);
    });

    // 동기 코드
    executionOrder.push(2);

    // scheduleMicrotask 큐가 비워질 때까지 대기
    await Promise.resolve();

    expect(executionOrder).toEqual([1, 2, 3]);
  });

  it('should maintain correct execution order with multiple microtasks', async () => {
    const executionOrder: number[] = [];

    // 동기 코드
    executionOrder.push(1);

    // 여러 scheduleMicrotask 큐에 작업 추가
    scheduleMicrotask(() => {
      executionOrder.push(3);
      scheduleMicrotask(() => {
        executionOrder.push(5);
      });
    });

    scheduleMicrotask(() => {
      executionOrder.push(4);
    });

    // 동기 코드
    executionOrder.push(2);

    // scheduleMicrotask 큐가 비워질 때까지 대기
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

    // scheduleMicrotask
    scheduleMicrotask(() => {
      executionOrder.push(3);
    });

    // 동기 코드
    executionOrder.push(2);

    // scheduleMicrotask 큐가 비워질 때까지 대기
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
    scheduleMicrotask(async () => {
      executionOrder.push(3);
      await Promise.resolve();
      executionOrder.push(4);
    });

    // 동기 코드
    executionOrder.push(2);

    // scheduleMicrotask 큐가 비워질 때까지 대기
    await Promise.resolve();

    expect(executionOrder).toEqual([1, 2, 3]);

    await Promise.resolve();

    expect(executionOrder).toEqual([1, 2, 3, 4]);
  });
});
