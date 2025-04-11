import { renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { useSnapshot, useSnapshotReference } from '../useSnapshot';

describe('useSnapshot', () => {
  it('객체의 스냅샷을 반환해야 합니다', () => {
    const object = { value: 'test' };
    const { result } = renderHook(() => useSnapshot(object));

    expect(result.current).toBe(object);
  });

  it('객체가 변경되면 새로운 스냅샷을 반환해야 합니다', () => {
    const object1 = { value: 'test1' };
    const object2 = { value: 'test2' };
    const { result, rerender } = renderHook(({ value }) => useSnapshot(value), {
      initialProps: { value: object1 },
    });

    expect(result.current).toBe(object1);

    rerender({ value: object2 });
    expect(result.current).toBe(object2);
  });

  it('omit 옵션을 통해 특정 속성을 제외할 수 있어야 합니다', () => {
    const object = { value: 'test', excluded: 'excluded' };
    const { result } = renderHook(() => useSnapshot(object, ['excluded']));

    expect(result.current).toBe(object);
  });
});

describe('useSnapshotReference', () => {
  it('객체의 스냅샷 참조를 반환해야 합니다', () => {
    const object = { value: 'test' };
    const { result } = renderHook(() => useSnapshotReference(object));

    expect(result.current.current).toBe(object);
  });

  it('객체가 변경되면 새로운 스냅샷 참조를 반환해야 합니다', () => {
    const object1 = { value: 'test1' };
    const object2 = { value: 'test2' };
    const { result, rerender } = renderHook(
      ({ value }) => useSnapshotReference(value),
      {
        initialProps: { value: object1 },
      },
    );

    expect(result.current.current).toBe(object1);

    rerender({ value: object2 });
    expect(result.current.current).toBe(object2);
  });

  it('omit 옵션을 통해 특정 속성을 제외할 수 있어야 합니다', () => {
    const object = { value: 'test', excluded: 'excluded' };
    const { result } = renderHook(() =>
      useSnapshotReference(object, ['excluded']),
    );

    expect(result.current.current).toBe(object);
  });

  it('같은 객체로 다시 렌더링해도 같은 참조를 유지해야 합니다', () => {
    const object = { value: 'test' };
    const { result, rerender } = renderHook(
      ({ value }) => useSnapshotReference(value),
      {
        initialProps: { value: object },
      },
    );

    const firstRef = result.current;
    expect(firstRef.current).toBe(object);

    rerender({ value: object });
    expect(result.current).toBe(firstRef);
    expect(result.current.current).toBe(object);
  });
});
