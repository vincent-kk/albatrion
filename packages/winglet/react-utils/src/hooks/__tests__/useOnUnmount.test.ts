import { renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { useOnUnmount } from '../useOnUnmount';
import { useOnUnmountLayout } from '../useOnUnmountLayout';

describe('useOnUnmount', () => {
  it('should run the handler only on unmount', () => {
    const handler = vi.fn();
    const { unmount } = renderHook(() => useOnUnmount(handler));

    expect(handler).not.toHaveBeenCalled();

    unmount();
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('should not run the handler on re-render', () => {
    const handler = vi.fn();
    const { rerender, unmount } = renderHook(() => useOnUnmount(handler));

    rerender();
    expect(handler).not.toHaveBeenCalled();

    unmount();
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('should run the most recently provided handler on unmount', () => {
    const first = vi.fn();
    const second = vi.fn();
    const { rerender, unmount } = renderHook(
      ({ handler }) => useOnUnmount(handler),
      { initialProps: { handler: first } },
    );

    rerender({ handler: second });
    unmount();

    expect(first).not.toHaveBeenCalled();
    expect(second).toHaveBeenCalledTimes(1);
  });
});

describe('useOnUnmountLayout', () => {
  it('should run the handler only on unmount', () => {
    const handler = vi.fn();
    const { unmount } = renderHook(() => useOnUnmountLayout(handler));

    expect(handler).not.toHaveBeenCalled();

    unmount();
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('should not run the handler on re-render', () => {
    const handler = vi.fn();
    const { rerender, unmount } = renderHook(() => useOnUnmountLayout(handler));

    rerender();
    expect(handler).not.toHaveBeenCalled();

    unmount();
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('should run the most recently provided handler on unmount', () => {
    const first = vi.fn();
    const second = vi.fn();
    const { rerender, unmount } = renderHook(
      ({ handler }) => useOnUnmountLayout(handler),
      { initialProps: { handler: first } },
    );

    rerender({ handler: second });
    unmount();

    expect(first).not.toHaveBeenCalled();
    expect(second).toHaveBeenCalledTimes(1);
  });
});
