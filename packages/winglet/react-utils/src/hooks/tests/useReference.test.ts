import { renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { useReference } from '../useReference';

describe('useReference', () => {
  it('초기값을 current 속성에 저장해야 합니다', () => {
    const initialValue = { value: 'test' };
    const { result } = renderHook(() => useReference(initialValue));

    expect(result.current.current).toBe(initialValue);
  });

  it('값이 변경되면 current 속성이 업데이트되어야 합니다', () => {
    const initialValue = { value: 'test1' };
    const newValue = { value: 'test2' };
    const { result, rerender } = renderHook(
      ({ value }) => useReference(value),
      {
        initialProps: { value: initialValue },
      },
    );

    expect(result.current.current).toBe(initialValue);

    rerender({ value: newValue });
    expect(result.current.current).toBe(newValue);
  });

  it('객체와 같은 복잡한 타입도 참조를 유지해야 합니다', () => {
    const initialValue = { nested: { value: 'test' } };
    const { result, rerender } = renderHook(
      ({ value }) => useReference(value),
      {
        initialProps: { value: initialValue },
      },
    );

    expect(result.current.current).toBe(initialValue);

    // 같은 객체로 다시 렌더링해도 같은 참조를 유지해야 합니다
    rerender({ value: initialValue });
    expect(result.current.current).toBe(initialValue);
  });
});
