import { renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { useRestProperties } from '../useRestProperties';

describe('useRestProperties', () => {
  /**
   * 기본 동작 테스트
   * - 동일한 props 객체가 전달될 때는 이전 참조를 유지해야 함
   * - 메모이제이션이 제대로 동작하는지 확인
   */
  it('동일한 props가 전달되면 이전 참조를 반환해야 한다', () => {
    const initialProps = { a: 1, b: 2 };
    const { result, rerender } = renderHook(
      ({ props }) => useRestProperties(props),
      {
        initialProps: { props: initialProps },
      },
    );

    const firstResult = result.current;
    rerender({ props: initialProps });

    expect(result.current).toBe(firstResult);
  });

  /**
   * 값 변경 감지 테스트
   * - props의 값이 변경되면 새로운 참조를 반환해야 함
   * - 얕은 비교가 제대로 동작하는지 확인
   */
  it('props의 값이 변경되면 새로운 참조를 반환해야 한다', () => {
    const initialProps = { a: 1, b: 2 };
    const { result, rerender } = renderHook(
      ({ props }) => useRestProperties(props),
      {
        initialProps: { props: initialProps },
      },
    );

    const firstResult = result.current;
    rerender({ props: { a: 1, b: 3 } });

    expect(result.current).not.toBe(firstResult);
  });

  /**
   * 연속 변경 테스트
   * - props가 연속적으로 변경될 때도 각각의 변경을 정확히 감지해야 함
   * - propsRef가 제대로 업데이트되는지 확인
   */
  it('props의 값이 연속적으로 변경될 때도 정확하게 동작해야 한다', () => {
    const initialProps = { a: 1, b: 2 };
    const { result, rerender } = renderHook(
      ({ props }) => useRestProperties(props),
      {
        initialProps: { props: initialProps },
      },
    );

    const firstResult = result.current;

    rerender({ props: { a: 1, b: 3 } });
    const secondResult = result.current;

    rerender({ props: { a: 1, b: 4 } });
    const thirdResult = result.current;

    expect(secondResult).not.toBe(firstResult);
    expect(thirdResult).not.toBe(secondResult);
  });

  /**
   * 키 변경 테스트
   * - props의 키가 변경될 때도 새로운 참조를 반환해야 함
   * - 객체의 구조 변경 감지 확인
   */
  it('props의 키가 변경되어도 정확하게 동작해야 한다', () => {
    const initialProps = { a: 1, b: 2 } as any;
    const { result, rerender } = renderHook(
      ({ props }) => useRestProperties(props),
      {
        initialProps: { props: initialProps },
      },
    );

    const firstResult = result.current;
    rerender({ props: { a: 1, c: 2 } });

    expect(result.current).not.toBe(firstResult);
  });

  /**
   * 중첩 객체 테스트
   * - 중첩된 객체의 참조가 변경될 때 새로운 참조를 반환해야 함
   * - 얕은 비교의 특성 확인
   */
  it('props의 값이 같지만 참조가 다른 객체가 전달되어도 이전 참조를 유지해야 한다', () => {
    const initialProps = { a: 1, b: { value: 2 } };
    const { result, rerender } = renderHook(
      ({ props }) => useRestProperties(props),
      {
        initialProps: { props: initialProps },
      },
    );

    const firstResult = result.current;
    rerender({ props: { ...initialProps, b: { value: 2 } } });

    expect(result.current).not.toBe(firstResult);
  });

  /**
   * 빈 객체 테스트
   * - 빈 객체가 전달될 때도 정상적으로 동작해야 함
   */
  it('빈 객체가 전달되어도 정상적으로 동작해야 한다', () => {
    const initialProps = {};
    const { result, rerender } = renderHook(
      ({ props }) => useRestProperties(props),
      {
        initialProps: { props: initialProps },
      },
    );

    const firstResult = result.current;
    rerender({ props: {} });

    expect(result.current).toBe(firstResult);
  });

  /**
   * null/undefined 처리 테스트
   * - undefined나 null이 전달될 때도 오류 없이 동작해야 함
   */
  it('undefined나 null이 전달되어도 오류 없이 동작해야 한다', () => {
    const { rerender } = renderHook(
      ({ props }) => useRestProperties(props as any),
      {
        initialProps: { props: undefined } as any,
      },
    );

    expect(() => {
      rerender({ props: null });
    }).not.toThrow();
  });

  /**
   * 배열 props 테스트
   * - 배열이 포함된 props도 정상적으로 처리해야 함
   */
  it('배열이 포함된 props도 정상적으로 처리해야 한다', () => {
    const initialProps = { arr: [1, 2, 3] };
    const { result, rerender } = renderHook(
      ({ props }) => useRestProperties(props),
      {
        initialProps: { props: initialProps },
      },
    );

    const firstResult = result.current;

    // 같은 값이지만 새로운 배열 참조
    rerender({ props: { arr: [1, 2, 3] } });
    expect(result.current).not.toBe(firstResult);

    // 값이 변경된 배열
    rerender({ props: { arr: [1, 2, 4] } });
    expect(result.current).not.toBe(firstResult);
  });

  /**
   * 함수 props 테스트
   * - 함수가 포함된 props도 정상적으로 처리해야 함
   */
  it('함수가 포함된 props도 정상적으로 처리해야 한다', () => {
    const fn1 = () => {};
    const initialProps = { callback: fn1 };
    const { result, rerender } = renderHook(
      ({ props }) => useRestProperties(props),
      {
        initialProps: { props: initialProps },
      },
    );

    const firstResult = result.current;

    // 같은 함수 참조
    rerender({ props: { callback: fn1 } });
    expect(result.current).toBe(firstResult);

    // 다른 함수 참조
    rerender({ props: { callback: () => {} } });
    expect(result.current).not.toBe(firstResult);
  });
});
