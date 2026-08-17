import { renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { useConstant } from '../useConstant';

describe('useConstant', () => {
  it('should memoize the input value', () => {
    const input = { value: 'test' };
    const { result, rerender } = renderHook(({ value }) => useConstant(value), {
      initialProps: { value: input },
    });

    const firstResult = result.current;
    expect(firstResult).toBe(input);

    // should return the same reference even when re-rendered with the same input value
    rerender({ value: input });
    expect(result.current).toBe(firstResult);
  });

  it('useMemoize stores the value given first and does not reflect later changes.', () => {
    const input1 = { value: 'test1' };
    const input2 = { value: 'test2' };
    const { result, rerender } = renderHook(({ value }) => useConstant(value), {
      initialProps: { value: input1 },
    });

    const firstResult = result.current;
    expect(firstResult).toBe(input1);

    // rendering with a different input value should return a different reference
    rerender({ value: input2 });
    expect(result.current).toBe(firstResult);
    expect(result.current).not.toBe(input2);
  });

  it('should memoize complex types such as objects as well', () => {
    const input = { nested: { value: 'test' } };
    const { result, rerender } = renderHook(({ value }) => useConstant(value), {
      initialProps: { value: input },
    });

    const firstResult = result.current;
    expect(firstResult).toBe(input);

    // should return the same reference even when re-rendered with the same object
    rerender({ value: input });
    expect(result.current).toBe(firstResult);
  });
});
