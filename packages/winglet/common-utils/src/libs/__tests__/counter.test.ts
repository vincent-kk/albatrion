import { describe, expect, it } from 'vitest';

import { counterFactory } from '../counterFactory';

describe('counterFactory', () => {
  it('should create a counter with default initial value of 0', () => {
    const counter = counterFactory();
    expect(counter.getValue()).toBe(0);
  });

  it('should create a counter with specified initial value', () => {
    const counter = counterFactory(5);
    expect(counter.getValue()).toBe(5);
  });

  it('should increment the counter', () => {
    const counter = counterFactory(0);
    expect(counter.increment()).toBe(1);
    expect(counter.getValue()).toBe(1);
  });

  it('should decrement the counter', () => {
    const counter = counterFactory(5);
    expect(counter.decrement()).toBe(4);
    expect(counter.getValue()).toBe(4);
  });

  it('should reset the counter to initial value', () => {
    const counter = counterFactory(10);
    counter.increment();
    counter.increment();
    expect(counter.getValue()).toBe(12);

    counter.reset();
    expect(counter.getValue()).toBe(10);
  });
});
