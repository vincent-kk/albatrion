import { renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { useLazyConstant } from '../useLazyConstant';

describe('useLazyConstant', () => {
  it('should run the factory exactly once and keep the same reference', () => {
    const factory = vi.fn(() => ({ value: 'test' }));
    const { result, rerender } = renderHook(() => useLazyConstant(factory));

    const firstResult = result.current;
    expect(factory).toHaveBeenCalledTimes(1);
    expect(firstResult).toEqual({ value: 'test' });

    rerender();
    rerender();
    expect(factory).toHaveBeenCalledTimes(1);
    expect(result.current).toBe(firstResult);
  });

  it('should not re-evaluate even for a falsy result (null)', () => {
    const factory = vi.fn(() => null);
    const { result, rerender } = renderHook(() => useLazyConstant(factory));

    expect(result.current).toBeNull();
    expect(factory).toHaveBeenCalledTimes(1);

    rerender();
    expect(result.current).toBeNull();
    expect(factory).toHaveBeenCalledTimes(1);
  });

  it('should ignore a new factory passed on later renders', () => {
    const first = () => 'first';
    const second = () => 'second';
    const { result, rerender } = renderHook(
      ({ factory }) => useLazyConstant(factory),
      { initialProps: { factory: first } },
    );

    expect(result.current).toBe('first');

    rerender({ factory: second });
    expect(result.current).toBe('first');
  });

  it('should hold an independent value per component instance', () => {
    const factory = () => ({ value: 'instance' });
    const { result: resultA } = renderHook(() => useLazyConstant(factory));
    const { result: resultB } = renderHook(() => useLazyConstant(factory));

    expect(resultA.current).toEqual(resultB.current);
    expect(resultA.current).not.toBe(resultB.current);
  });

  it('should store the returned function as the value when the factory returns a function', () => {
    const produced = () => 'produced';
    const { result, rerender } = renderHook(() =>
      useLazyConstant(() => produced),
    );

    expect(result.current).toBe(produced);

    rerender();
    expect(result.current).toBe(produced);
  });
});
