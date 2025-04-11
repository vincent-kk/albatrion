import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { useTick } from '../useTick';

describe('useTick', () => {
  it('초기 tick 값은 0이어야 합니다', () => {
    const { result } = renderHook(() => useTick());
    expect(result.current[0]).toBe(0);
  });

  it('updateTick을 호출하면 tick 값이 증가해야 합니다', async () => {
    const { result } = renderHook(() => useTick());
    const [, updateTick] = result.current;

    expect(result.current[0]).toBe(0);
    await act(async () => {
      updateTick();
    });
    expect(result.current[0]).toBe(1);
    await act(async () => {
      updateTick();
    });
    expect(result.current[0]).toBe(2);
  });

  it('callback이 제공되면 updateTick 호출 시 실행되어야 합니다', async () => {
    const callback = vi.fn();
    const { result } = renderHook(() => useTick(callback));
    const [, updateTick] = result.current;

    expect(callback).not.toHaveBeenCalled();
    await act(async () => {
      updateTick();
    });
    expect(callback).toHaveBeenCalledTimes(1);
    await act(async () => {
      updateTick();
    });
    expect(callback).toHaveBeenCalledTimes(2);
  });

  it('callback이 변경되면 새로운 callback이 실행되어야 합니다', async () => {
    const callback1 = vi.fn();
    const callback2 = vi.fn();
    const { result, rerender } = renderHook(
      ({ callback }) => useTick(callback),
      {
        initialProps: { callback: callback1 },
      },
    );

    const [, updateTick] = result.current;
    await act(async () => {
      updateTick();
    });
    expect(callback1).toHaveBeenCalledTimes(1);
    expect(callback2).not.toHaveBeenCalled();

    rerender({ callback: callback2 });
    await act(async () => {
      updateTick();
    });
    expect(callback1).toHaveBeenCalledTimes(1);
    expect(callback2).toHaveBeenCalledTimes(1);
  });
});
