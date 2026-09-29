import { describe, expect, it, vi } from 'vitest';

import { afterMicrotask } from '../afterMicrotask';

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

describe('afterMicrotask', () => {
  it('should execute handler after microtask', async () => {
    const handler = vi.fn();
    const scheduledFn = afterMicrotask(handler);

    scheduledFn();
    expect(handler).not.toHaveBeenCalled();

    await wait(0);
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('should cancel previous task when called multiple times', async () => {
    const handler = vi.fn();
    const scheduledFn = afterMicrotask(handler);

    scheduledFn();
    scheduledFn();
    scheduledFn();

    expect(handler).not.toHaveBeenCalled();

    await wait(10);
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('should execute handler with correct timing', async () => {
    const executionOrder: string[] = [];
    const handler = () => executionOrder.push('macrotask');
    const scheduledFn = afterMicrotask(handler);

    executionOrder.push('start');
    scheduledFn();
    Promise.resolve().then(() => executionOrder.push('microtask'));
    executionOrder.push('sync');

    await wait(5);

    expect(executionOrder).toEqual(['start', 'sync', 'microtask', 'macrotask']);
  });

  it('should handle multiple different handlers independently', async () => {
    const handler1 = vi.fn();
    const handler2 = vi.fn();
    const scheduledFn1 = afterMicrotask(handler1);
    const scheduledFn2 = afterMicrotask(handler2);

    scheduledFn1();
    scheduledFn2();

    await wait(10);

    expect(handler1).toHaveBeenCalledTimes(1);
    expect(handler2).toHaveBeenCalledTimes(1);
  });

  it('should maintain closure over handler variables', async () => {
    let counter = 0;
    const handler = () => {
      counter++;
    };
    const scheduledFn = afterMicrotask(handler);

    scheduledFn();
    await wait(10);
    expect(counter).toBe(1);

    scheduledFn();
    await wait(10);
    expect(counter).toBe(2);
  });

  it('should only execute the last scheduled task when rapidly called', async () => {
    const results: number[] = [];
    let value = 0;

    const createHandler = (val: number) => () => {
      results.push(val);
    };

    for (let i = 0; i < 5; i++) {
      value = i;
      const scheduledFn = afterMicrotask(createHandler(value));
      scheduledFn();
    }

    await wait(10);

    expect(results).toHaveLength(5);
    expect(results).toEqual([0, 1, 2, 3, 4]);
  });
});
