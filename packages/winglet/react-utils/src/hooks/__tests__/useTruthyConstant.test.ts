import { renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { useTruthyConstant } from '../useTruthyConstant';

describe('useTruthyConstant', () => {
  it('상수 값을 그대로 반환해야 합니다', () => {
    const value = { test: 'value' };
    const { result } = renderHook(() => useTruthyConstant(value));

    expect(result.current).toBe(value);
  });

  it('함수를 실행하여 결과를 반환해야 합니다', () => {
    const factory = vi.fn().mockReturnValue({ test: 'value' });
    const { result } = renderHook(() => useTruthyConstant(factory));

    expect(result.current).toEqual({ test: 'value' });
    expect(factory).toHaveBeenCalledTimes(1);
  });

  it('리렌더링 시에도 같은 값을 유지해야 합니다', () => {
    const value = { test: 'value' };
    const { result, rerender } = renderHook(() => useTruthyConstant(value));

    const firstResult = result.current;
    expect(firstResult).toBe(value);

    rerender();
    expect(result.current).toBe(firstResult);
  });

  it('함수의 경우 리렌더링 시에도 한 번만 실행되어야 합니다', () => {
    const factory = vi.fn().mockReturnValue({ test: 'value' });
    const { rerender } = renderHook(() => useTruthyConstant(factory));

    expect(factory).toHaveBeenCalledTimes(1);

    rerender();
    expect(factory).toHaveBeenCalledTimes(1);
  });

  it('객체와 같은 복잡한 타입도 같은 참조를 유지해야 합니다', () => {
    const value = { nested: { test: 'value' } };
    const { result, rerender } = renderHook(() => useTruthyConstant(value));

    const firstResult = result.current;
    expect(firstResult).toBe(value);

    rerender();
    expect(result.current).toBe(firstResult);
  });
});
