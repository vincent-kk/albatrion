import { renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { useEffectUntil } from '../useEffectUntil';

describe('useEffectUntil', () => {
  it('조건이 true가 될 때까지 effect를 실행해야 합니다', () => {
    const effect = vi.fn().mockReturnValue(false);
    const { rerender } = renderHook(() => useEffectUntil(effect));

    expect(effect).toHaveBeenCalledTimes(1);

    // effect가 false를 반환하면 다시 실행됩니다
    rerender();
    expect(effect).toHaveBeenCalledTimes(2);

    // effect가 true를 반환하면 더 이상 실행되지 않습니다
    effect.mockReturnValue(true);
    rerender();
    expect(effect).toHaveBeenCalledTimes(3);

    // true를 반환한 후에는 더 이상 실행되지 않습니다
    rerender();
    expect(effect).toHaveBeenCalledTimes(3);
  });

  it('의존성이 변경될 때마다 effect를 다시 실행해야 합니다', () => {
    const effect = vi.fn().mockReturnValue(false);
    const { rerender } = renderHook(
      ({ deps }) => useEffectUntil(effect, deps),
      {
        initialProps: { deps: [1] },
      },
    );

    expect(effect).toHaveBeenCalledTimes(1);

    // 의존성이 변경되면 effect가 다시 실행됩니다
    rerender({ deps: [2] });
    expect(effect).toHaveBeenCalledTimes(2);
  });

  it('의존성이 빈 배열인 경우, 다시 실행되지 않습니다', () => {
    const effect = vi.fn().mockReturnValue(false);
    const { rerender } = renderHook(() => useEffectUntil(effect, []));

    expect(effect).toHaveBeenCalledTimes(1);
    rerender();
    expect(effect).toHaveBeenCalledTimes(1);
  });
});
