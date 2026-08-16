import { renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { useReference } from '../useReference';

describe('useReference', () => {
  it('should store the initial value in the current property', () => {
    const initialValue = { value: 'test' };
    const { result } = renderHook(() => useReference(initialValue));

    expect(result.current.current).toBe(initialValue);
  });

  it('should update the current property when the value changes', () => {
    const initialValue = { value: 'test1' };
    const newValue = { value: 'test2' };
    const { result, rerender } = renderHook(
      ({ value }) => useReference(value),
      {
        initialProps: { value: initialValue },
      },
    );

    expect(result.current.current).toBe(initialValue);

    rerender({ value: newValue });
    expect(result.current.current).toBe(newValue);
  });

  it('should keep the reference for complex types such as objects', () => {
    const initialValue = { nested: { value: 'test' } };
    const { result, rerender } = renderHook(
      ({ value }) => useReference(value),
      {
        initialProps: { value: initialValue },
      },
    );

    expect(result.current.current).toBe(initialValue);

    // Re-rendering with the same object should keep the same reference
    rerender({ value: initialValue });
    expect(result.current.current).toBe(initialValue);
  });
});
