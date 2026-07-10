import { renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { useLazyConstant } from '../useLazyConstant';

describe('useLazyConstant', () => {
  it('factory를 정확히 한 번만 실행하고 참조를 유지해야 합니다', () => {
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

  it('falsy 결과(null)도 재평가하지 않아야 합니다', () => {
    const factory = vi.fn(() => null);
    const { result, rerender } = renderHook(() => useLazyConstant(factory));

    expect(result.current).toBeNull();
    expect(factory).toHaveBeenCalledTimes(1);

    rerender();
    expect(result.current).toBeNull();
    expect(factory).toHaveBeenCalledTimes(1);
  });

  it('이후 렌더에서 전달된 새 factory는 무시해야 합니다', () => {
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

  it('컴포넌트 인스턴스별로 독립적인 값을 가져야 합니다', () => {
    const factory = () => ({ value: 'instance' });
    const { result: resultA } = renderHook(() => useLazyConstant(factory));
    const { result: resultB } = renderHook(() => useLazyConstant(factory));

    expect(resultA.current).toEqual(resultB.current);
    expect(resultA.current).not.toBe(resultB.current);
  });

  it('factory가 함수를 반환하면 그 함수를 값으로 저장해야 합니다', () => {
    const produced = () => 'produced';
    const { result, rerender } = renderHook(() =>
      useLazyConstant(() => produced),
    );

    expect(result.current).toBe(produced);

    rerender();
    expect(result.current).toBe(produced);
  });
});
