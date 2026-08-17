import { renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { useHandle } from '../useHandle';

describe('useHandle', () => {
  it('should return a function that returns null when no function is provided', () => {
    const { result } = renderHook(() => useHandle());
    expect(result.current()).toBeNull();
  });

  it('should return the result of the provided function, but the function itself is not memoized', () => {
    const handler = vi.fn().mockReturnValue('test');
    const { result } = renderHook(() => useHandle(handler));

    expect(result.current()).toBe('test');
    expect(handler).toHaveBeenCalledTimes(1);

    // Calling again on the same instance does not memoize the function
    result.current();
    expect(handler).toHaveBeenCalledTimes(2);
  });

  it('should allow arguments to be passed to the function', () => {
    const handler = vi.fn().mockImplementation((a: number, b: number) => a + b);
    const { result } = renderHook(() => useHandle(handler));

    expect(result.current(1, 2)).toBe(3);
    expect(handler).toHaveBeenCalledWith(1, 2);
  });

  it('should return the same function even when the function changes', () => {
    const handler1 = vi.fn().mockReturnValue('test1');
    const { result, rerender } = renderHook(
      ({ handler }) => useHandle(handler),
      {
        initialProps: { handler: handler1 },
      },
    );

    expect(result.current()).toBe('test1');

    const handler2 = vi.fn().mockReturnValue('test2');
    rerender({ handler: handler2 });

    expect(result.current()).toBe('test2');
    expect(handler1).toHaveBeenCalled();
    expect(handler2).toHaveBeenCalledTimes(1);
  });
});
