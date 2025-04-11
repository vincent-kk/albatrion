import { renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { useOnUnmount, useOnUnmountLayout } from '../useOnUnmount';

describe('useOnUnmount', () => {
  it('언마운트 시에만 핸들러를 실행해야 합니다', () => {
    const handler = vi.fn();
    const { unmount } = renderHook(() => useOnUnmount(handler));

    expect(handler).not.toHaveBeenCalled();

    unmount();
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('리렌더링 시에는 핸들러가 실행되지 않아야 합니다', () => {
    const handler = vi.fn();
    const { rerender, unmount } = renderHook(() => useOnUnmount(handler));

    rerender();
    expect(handler).not.toHaveBeenCalled();

    unmount();
    expect(handler).toHaveBeenCalledTimes(1);
  });
});

describe('useOnUnmountLayout', () => {
  it('언마운트 시에만 핸들러를 실행해야 합니다', () => {
    const handler = vi.fn();
    const { unmount } = renderHook(() => useOnUnmountLayout(handler));

    expect(handler).not.toHaveBeenCalled();

    unmount();
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('리렌더링 시에는 핸들러가 실행되지 않아야 합니다', () => {
    const handler = vi.fn();
    const { rerender, unmount } = renderHook(() => useOnUnmountLayout(handler));

    rerender();
    expect(handler).not.toHaveBeenCalled();

    unmount();
    expect(handler).toHaveBeenCalledTimes(1);
  });
});
