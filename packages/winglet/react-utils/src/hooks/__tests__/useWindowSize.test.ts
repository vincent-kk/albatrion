import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { useWindowSize } from '../useWindowSize';

describe('useWindowSize', () => {
  const originalInnerWidth = window.innerWidth;
  const originalInnerHeight = window.innerHeight;

  beforeEach(() => {
    // Mock window.innerWidth and window.innerHeight
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1024,
    });
    Object.defineProperty(window, 'innerHeight', {
      writable: true,
      configurable: true,
      value: 768,
    });
  });

  afterEach(() => {
    // Restore the original values
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: originalInnerWidth,
    });
    Object.defineProperty(window, 'innerHeight', {
      writable: true,
      configurable: true,
      value: originalInnerHeight,
    });
  });

  it('should return the initial window size', () => {
    const { result } = renderHook(() => useWindowSize());

    expect(result.current).toEqual({
      width: 1024,
      height: 768,
    });
  });

  it('should return the new size when the window size changes', async () => {
    const { result } = renderHook(() => useWindowSize());

    await act(async () => {
      // Change the window size
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 800,
      });
      Object.defineProperty(window, 'innerHeight', {
        writable: true,
        configurable: true,
        value: 600,
      });
      // Dispatch the resize event
      window.dispatchEvent(new Event('resize'));
    });

    expect(result.current).toEqual({
      width: 800,
      height: 600,
    });
  });

  it('should not re-render on a resize event that does not change the size', () => {
    let renderCount = 0;
    const { result } = renderHook(() => {
      renderCount++;
      return useWindowSize();
    });

    const settledRenderCount = renderCount;
    const settledSize = result.current;

    act(() => {
      window.dispatchEvent(new Event('resize'));
    });

    expect(renderCount).toBe(settledRenderCount);
    expect(result.current).toBe(settledSize);
  });

  it('should remove the resize event listener on unmount', () => {
    const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');
    const { unmount } = renderHook(() => useWindowSize());

    unmount();

    expect(removeEventListenerSpy).toHaveBeenCalledWith(
      'resize',
      expect.any(Function),
    );
  });
});
