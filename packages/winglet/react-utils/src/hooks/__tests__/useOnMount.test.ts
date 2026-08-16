import { renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { useOnMount } from '../useOnMount';
import { useOnMountLayout } from '../useOnMountLayout';

describe('useOnMount', () => {
  it('should run the handler only on mount', () => {
    const handler = vi.fn();
    const { rerender } = renderHook(() => useOnMount(handler));

    expect(handler).toHaveBeenCalledTimes(1);

    // the handler should not run on re-render
    rerender();
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('should run the cleanup function returned by the handler on unmount', () => {
    const cleanup = vi.fn();
    const handler = vi.fn().mockReturnValue(cleanup);
    const { unmount } = renderHook(() => useOnMount(handler));

    expect(handler).toHaveBeenCalledTimes(1);
    expect(cleanup).not.toHaveBeenCalled();

    unmount();
    expect(cleanup).toHaveBeenCalledTimes(1);
  });
});

describe('useOnMountLayout', () => {
  it('should run the handler only on mount', () => {
    const handler = vi.fn();
    const { rerender } = renderHook(() => useOnMountLayout(handler));

    expect(handler).toHaveBeenCalledTimes(1);

    // the handler should not run on re-render
    rerender();
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('should run the cleanup function returned by the handler on unmount', () => {
    const cleanup = vi.fn();
    const handler = vi.fn().mockReturnValue(cleanup);
    const { unmount } = renderHook(() => useOnMountLayout(handler));

    expect(handler).toHaveBeenCalledTimes(1);
    expect(cleanup).not.toHaveBeenCalled();

    unmount();
    expect(cleanup).toHaveBeenCalledTimes(1);
  });
});
