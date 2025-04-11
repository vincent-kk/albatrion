import { renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { useMemorize } from '../useMemorize';

describe('useMemorize', () => {
  it('입력값을 메모이제이션해야 합니다', () => {
    const input = { value: 'test' };
    const { result, rerender } = renderHook(({ value }) => useMemorize(value), {
      initialProps: { value: input },
    });

    const firstResult = result.current;
    expect(firstResult).toBe(input);

    // 같은 입력값으로 다시 렌더링해도 같은 참조를 반환해야 합니다
    rerender({ value: input });
    expect(result.current).toBe(firstResult);
  });

  it('useMemoize는 최초에 입력된 값을 저장하며, 이후 변화를 반영하지 않습니다.', () => {
    const input1 = { value: 'test1' };
    const input2 = { value: 'test2' };
    const { result, rerender } = renderHook(({ value }) => useMemorize(value), {
      initialProps: { value: input1 },
    });

    const firstResult = result.current;
    expect(firstResult).toBe(input1);

    // 다른 입력값으로 렌더링하면 다른 참조를 반환해야 합니다
    rerender({ value: input2 });
    expect(result.current).toBe(firstResult);
    expect(result.current).not.toBe(input2);
  });

  it('객체와 같은 복잡한 타입도 메모이제이션해야 합니다', () => {
    const input = { nested: { value: 'test' } };
    const { result, rerender } = renderHook(({ value }) => useMemorize(value), {
      initialProps: { value: input },
    });

    const firstResult = result.current;
    expect(firstResult).toBe(input);

    // 같은 객체로 다시 렌더링해도 같은 참조를 반환해야 합니다
    rerender({ value: input });
    expect(result.current).toBe(firstResult);
  });
});
