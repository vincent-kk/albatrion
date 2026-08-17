import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { useVersion } from '../useVersion';

describe('useVersion', () => {
  it('should have an initial version value of 0', () => {
    const { result } = renderHook(() => useVersion());
    expect(result.current[0]).toBe(0);
  });

  it('should increment the version value when updateVersion is called', async () => {
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

  it('should run the callback on updateVersion when a callback is provided', async () => {
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

  it('should run the new callback when the callback changes', async () => {
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

  it('should keep the update function reference stable across re-renders', () => {
    const { result, rerender } = renderHook(() => useVersion());
    const [, firstUpdate] = result.current;

    rerender();
    const [, secondUpdate] = result.current;

    rerender();
    const [, thirdUpdate] = result.current;

    expect(firstUpdate).toBe(secondUpdate);
    expect(secondUpdate).toBe(thirdUpdate);
  });

  it('should keep the update function reference stable even when the callback changes', () => {
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
