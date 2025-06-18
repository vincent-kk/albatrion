import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { useDebounce } from '../useDebounce';

describe('useDebounce', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should initialize with isIdle as false', () => {
    // Arrange
    const callback = vi.fn();

    // Act
    const { result } = renderHook(() => useDebounce(callback, [], 1000));

    // Assert
    expect(result.current.isIdle()).toBe(false);
  });

  it('should execute callback after timeout when dependencies change', () => {
    // Arrange
    const callback = vi.fn();
    const timeout = 1000;
    let dependency = 'initial';

    // Act
    const { result, rerender } = renderHook(() =>
      useDebounce(callback, [dependency], timeout),
    );

    // Change dependency
    dependency = 'changed';
    rerender();

    // Assert - callback should not be called immediately
    expect(callback).not.toHaveBeenCalled();
    expect(result.current.isIdle()).toBe(false);

    // Fast-forward time
    act(() => {
      vi.advanceTimersByTime(timeout);
    });

    // Assert - callback should be called after timeout
    expect(callback).toHaveBeenCalledTimes(1);
    expect(result.current.isIdle()).toBe(true);
  });

  it('should reset timeout when dependencies change multiple times', () => {
    // Arrange
    const callback = vi.fn();
    const timeout = 1000;
    let dependency = 'initial';

    // Act
    const { result, rerender } = renderHook(() =>
      useDebounce(callback, [dependency], timeout),
    );

    // Change dependency multiple times rapidly
    dependency = 'change1';
    rerender();

    act(() => {
      vi.advanceTimersByTime(500); // Half timeout
    });

    dependency = 'change2';
    rerender();

    act(() => {
      vi.advanceTimersByTime(500); // Another half timeout
    });

    // Assert - callback should not be called yet (debounced)
    expect(callback).not.toHaveBeenCalled();
    expect(result.current.isIdle()).toBe(false);

    // Fast-forward remaining time
    act(() => {
      vi.advanceTimersByTime(500);
    });

    // Assert - callback should be called only once after final change
    expect(callback).toHaveBeenCalledTimes(1);
    expect(result.current.isIdle()).toBe(true);
  });

  it('should execute callback on initial mount with dependencies', () => {
    // Arrange
    const callback = vi.fn();
    const timeout = 1000;

    // Act
    renderHook(() => useDebounce(callback, ['initial'], timeout));

    // Fast-forward time
    act(() => {
      vi.advanceTimersByTime(timeout);
    });

    // Assert - callback should be called once on mount
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('should cancel pending execution when cancel is called', () => {
    // Arrange
    const callback = vi.fn();
    const timeout = 1000;
    let dependency = 'initial';

    // Act
    const { result, rerender } = renderHook(() =>
      useDebounce(callback, [dependency], timeout),
    );

    // Change dependency to trigger debounce
    dependency = 'changed';
    rerender();

    // Cancel before timeout completes
    act(() => {
      result.current.cancel();
    });

    // Fast-forward time past timeout
    act(() => {
      vi.advanceTimersByTime(timeout + 100);
    });

    // Assert - callback should not be called after cancellation
    expect(callback).not.toHaveBeenCalled();
    expect(result.current.isIdle()).toBe(true);
  });

  it('should handle empty dependency list', () => {
    // Arrange
    const callback = vi.fn();
    const timeout = 1000;

    // Act
    renderHook(() => useDebounce(callback, [], timeout));

    // Fast-forward time
    act(() => {
      vi.advanceTimersByTime(timeout);
    });

    // Assert - callback should be called once
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('should handle multiple dependencies', () => {
    // Arrange
    const callback = vi.fn();
    const timeout = 1000;
    let dep1 = 'a';
    let dep2 = 'b';

    // Act
    const { result, rerender } = renderHook(() =>
      useDebounce(callback, [dep1, dep2], timeout),
    );

    // Change first dependency
    dep1 = 'changed';
    rerender();

    act(() => {
      vi.advanceTimersByTime(500);
    });

    // Change second dependency
    dep2 = 'changed';
    rerender();

    act(() => {
      vi.advanceTimersByTime(500);
    });

    // Assert - callback should not be called yet
    expect(callback).not.toHaveBeenCalled();

    // Fast-forward remaining time
    act(() => {
      vi.advanceTimersByTime(500);
    });

    // Assert - callback should be called once after all changes
    expect(callback).toHaveBeenCalledTimes(1);
    expect(result.current.isIdle()).toBe(true);
  });

  it('should use default values when not provided', () => {
    // Arrange
    const callback = vi.fn();

    // Act
    const { result } = renderHook(() => useDebounce(callback));

    // Fast-forward minimal time (timeout defaults to 0)
    act(() => {
      vi.advanceTimersByTime(1);
    });

    // Assert - callback should be called with default timeout
    expect(callback).toHaveBeenCalledTimes(1);
    expect(result.current.isIdle()).toBe(true);
  });

  it('should handle callback changes', () => {
    // Arrange
    const callback1 = vi.fn();
    const callback2 = vi.fn();
    const timeout = 1000;
    let dependency = 'initial';

    // Act
    const { result, rerender } = renderHook(
      ({ callback }) => useDebounce(callback, [dependency], timeout),
      { initialProps: { callback: callback1 } },
    );

    // Change dependency to trigger debounce
    dependency = 'changed';
    rerender({ callback: callback1 });

    // Change callback before timeout completes
    rerender({ callback: callback2 });

    // Fast-forward time
    act(() => {
      vi.advanceTimersByTime(timeout);
    });

    // Assert - only the updated callback should be called
    expect(callback1).not.toHaveBeenCalled();
    expect(callback2).toHaveBeenCalledTimes(1);
    expect(result.current.isIdle()).toBe(true);
  });

  it('should handle timeout value changes', () => {
    // Arrange
    const callback = vi.fn();
    const initialTimeout = 1000;
    const newTimeout = 2000;
    let dependency = 'initial';

    // Act
    const { result, rerender } = renderHook(
      ({ timeout }) => useDebounce(callback, [dependency], timeout),
      { initialProps: { timeout: initialTimeout } },
    );

    // Change dependency to trigger debounce
    dependency = 'changed';
    rerender({ timeout: initialTimeout });

    // Change timeout value
    rerender({ timeout: newTimeout });

    // Fast-forward by initial timeout (callback should be called because timer was already running)
    act(() => {
      vi.advanceTimersByTime(initialTimeout);
    });

    // Assert - callback should be called with initial timeout since the timer was already running
    expect(callback).toHaveBeenCalledTimes(1);
    expect(result.current.isIdle()).toBe(true);
  });

  it('should clean up timeout on unmount', () => {
    // Arrange
    const callback = vi.fn();
    const timeout = 1000;
    let dependency = 'initial';

    // Act
    const { unmount, rerender } = renderHook(() =>
      useDebounce(callback, [dependency], timeout),
    );

    // Change dependency to trigger debounce
    dependency = 'changed';
    rerender();

    // Unmount before timeout completes
    unmount();

    // Fast-forward time past timeout
    act(() => {
      vi.advanceTimersByTime(timeout + 100);
    });

    // Assert - callback should not be called after unmount
    expect(callback).not.toHaveBeenCalled();
  });

  it('should handle zero timeout', () => {
    // Arrange
    const callback = vi.fn();
    const timeout = 0;
    let dependency = 'initial';

    // Act
    const { result, rerender } = renderHook(() =>
      useDebounce(callback, [dependency], timeout),
    );

    // Change dependency
    dependency = 'changed';
    rerender();

    // Fast-forward minimal time
    act(() => {
      vi.advanceTimersByTime(1);
    });

    // Assert - callback should be called immediately
    expect(callback).toHaveBeenCalledTimes(1);
    expect(result.current.isIdle()).toBe(true);
  });

  it('should maintain stable function references', () => {
    // Arrange
    const callback = vi.fn();
    const timeout = 1000;

    // Act
    const { result, rerender } = renderHook(() =>
      useDebounce(callback, [], timeout),
    );

    const firstRender = {
      isIdle: result.current.isIdle,
      cancel: result.current.cancel,
    };

    // Rerender
    rerender();

    const secondRender = {
      isIdle: result.current.isIdle,
      cancel: result.current.cancel,
    };

    // Assert - function references should be stable
    expect(firstRender.isIdle).toBe(secondRender.isIdle);
    expect(firstRender.cancel).toBe(secondRender.cancel);
  });

  // === 엄밀한 테스트 케이스들 ===

  describe('Edge Cases and Rigorous Testing', () => {
    it('should handle rapid dependency changes with precise timing', () => {
      // Arrange
      const callback = vi.fn();
      const timeout = 1000;
      let dependency = 0;

      // Act
      const { result, rerender } = renderHook(() =>
        useDebounce(callback, [dependency], timeout),
      );

      // Simulate rapid typing scenario
      for (let i = 1; i <= 10; i++) {
        dependency = i;
        rerender();

        // Advance time by 50ms each change (total 500ms)
        act(() => {
          vi.advanceTimersByTime(50);
        });
      }

      // Assert - callback should not be called yet
      expect(callback).not.toHaveBeenCalled();
      expect(result.current.isIdle()).toBe(false);

      // Fast-forward full timeout from last change
      act(() => {
        vi.advanceTimersByTime(timeout);
      });

      // Assert - callback should be called exactly once
      expect(callback).toHaveBeenCalledTimes(1);
      expect(result.current.isIdle()).toBe(true);
    });

    it('should handle complex object dependencies correctly', () => {
      // Arrange
      const callback = vi.fn();
      const timeout = 500;
      let user = { id: 1, name: 'John', settings: { theme: 'dark' } };

      // Act
      const { result, rerender } = renderHook(() =>
        useDebounce(callback, [user], timeout),
      );

      // Change object reference
      user = { ...user, name: 'Jane' };
      rerender();

      act(() => {
        vi.advanceTimersByTime(200);
      });

      // Change nested object
      user = { ...user, settings: { ...user.settings, theme: 'light' } };
      rerender();

      act(() => {
        vi.advanceTimersByTime(200);
      });

      // Assert - callback should not be called yet
      expect(callback).not.toHaveBeenCalled();

      // Fast-forward remaining time
      act(() => {
        vi.advanceTimersByTime(300);
      });

      // Assert - callback should be called once
      expect(callback).toHaveBeenCalledTimes(1);
      expect(result.current.isIdle()).toBe(true);
    });

    it('should handle callback that throws an error', () => {
      // Arrange
      const errorCallback = vi.fn(() => {
        throw new Error('Test error');
      });
      const timeout = 500;
      let dependency = 'initial';

      // Act & Assert - should not throw during setup
      const { result, rerender } = renderHook(() =>
        useDebounce(errorCallback, [dependency], timeout),
      );

      dependency = 'changed';
      rerender();

      // Fast-forward time - error should be thrown but caught by test environment
      expect(() => {
        act(() => {
          vi.advanceTimersByTime(timeout);
        });
      }).toThrow('Test error');

      // Assert - isIdle should still be true even after error
      expect(result.current.isIdle()).toBe(true);
      expect(errorCallback).toHaveBeenCalledTimes(1);
    });

    it('should handle very frequent dependency changes (stress test)', () => {
      // Arrange
      const callback = vi.fn();
      const timeout = 100;
      let dependency = 0;

      // Act
      const { result, rerender } = renderHook(() =>
        useDebounce(callback, [dependency], timeout),
      );

      // Simulate very frequent changes (100 changes in 50ms total)
      for (let i = 1; i <= 100; i++) {
        dependency = i;
        rerender();

        if (i % 20 === 0) {
          act(() => {
            vi.advanceTimersByTime(10);
          });
        }
      }

      // Assert - callback should not be called yet
      expect(callback).not.toHaveBeenCalled();
      expect(result.current.isIdle()).toBe(false);

      // Fast-forward to complete debounce
      act(() => {
        vi.advanceTimersByTime(timeout);
      });

      // Assert - callback should be called exactly once
      expect(callback).toHaveBeenCalledTimes(1);
      expect(result.current.isIdle()).toBe(true);
    });

    it('should handle null/undefined dependencies correctly', () => {
      // Arrange
      const callback = vi.fn();
      const timeout = 500;
      let dependency: string | null | undefined = null;

      // Act
      const { result, rerender } = renderHook(() =>
        useDebounce(callback, [dependency], timeout),
      );

      // Change from null to undefined
      dependency = undefined;
      rerender();

      act(() => {
        vi.advanceTimersByTime(200);
      });

      // Change from undefined to string
      dependency = 'value';
      rerender();

      act(() => {
        vi.advanceTimersByTime(200);
      });

      // Assert - callback should not be called yet
      expect(callback).not.toHaveBeenCalled();

      // Fast-forward remaining time
      act(() => {
        vi.advanceTimersByTime(300);
      });

      // Assert - callback should be called once
      expect(callback).toHaveBeenCalledTimes(1);
      expect(result.current.isIdle()).toBe(true);
    });

    it('should handle negative timeout values', () => {
      // Arrange
      const callback = vi.fn();
      const timeout = -100; // Negative timeout
      let dependency = 'initial';

      // Act
      const { result, rerender } = renderHook(() =>
        useDebounce(callback, [dependency], timeout),
      );

      dependency = 'changed';
      rerender();

      // Fast-forward minimal time
      act(() => {
        vi.advanceTimersByTime(1);
      });

      // Assert - callback should be called (negative timeout treated as immediate)
      expect(callback).toHaveBeenCalledTimes(1);
      expect(result.current.isIdle()).toBe(true);
    });

    it('should maintain consistent state during rapid cancel operations', () => {
      // Arrange
      const callback = vi.fn();
      const timeout = 1000;
      let dependency = 'initial';

      // Act
      const { result, rerender } = renderHook(() =>
        useDebounce(callback, [dependency], timeout),
      );

      // Trigger debounce
      dependency = 'changed';
      rerender();

      // Rapid cancel operations
      for (let i = 0; i < 5; i++) {
        act(() => {
          result.current.cancel();
          expect(result.current.isIdle()).toBe(true);
        });
      }

      // Fast-forward time
      act(() => {
        vi.advanceTimersByTime(timeout + 100);
      });

      // Assert - callback should not be called after cancellation
      expect(callback).not.toHaveBeenCalled();
      expect(result.current.isIdle()).toBe(true);
    });

    it('should handle asynchronous callback correctly', async () => {
      // Arrange
      const asyncCallback = vi.fn(async () => {
        await new Promise((resolve) => setTimeout(resolve, 100));
        return 'async result';
      });
      const timeout = 500;
      let dependency = 'initial';

      // Act
      const { result, rerender } = renderHook(() =>
        useDebounce(asyncCallback, [dependency], timeout),
      );

      dependency = 'changed';
      rerender();

      // Fast-forward debounce time
      act(() => {
        vi.advanceTimersByTime(timeout);
      });

      // Assert - callback should be called
      expect(asyncCallback).toHaveBeenCalledTimes(1);
      expect(result.current.isIdle()).toBe(true);
    });
  });
});
