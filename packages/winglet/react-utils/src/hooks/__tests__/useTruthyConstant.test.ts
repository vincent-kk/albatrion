import { renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { useTruthyConstant } from '../useTruthyConstant';

describe('useTruthyConstant', () => {
  it('should return a constant value as is', () => {
    const value = { test: 'value' };
    const { result } = renderHook(() => useTruthyConstant(value));

    expect(result.current).toBe(value);
  });

  it('should execute the function and return its result', () => {
    const factory = vi.fn().mockReturnValue({ test: 'value' });
    const { result } = renderHook(() => useTruthyConstant(factory));

    expect(result.current).toEqual({ test: 'value' });
    expect(factory).toHaveBeenCalledTimes(1);
  });

  it('should keep the same value across re-renders', () => {
    const value = { test: 'value' };
    const { result, rerender } = renderHook(() => useTruthyConstant(value));

    const firstResult = result.current;
    expect(firstResult).toBe(value);

    rerender();
    expect(result.current).toBe(firstResult);
  });

  it('should run only once across re-renders in the case of a function', () => {
    const factory = vi.fn().mockReturnValue({ test: 'value' });
    const { rerender } = renderHook(() => useTruthyConstant(factory));

    expect(factory).toHaveBeenCalledTimes(1);

    rerender();
    expect(factory).toHaveBeenCalledTimes(1);
  });

  it('should run the factory during render even when the value is never accessed', () => {
    const factory = vi.fn(() => 'value');

    renderHook(() => {
      useTruthyConstant(factory);
      return null;
    });

    expect(factory).toHaveBeenCalledTimes(1);
  });

  it('should re-run the factory on every render while the result is falsy', () => {
    const factory = vi.fn(() => null);
    const { rerender } = renderHook(() => useTruthyConstant(factory));

    rerender();
    rerender();

    expect(factory).toHaveBeenCalledTimes(3);
  });

  it('should keep the same reference for complex types such as objects', () => {
    const value = { nested: { test: 'value' } };
    const { result, rerender } = renderHook(() => useTruthyConstant(value));

    const firstResult = result.current;
    expect(firstResult).toBe(value);

    rerender();
    expect(result.current).toBe(firstResult);
  });
});
