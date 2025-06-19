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

  // === 기본 동작 테스트 ===

  it('should initialize with isIdle as false', () => {
    // Arrange
    const callback = vi.fn();

    // Act
    const { result } = renderHook(() => useDebounce(callback, [], 1000));

    // Assert
    expect(result.current.isIdle()).toBe(false);
  });

  it('should execute callback on initial mount with default immediate=true', () => {
    // Arrange
    const callback = vi.fn();
    const timeout = 1000;

    // Act
    const { result } = renderHook(() =>
      useDebounce(callback, ['initial'], timeout),
    );

    // Assert - callback should be called immediately on mount (immediate=true by default)
    expect(callback).toHaveBeenCalledTimes(1);
    expect(result.current.isIdle()).toBe(false); // Timer should be running

    // Fast-forward time to complete timer
    act(() => {
      vi.advanceTimersByTime(timeout);
    });

    // Assert - no additional execution after timer completes
    expect(callback).toHaveBeenCalledTimes(1);
    expect(result.current.isIdle()).toBe(true);
  });

  it('should execute callback after timeout when immediate=false', () => {
    // Arrange
    const callback = vi.fn();
    const timeout = 1000;

    // Act
    const { result } = renderHook(() =>
      useDebounce(callback, ['initial'], timeout, { immediate: false }),
    );

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

  it('should cancel pending execution when cancel is called', () => {
    // Arrange
    const callback = vi.fn();
    const timeout = 1000;

    // Act
    const { result } = renderHook(() =>
      useDebounce(callback, ['initial'], timeout, { immediate: false }),
    );

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

  it('should use default values when not provided', () => {
    // Arrange
    const callback = vi.fn();

    // Act
    const { result } = renderHook(() => useDebounce(callback));

    // Assert - callback should be called immediately (default immediate=true)
    expect(callback).toHaveBeenCalledTimes(1);

    // Fast-forward minimal time (timeout defaults to 0)
    act(() => {
      vi.advanceTimersByTime(1);
    });

    // Assert - should be idle after timer completes
    expect(result.current.isIdle()).toBe(true);
  });

  // === immediate=true 모드 테스트 ===

  describe('immediate=true mode', () => {
    it('should execute immediately on mount and start timer', () => {
      // Arrange
      const callback = vi.fn();
      const timeout = 1000;

      // Act
      const { result } = renderHook(() =>
        useDebounce(callback, ['initial'], timeout, { immediate: true }),
      );

      // Assert - immediate execution
      expect(callback).toHaveBeenCalledTimes(1);
      expect(result.current.isIdle()).toBe(false); // Timer running

      // Fast-forward time to complete timer
      act(() => {
        vi.advanceTimersByTime(timeout);
      });

      // Assert - no additional execution
      expect(callback).toHaveBeenCalledTimes(1);
      expect(result.current.isIdle()).toBe(true);
    });

    it('should execute immediately on dependency change after timer completes', () => {
      // Arrange
      const callback = vi.fn();
      const timeout = 1000;
      let dependency = 'initial';

      // Act
      const { result, rerender } = renderHook(() =>
        useDebounce(callback, [dependency], timeout, { immediate: true }),
      );

      // Initial execution
      expect(callback).toHaveBeenCalledTimes(1);

      // Complete timer
      act(() => {
        vi.advanceTimersByTime(timeout);
      });
      expect(result.current.isIdle()).toBe(true);

      // Change dependency after timer completes
      dependency = 'changed';
      rerender();

      // Assert - immediate execution again
      expect(callback).toHaveBeenCalledTimes(2);
      expect(result.current.isIdle()).toBe(false); // Timer running again
    });

    it('should debounce changes during timer period', () => {
      // Arrange
      const callback = vi.fn();
      const timeout = 1000;
      let dependency = 'initial';

      // Act
      const { result, rerender } = renderHook(() =>
        useDebounce(callback, [dependency], timeout, { immediate: true }),
      );

      // Initial execution
      expect(callback).toHaveBeenCalledTimes(1);

      // Change dependency during timer period
      dependency = 'change1';
      rerender();

      act(() => {
        vi.advanceTimersByTime(500);
      });

      dependency = 'change2';
      rerender();

      // Assert - no additional executions during timer period
      expect(callback).toHaveBeenCalledTimes(1);
      expect(result.current.isIdle()).toBe(false);

      // Complete debounce timer
      act(() => {
        vi.advanceTimersByTime(1000);
      });

      // Assert - debounced execution
      expect(callback).toHaveBeenCalledTimes(2);
      expect(result.current.isIdle()).toBe(true);
    });

    it('should not execute additional times if no changes during timer', () => {
      // Arrange
      const callback = vi.fn();
      const timeout = 1000;

      // Act
      const { result } = renderHook(() =>
        useDebounce(callback, ['initial'], timeout, { immediate: true }),
      );

      // Initial execution
      expect(callback).toHaveBeenCalledTimes(1);

      // Complete timer without changes
      act(() => {
        vi.advanceTimersByTime(timeout);
      });

      // Assert - no additional execution
      expect(callback).toHaveBeenCalledTimes(1);
      expect(result.current.isIdle()).toBe(true);
    });
  });

  // === immediate=false 모드 테스트 ===

  describe('immediate=false mode', () => {
    it('should schedule timer on mount and execute after timeout', () => {
      // Arrange
      const callback = vi.fn();
      const timeout = 1000;

      // Act
      const { result } = renderHook(() =>
        useDebounce(callback, ['initial'], timeout, { immediate: false }),
      );

      // Assert - no immediate execution, timer scheduled
      expect(callback).not.toHaveBeenCalled();
      expect(result.current.isIdle()).toBe(false);

      // Complete timer
      act(() => {
        vi.advanceTimersByTime(timeout);
      });

      // Assert - execution after timeout
      expect(callback).toHaveBeenCalledTimes(1);
      expect(result.current.isIdle()).toBe(true);
    });

    it('should debounce dependency changes before timer completes', () => {
      // Arrange
      const callback = vi.fn();
      const timeout = 1000;
      let dependency = 'initial';

      // Act
      const { result, rerender } = renderHook(() =>
        useDebounce(callback, [dependency], timeout, { immediate: false }),
      );

      // Change dependency before initial timer completes
      dependency = 'change1';
      rerender();

      act(() => {
        vi.advanceTimersByTime(500);
      });

      dependency = 'change2';
      rerender();

      // Assert - no execution yet
      expect(callback).not.toHaveBeenCalled();
      expect(result.current.isIdle()).toBe(false);

      // Complete final debounce timer
      act(() => {
        vi.advanceTimersByTime(1000);
      });

      // Assert - single execution after debounce
      expect(callback).toHaveBeenCalledTimes(1);
      expect(result.current.isIdle()).toBe(true);
    });
  });

  // === 기존 테스트들 (수정된 버전) ===

  it('should reset timeout when dependencies change multiple times', () => {
    // Arrange
    const callback = vi.fn();
    const timeout = 1000;
    let dependency = 'initial';

    // Act
    const { result, rerender } = renderHook(() =>
      useDebounce(callback, [dependency], timeout, { immediate: false }),
    );

    // Change dependency multiple times rapidly
    dependency = 'change1';
    rerender();

    act(() => {
      vi.advanceTimersByTime(500);
    });

    dependency = 'change2';
    rerender();

    act(() => {
      vi.advanceTimersByTime(500);
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

  it('should handle empty dependency list', () => {
    // Arrange
    const callback = vi.fn();
    const timeout = 1000;

    // Act
    renderHook(() => useDebounce(callback, [], timeout));

    // Assert - callback should be called immediately (default immediate=true)
    expect(callback).toHaveBeenCalledTimes(1);

    // Fast-forward time
    act(() => {
      vi.advanceTimersByTime(timeout);
    });

    // Assert - no additional calls
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
      useDebounce(callback, [dep1, dep2], timeout, { immediate: false }),
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

  it('should handle callback changes', () => {
    // Arrange
    const callback1 = vi.fn();
    const callback2 = vi.fn();
    const timeout = 1000;
    let dependency = 'initial';

    // Act
    const { result, rerender } = renderHook(
      ({ callback }) =>
        useDebounce(callback, [dependency], timeout, { immediate: false }),
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
      ({ timeout }) =>
        useDebounce(callback, [dependency], timeout, { immediate: false }),
      { initialProps: { timeout: initialTimeout } },
    );

    // Change dependency to trigger debounce
    dependency = 'changed';
    rerender({ timeout: initialTimeout });

    // Change timeout value
    rerender({ timeout: newTimeout });

    // Fast-forward by initial timeout
    act(() => {
      vi.advanceTimersByTime(initialTimeout);
    });

    // Assert - callback should be called with initial timeout since timer was already running
    expect(callback).toHaveBeenCalledTimes(1);
    expect(result.current.isIdle()).toBe(true);
  });

  it('should clean up timeout on unmount', () => {
    // Arrange
    const callback = vi.fn();
    const timeout = 1000;

    // Act
    const { unmount } = renderHook(() =>
      useDebounce(callback, ['initial'], timeout, { immediate: false }),
    );

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

    // Act
    const { result } = renderHook(() =>
      useDebounce(callback, ['initial'], timeout, { immediate: false }),
    );

    // Fast-forward minimal time
    act(() => {
      vi.advanceTimersByTime(1);
    });

    // Assert - callback should be called immediately with zero timeout
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

  // === 엣지 케이스 테스트 ===

  describe('Edge Cases', () => {
    it('should handle rapid dependency changes with precise timing', () => {
      // Arrange
      const callback = vi.fn();
      const timeout = 1000;
      let dependency = 0;

      // Act
      const { result, rerender } = renderHook(() =>
        useDebounce(callback, [dependency], timeout, { immediate: false }),
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

    it('should handle null/undefined dependencies correctly', () => {
      // Arrange
      const callback = vi.fn();
      const timeout = 500;
      let dependency: string | null | undefined = null;

      // Act
      const { result, rerender } = renderHook(() =>
        useDebounce(callback, [dependency], timeout, { immediate: false }),
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

      // Act
      const { result } = renderHook(() =>
        useDebounce(callback, ['initial'], timeout, { immediate: false }),
      );

      // Fast-forward minimal time
      act(() => {
        vi.advanceTimersByTime(1);
      });

      // Assert - callback should be called (negative timeout treated as immediate)
      expect(callback).toHaveBeenCalledTimes(1);
      expect(result.current.isIdle()).toBe(true);
    });

    it('should handle asynchronous callback correctly', async () => {
      // Arrange
      const asyncCallback = vi.fn(async () => {
        await new Promise((resolve) => setTimeout(resolve, 100));
        return 'async result';
      });
      const timeout = 500;

      // Act
      const { result } = renderHook(() =>
        useDebounce(asyncCallback, ['initial'], timeout),
      );

      // Fast-forward debounce time
      act(() => {
        vi.advanceTimersByTime(timeout);
      });

      // Assert - callback should be called
      expect(asyncCallback).toHaveBeenCalledTimes(1);
      expect(result.current.isIdle()).toBe(true);
    });

    it('should handle complex immediate mode scenarios with multiple changes', () => {
      // Arrange
      const callback = vi.fn();
      const timeout = 1000;
      let dependency = 'initial';

      // Act
      const { result, rerender } = renderHook(() =>
        useDebounce(callback, [dependency], timeout, { immediate: true }),
      );

      // Initial execution
      expect(callback).toHaveBeenCalledTimes(1);
      expect(result.current.isIdle()).toBe(false);

      // Multiple rapid changes during timer period
      dependency = 'change1';
      rerender();

      expect(callback).toHaveBeenCalledTimes(1); // Should still be 1
      expect(result.current.isIdle()).toBe(false);

      act(() => {
        vi.advanceTimersByTime(200);
      });

      dependency = 'change2';
      rerender();

      expect(callback).toHaveBeenCalledTimes(1); // Should still be 1
      expect(result.current.isIdle()).toBe(false);

      act(() => {
        vi.advanceTimersByTime(200);
      });

      dependency = 'change3';
      rerender();

      // Assert - still only initial execution
      expect(callback).toHaveBeenCalledTimes(1);
      expect(result.current.isIdle()).toBe(false);

      // Complete timer - need to wait full timeout from last change (change3)
      act(() => {
        vi.advanceTimersByTime(1000); // Full timeout from last change
      });

      expect(callback).toHaveBeenCalledTimes(2);
      expect(result.current.isIdle()).toBe(true);

      // No more changes - next change should be immediate again
      dependency = 'change4';
      rerender();

      expect(callback).toHaveBeenCalledTimes(3); // Immediate execution
      expect(result.current.isIdle()).toBe(false);
    });

    it('should handle cancel during immediate mode timer period', () => {
      // Arrange
      const callback = vi.fn();
      const timeout = 1000;
      let dependency = 'initial';

      // Act
      const { result, rerender } = renderHook(() =>
        useDebounce(callback, [dependency], timeout, { immediate: true }),
      );

      // Initial execution
      expect(callback).toHaveBeenCalledTimes(1);

      // Change during timer period
      dependency = 'changed';
      rerender();

      // Cancel before timer completes
      act(() => {
        result.current.cancel();
      });

      // Fast-forward past original timeout
      act(() => {
        vi.advanceTimersByTime(timeout + 100);
      });

      // Assert - no additional execution due to cancellation
      expect(callback).toHaveBeenCalledTimes(1);
      expect(result.current.isIdle()).toBe(true);

      // Next change should work normally (immediate execution)
      dependency = 'after-cancel';
      rerender();

      expect(callback).toHaveBeenCalledTimes(2);
      expect(result.current.isIdle()).toBe(false);
    });

    it('should handle options change during execution', () => {
      // Arrange
      const callback = vi.fn();
      const timeout = 1000;
      let dependency = 'initial';

      // Act - start with immediate=true
      const { result, rerender } = renderHook(
        ({ immediate }) =>
          useDebounce(callback, [dependency], timeout, { immediate }),
        { initialProps: { immediate: true } },
      );

      // Initial execution with immediate=true
      expect(callback).toHaveBeenCalledTimes(1);

      // Change options to immediate=false (note: this won't affect current behavior
      // since optionsRef is set only once, but testing the behavior)
      rerender({ immediate: false });

      // Change dependency
      dependency = 'changed';
      rerender({ immediate: false });

      // Should still behave as immediate=true since optionsRef doesn't update
      expect(callback).toHaveBeenCalledTimes(1); // No immediate execution for this change

      act(() => {
        vi.advanceTimersByTime(timeout);
      });

      // Should execute due to debounce
      expect(callback).toHaveBeenCalledTimes(2);
      expect(result.current.isIdle()).toBe(true);
    });

    it('should handle very short timeout with immediate mode', () => {
      // Arrange
      const callback = vi.fn();
      const timeout = 1; // Very short timeout
      let dependency = 'initial';

      // Act
      const { result, rerender } = renderHook(() =>
        useDebounce(callback, [dependency], timeout, { immediate: true }),
      );

      // Initial execution
      expect(callback).toHaveBeenCalledTimes(1);

      // Change during very short timer period
      dependency = 'changed';
      rerender();

      // Timer should complete very quickly
      act(() => {
        vi.advanceTimersByTime(2);
      });

      // Should have debounced execution
      expect(callback).toHaveBeenCalledTimes(2);
      expect(result.current.isIdle()).toBe(true);
    });
  });
});
