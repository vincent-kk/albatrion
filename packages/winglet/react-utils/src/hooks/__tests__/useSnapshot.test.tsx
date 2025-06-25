import { renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { useSnapshot } from '../useSnapshot';
import { useSnapshotReference } from '../useSnapshotReference';

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

describe('useSnapshot 및 useSnapshotReference 훅 테스트', () => {
  describe('useSnapshotReference', () => {
    it('동일한 객체에 대해 동일한 참조를 반환해야 함', () => {
      const obj = { a: 1, b: 2 };
      const { result, rerender } = renderHook(() => useSnapshotReference(obj));

      const firstRef = result.current;
      rerender();
      const secondRef = result.current;

      expect(firstRef).toBe(secondRef);
    });

    it('객체 내용이 변경되면 새로운 참조를 반환해야 함', () => {
      const { result, rerender } = renderHook(
        ({ obj }) => useSnapshotReference(obj),
        { initialProps: { obj: { a: 1, b: 2 } } },
      );

      const first = result.current.current;
      rerender({ obj: { a: 1, b: 3 } }); // b 값 변경
      const second = result.current.current;

      expect(first).not.toBe(second);
    });

    it('빈 객체에서 다른 빈 객체로 변경 시 동일한 참조를 반환해야 함', () => {
      const { result, rerender } = renderHook(
        ({ obj }) => useSnapshotReference(obj),
        { initialProps: { obj: {} } },
      );

      const first = result.current.current;
      rerender({ obj: {} }); // 새로운 빈 객체
      const second = result.current.current;

      expect(first).toBe(second);
    });

    it('빈 객체에서 빈 배열로 변경 시 새로운 참조를 반환해야 함', () => {
      const { result, rerender } = renderHook(
        ({ obj }) => useSnapshotReference(obj as any),
        { initialProps: { obj: {} } },
      );

      const first = result.current.current;
      rerender({ obj: [] }); // 빈 객체에서 빈 배열로 변경
      const second = result.current.current;

      expect(first).not.toBe(second);
    });

    it('배열에서 다른 내용의 배열로 변경 시 새로운 참조를 반환해야 함', () => {
      const { result, rerender } = renderHook(
        ({ arr }) => useSnapshotReference(arr),
        { initialProps: { arr: [1, 2, 3] } },
      );

      const first = result.current.current;
      rerender({ arr: [1, 2, 4] }); // 배열 내용 변경
      const second = result.current.current;

      expect(first).not.toBe(second);
    });

    it('omit 옵션으로 특정 속성을 제외하고 비교할 수 있어야 함', () => {
      const testObj = { a: 1, b: 2, c: 3 };
      type TestObjKey = keyof typeof testObj;

      const { result, rerender } = renderHook(
        ({ obj, omit }) => useSnapshotReference(obj, omit),
        { initialProps: { obj: testObj, omit: ['c' as TestObjKey] } },
      );

      const first = result.current.current;
      // c 속성만 변경
      rerender({ obj: { a: 1, b: 2, c: 4 }, omit: ['c' as TestObjKey] });
      const second = result.current.current;

      // c는 제외됐으므로 동일한 참조여야 함
      expect(first).toBe(second);

      // 제외되지 않은 속성이 변경되면 다른 참조여야 함
      rerender({ obj: { a: 5, b: 2, c: 4 }, omit: ['c' as TestObjKey] });
      const third = result.current.current;

      expect(first).not.toBe(third);
    });
  });

  describe('useSnapshot', () => {
    it('동일한 객체에 대해 동일한 값을 반환해야 함', () => {
      const obj = { a: 1, b: 2 };
      const { result, rerender } = renderHook(() => useSnapshot(obj));

      const firstValue = result.current;
      rerender();
      const secondValue = result.current;

      expect(firstValue).toBe(secondValue);
    });

    it('빈 객체에서 빈 배열로 변경 시 새로운 값을 반환해야 함', () => {
      const { result, rerender } = renderHook(
        ({ obj }) => useSnapshot(obj as any),
        { initialProps: { obj: {} } },
      );

      const firstValue = result.current;
      rerender({ obj: [] });
      const secondValue = result.current;

      expect(firstValue).not.toBe(secondValue);
    });
  });
});
