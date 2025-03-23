import { describe, expect, it } from 'vitest';

import { postPromise } from '../postPromise';

describe('postPromise', () => {
  it('should execute after microtask and promise queue', async () => {
    const executionOrder: number[] = [];

    // 동기 코드
    executionOrder.push(1);

    // microtask 큐에 작업 추가
    queueMicrotask(() => {
      executionOrder.push(3);
    });

    // promise 큐에 작업 추가
    Promise.resolve().then(() => {
      executionOrder.push(4);
    });

    // postPromise 큐에 작업 추가
    postPromise(() => {
      executionOrder.push(5);
    });

    // 동기 코드
    executionOrder.push(2);

    setTimeout(() => {
      expect(executionOrder).toEqual([1, 2, 3, 4, 5]);
    });
  });

  it('should maintain correct execution order with multiple async tasks', async () => {
    const executionOrder: number[] = [];

    // 동기 코드
    executionOrder.push(1);

    // 여러 async 작업들
    queueMicrotask(() => {
      executionOrder.push(3);
      Promise.resolve().then(() => {
        executionOrder.push(5);
        queueMicrotask(() => {
          executionOrder.push(7);
        });
      });
    });

    Promise.resolve().then(() => {
      executionOrder.push(4);
      queueMicrotask(() => {
        executionOrder.push(6);
      });
    });

    // postPromise 작업들
    postPromise(() => {
      executionOrder.push(8);
      postPromise(() => {
        executionOrder.push(9);
      });
    });

    // 동기 코드
    executionOrder.push(2);

    setTimeout(() => {
      expect(executionOrder).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9]);
    });
  });

  it('should execute after setTimeout in Node.js environment', async () => {
    const executionOrder: number[] = [];

    // 동기 코드
    executionOrder.push(1);

    // setTimeout (macrotask)
    setTimeout(() => {
      executionOrder.push(4);
    }, 0);

    // microtask
    queueMicrotask(() => {
      executionOrder.push(3);
    });

    // promise
    Promise.resolve().then(() => {
      executionOrder.push(3.5);
    });

    // postPromise
    postPromise(() => {
      executionOrder.push(5);
    });

    // 동기 코드
    executionOrder.push(2);

    // 모든 큐가 비워질 때까지 대기
    await Promise.resolve();
    await new Promise((resolve) => setTimeout(resolve, 0));

    setTimeout(() => {
      expect(executionOrder).toEqual([1, 2, 3, 3.5, 4, 5]);
    }, 10);
  });

  it('should work with async callbacks', async () => {
    const executionOrder: number[] = [];

    // 동기 코드
    executionOrder.push(1);

    // async 콜백
    postPromise(async () => {
      executionOrder.push(4);
      await Promise.resolve();
      executionOrder.push(5);
    });

    // microtask
    queueMicrotask(() => {
      executionOrder.push(3);
    });

    // 동기 코드
    executionOrder.push(2);

    setTimeout(() => {
      expect(executionOrder).toEqual([1, 2, 3, 4, 5]);
    });
  });
});
