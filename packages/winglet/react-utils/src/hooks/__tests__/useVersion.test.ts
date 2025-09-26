import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { useVersion } from '../useVersion';

describe('useVersion', () => {
  it('초기 version 값은 0이어야 합니다', () => {
    const { result } = renderHook(() => useVersion());
    expect(result.current[0]).toBe(0);
  });

  it('updateVersion을 호출하면 version 값이 증가해야 합니다', async () => {
    const { result } = renderHook(() => useVersion());
    const [, updateVersion] = result.current;

    expect(result.current[0]).toBe(0);
    await act(async () => {
      updateVersion();
    });
    expect(result.current[0]).toBe(1);
    await act(async () => {
      updateVersion();
    });
    expect(result.current[0]).toBe(2);
  });

  it('callback이 제공되면 updateVersion 호출 시 실행되어야 합니다', async () => {
    const callback = vi.fn();
    const { result } = renderHook(() => useVersion(callback));
    const [, updateVersion] = result.current;

    expect(callback).not.toHaveBeenCalled();
    await act(async () => {
      updateVersion();
    });
    expect(callback).toHaveBeenCalledTimes(1);
    await act(async () => {
      updateVersion();
    });
    expect(callback).toHaveBeenCalledTimes(2);
  });

  it('callback이 변경되면 새로운 callback이 실행되어야 합니다', async () => {
    const callback1 = vi.fn();
    const callback2 = vi.fn();
    const { result, rerender } = renderHook(
      ({ callback }) => useVersion(callback),
      {
        initialProps: { callback: callback1 },
      },
    );

    const [, updateVersion] = result.current;
    await act(async () => {
      updateVersion();
    });
    expect(callback1).toHaveBeenCalledTimes(1);
    expect(callback2).not.toHaveBeenCalled();

    rerender({ callback: callback2 });
    await act(async () => {
      updateVersion();
    });
    expect(callback1).toHaveBeenCalledTimes(1);
    expect(callback2).toHaveBeenCalledTimes(1);
  });

  it('update 함수의 참조는 리렌더링 시에도 안정적으로 유지되어야 합니다', () => {
    const { result, rerender } = renderHook(() => useVersion());
    const [, firstUpdate] = result.current;

    rerender();
    const [, secondUpdate] = result.current;

    rerender();
    const [, thirdUpdate] = result.current;

    expect(firstUpdate).toBe(secondUpdate);
    expect(secondUpdate).toBe(thirdUpdate);
  });

  it('callback이 변경되어도 update 함수의 참조는 안정적으로 유지되어야 합니다', () => {
    const callback1 = vi.fn();
    const callback2 = vi.fn();
    const { result, rerender } = renderHook(
      ({ callback }) => useVersion(callback),
      {
        initialProps: { callback: callback1 },
      },
    );

    const [, firstUpdate] = result.current;

    rerender({ callback: callback2 });
    const [, secondUpdate] = result.current;

    rerender({ callback: callback1 });
    const [, thirdUpdate] = result.current;

    expect(firstUpdate).toBe(secondUpdate);
    expect(secondUpdate).toBe(thirdUpdate);
  });
});
