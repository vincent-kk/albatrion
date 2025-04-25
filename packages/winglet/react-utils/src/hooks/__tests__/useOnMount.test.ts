import { renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { useOnMount, useOnMountLayout } from '../useOnMount';

describe('useOnMount', () => {
  it('마운트 시에만 핸들러를 실행해야 합니다', () => {
    const handler = vi.fn();
    const { rerender } = renderHook(() => useOnMount(handler));

    expect(handler).toHaveBeenCalledTimes(1);

    // 리렌더링 시에는 핸들러가 실행되지 않아야 합니다
    rerender();
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('핸들러가 cleanup 함수를 반환하면 언마운트 시 실행해야 합니다', () => {
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
  it('마운트 시에만 핸들러를 실행해야 합니다', () => {
    const handler = vi.fn();
    const { rerender } = renderHook(() => useOnMountLayout(handler));

    expect(handler).toHaveBeenCalledTimes(1);

    // 리렌더링 시에는 핸들러가 실행되지 않아야 합니다
    rerender();
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('핸들러가 cleanup 함수를 반환하면 언마운트 시 실행해야 합니다', () => {
    const cleanup = vi.fn();
    const handler = vi.fn().mockReturnValue(cleanup);
    const { unmount } = renderHook(() => useOnMountLayout(handler));

    expect(handler).toHaveBeenCalledTimes(1);
    expect(cleanup).not.toHaveBeenCalled();

    unmount();
    expect(cleanup).toHaveBeenCalledTimes(1);
  });
});
