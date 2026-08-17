import { renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { useEffectUntil } from '../useEffectUntil';

describe('useEffectUntil', () => {
  it('should run the effect until the condition becomes true', () => {
    const effect = vi.fn().mockReturnValue(false);
    const { rerender } = renderHook(() => useEffectUntil(effect));

    expect(effect).toHaveBeenCalledTimes(1);

    // The effect runs again when it returns false
    rerender();
    expect(effect).toHaveBeenCalledTimes(2);

    // The effect stops running once it returns true
    effect.mockReturnValue(true);
    rerender();
    expect(effect).toHaveBeenCalledTimes(3);

    // After returning true, it is never executed again
    rerender();
    expect(effect).toHaveBeenCalledTimes(3);
  });

  it('should re-run the effect whenever the dependencies change', () => {
    const effect = vi.fn().mockReturnValue(false);
    const { rerender } = renderHook(
      ({ deps }) => useEffectUntil(effect, deps),
      {
        initialProps: { deps: [1] },
      },
    );

    expect(effect).toHaveBeenCalledTimes(1);

    // The effect runs again when the dependencies change
    rerender({ deps: [2] });
    expect(effect).toHaveBeenCalledTimes(2);
  });

  it('should not re-run when the dependencies are an empty array', () => {
    const effect = vi.fn().mockReturnValue(false);
    const { rerender } = renderHook(() => useEffectUntil(effect, []));

    expect(effect).toHaveBeenCalledTimes(1);
    rerender();
    expect(effect).toHaveBeenCalledTimes(1);
  });
});
