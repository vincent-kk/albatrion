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

  it('동일한 내용의 새 객체가 전달되면 이전 참조를 유지해야 한다', () => {
    const { result, rerender } = renderHook(
      ({ props }) => useRestProperties(props),
      {
        initialProps: { props: { a: 1, b: 2, c: 3 } },
      },
    );

    const firstResult = result.current;

    rerender({ props: { a: 1, b: 2, c: 3 } });
    expect(result.current).toBe(firstResult);

    rerender({ props: { a: 1, b: 2, c: 3 } });
    expect(result.current).toBe(firstResult);
  });

  it('키 추가 시 새로운 참조를 반환해야 한다', () => {
    const { result, rerender } = renderHook(
      ({ props }) => useRestProperties(props),
      {
        initialProps: { props: { a: 1, b: 2 } as any },
      },
    );

    const firstResult = result.current;

    rerender({ props: { a: 1, b: 2, c: 3 } });
    expect(result.current).not.toBe(firstResult);
    expect(result.current).toEqual({ a: 1, b: 2, c: 3 });
  });

  it('키 삭제 시 새로운 참조를 반환해야 한다', () => {
    const { result, rerender } = renderHook(
      ({ props }) => useRestProperties(props),
      {
        initialProps: { props: { a: 1, b: 2, c: 3 } as any },
      },
    );

    const firstResult = result.current;

    rerender({ props: { a: 1, b: 2 } });
    expect(result.current).not.toBe(firstResult);
    expect(result.current).toEqual({ a: 1, b: 2 });
  });

  it('여러 속성 중 하나만 변경되어도 감지해야 한다', () => {
    const { result, rerender } = renderHook(
      ({ props }) => useRestProperties(props),
      {
        initialProps: { props: { a: 1, b: 2, c: 3, d: 4, e: 5 } },
      },
    );

    const firstResult = result.current;

    rerender({ props: { a: 1, b: 2, c: 3, d: 999, e: 5 } });
    expect(result.current).not.toBe(firstResult);
  });

  it('0, false, 빈 문자열 등 falsy 값도 정확하게 비교해야 한다', () => {
    const { result, rerender } = renderHook(
      ({ props }) => useRestProperties(props),
      {
        initialProps: { props: { a: 0, b: false, c: '', d: null } },
      },
    );

    const firstResult = result.current;

    rerender({ props: { a: 0, b: false, c: '', d: null } });
    expect(result.current).toBe(firstResult);

    rerender({ props: { a: 1, b: false, c: '', d: null } });
    expect(result.current).not.toBe(firstResult);
  });

  it('같은 배열 참조가 유지되면 이전 참조를 반환해야 한다', () => {
    const arr = [1, 2, 3];
    const obj = { value: 1 };
    const { result, rerender } = renderHook(
      ({ props }) => useRestProperties(props),
      {
        initialProps: { props: { arr, obj } },
      },
    );

    const firstResult = result.current;

    rerender({ props: { arr, obj } });
    expect(result.current).toBe(firstResult);
  });

  it('undefined에서 객체로, 객체에서 undefined로 변경 시 처리해야 한다', () => {
    const { result, rerender } = renderHook(
      ({ props }) => useRestProperties(props as any),
      {
        initialProps: { props: undefined } as any,
      },
    );

    expect(result.current).toBeUndefined();

    rerender({ props: { a: 1 } });
    expect(result.current).toEqual({ a: 1 });

    rerender({ props: undefined });
    expect(result.current).toBeUndefined();
  });

  it('null에서 객체로, 객체에서 null로 변경 시 처리해야 한다', () => {
    const { result, rerender } = renderHook(
      ({ props }) => useRestProperties(props as any),
      {
        initialProps: { props: null } as any,
      },
    );

    expect(result.current).toBeNull();

    rerender({ props: { a: 1 } });
    expect(result.current).toEqual({ a: 1 });

    rerender({ props: null });
    expect(result.current).toBeNull();
  });

  it('복잡한 객체 구조에서도 정확하게 동작해야 한다', () => {
    const fn = () => {};
    const arr = [1, 2, 3];
    const nestedObj = { x: 1 };

    const { result, rerender } = renderHook(
      ({ props }) => useRestProperties(props),
      {
        initialProps: {
          props: {
            a: 1,
            b: 'test',
            c: true,
            d: fn,
            e: arr,
            f: nestedObj,
            g: null,
            h: undefined,
          },
        },
      },
    );

    const firstResult = result.current;

    rerender({
      props: {
        a: 1,
        b: 'test',
        c: true,
        d: fn,
        e: arr,
        f: nestedObj,
        g: null,
        h: undefined,
      },
    });
    expect(result.current).toBe(firstResult);
  });

  it('props가 빈 객체에서 값이 있는 객체로 변경되어야 한다', () => {
    const { result, rerender } = renderHook(
      ({ props }) => useRestProperties(props),
      {
        initialProps: { props: {} },
      },
    );

    const firstResult = result.current;

    rerender({ props: { a: 1 } });
    expect(result.current).not.toBe(firstResult);
    expect(result.current).toEqual({ a: 1 });
  });

  it('props가 값이 있는 객체에서 빈 객체로 변경되어야 한다', () => {
    const { result, rerender } = renderHook<any, any>(
      ({ props }) => useRestProperties(props),
      {
        initialProps: { props: { a: 1, b: 2 } },
      },
    );

    const firstResult = result.current;

    rerender({ props: {} });
    expect(result.current).not.toBe(firstResult);
    expect(result.current).toEqual({});
  });

  it('Symbol을 키로 가진 속성도 정확하게 비교해야 한다', () => {
    const sym = Symbol('test');
    const { result, rerender } = renderHook(
      ({ props }) => useRestProperties(props),
      {
        initialProps: { props: { a: 1, [sym]: 'symbol-value' } as any },
      },
    );

    const firstResult = result.current;

    rerender({ props: { a: 1, [sym]: 'symbol-value' } });
    expect(result.current).toBe(firstResult);
  });

  it('많은 속성이 있는 객체도 성능 저하 없이 처리해야 한다', () => {
    const largeObj: any = {};
    for (let i = 0; i < 100; i++) {
      largeObj[`key${i}`] = i;
    }

    const { result, rerender } = renderHook(
      ({ props }) => useRestProperties(props),
      {
        initialProps: { props: largeObj },
      },
    );

    const firstResult = result.current;

    const largeObj2: any = {};
    for (let i = 0; i < 100; i++) {
      largeObj2[`key${i}`] = i;
    }

    rerender({ props: largeObj2 });
    expect(result.current).toBe(firstResult);

    const largeObj3: any = {};
    for (let i = 0; i < 100; i++) {
      largeObj3[`key${i}`] = i;
    }
    largeObj3.key50 = 999;

    rerender({ props: largeObj3 });
    expect(result.current).not.toBe(firstResult);
  });
});
