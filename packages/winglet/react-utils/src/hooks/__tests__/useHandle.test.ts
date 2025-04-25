import { renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { useHandle } from '../useHandle';

describe('useHandle', () => {
  it('함수가 제공되지 않으면 null을 반환하는 함수를 반환해야 합니다', () => {
    const { result } = renderHook(() => useHandle());
    expect(result.current()).toBeNull();
  });

  it('제공된 함수의 주소값을 반환하지만, 함수 자체가 메모이제이션되지 않습니다', () => {
    const handler = vi.fn().mockReturnValue('test');
    const { result } = renderHook(() => useHandle(handler));

    expect(result.current()).toBe('test');
    expect(handler).toHaveBeenCalledTimes(1);

    // 같은 인스턴스에서 다시 호출해도 함수는 메모이제이션되지 않습니다
    result.current();
    expect(handler).toHaveBeenCalledTimes(2);
  });

  it('함수에 인자를 전달할 수 있어야 합니다', () => {
    const handler = vi.fn().mockImplementation((a: number, b: number) => a + b);
    const { result } = renderHook(() => useHandle(handler));

    expect(result.current(1, 2)).toBe(3);
    expect(handler).toHaveBeenCalledWith(1, 2);
  });

  it('함수가 변경되어도 동일한 함수를 반환해야 합니다', () => {
    const handler1 = vi.fn().mockReturnValue('test1');
    const { result, rerender } = renderHook(
      ({ handler }) => useHandle(handler),
      {
        initialProps: { handler: handler1 },
      },
    );

    expect(result.current()).toBe('test1');

    const handler2 = vi.fn().mockReturnValue('test2');
    rerender({ handler: handler2 });

    expect(result.current()).toBe('test2');
    expect(handler1).toHaveBeenCalled();
    expect(handler2).toHaveBeenCalledTimes(1);
  });
});
