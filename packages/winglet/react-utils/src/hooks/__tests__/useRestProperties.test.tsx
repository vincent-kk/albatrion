import { renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { useRestProperties } from '../useRestProperties';

describe('useRestProperties', () => {
  /**
   * Basic behavior test
   * - Should keep the previous reference when the same props object is passed
   * - Verifies that memoization works correctly
   */
  it('should return the previous reference when the same props are passed', () => {
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
   * Value change detection test
   * - Should return a new reference when a props value changes
   * - Verifies that shallow comparison works correctly
   */
  it('should return a new reference when a props value changes', () => {
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
   * Consecutive change test
   * - Should accurately detect every change even when props change consecutively
   * - Verifies that propsRef is updated correctly
   */
  it('should work accurately even when props values change consecutively', () => {
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
   * Key change test
   * - Should return a new reference when a props key changes
   * - Verifies detection of a change in the object's structure
   */
  it('should work accurately even when a props key changes', () => {
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
   * Nested object test
   * - Should return a new reference when a nested object's reference changes
   * - Verifies the characteristics of shallow comparison
   */
  it('should keep the previous reference even when an object with equal props values but a different reference is passed', () => {
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
   * Empty object test
   * - Should work correctly even when an empty object is passed
   */
  it('should work correctly even when an empty object is passed', () => {
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
   * null/undefined handling test
   * - Should work without errors even when undefined or null is passed
   */
  it('should work without errors even when undefined or null is passed', () => {
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
   * Array props test
   * - Should correctly handle props that contain an array
   */
  it('should correctly handle props that contain an array', () => {
    const initialProps = { arr: [1, 2, 3] };
    const { result, rerender } = renderHook(
      ({ props }) => useRestProperties(props),
      {
        initialProps: { props: initialProps },
      },
    );

    const firstResult = result.current;

    // Same values but a new array reference
    rerender({ props: { arr: [1, 2, 3] } });
    expect(result.current).not.toBe(firstResult);

    // Array with a changed value
    rerender({ props: { arr: [1, 2, 4] } });
    expect(result.current).not.toBe(firstResult);
  });

  /**
   * Function props test
   * - Should correctly handle props that contain a function
   */
  it('should correctly handle props that contain a function', () => {
    const fn1 = () => {};
    const initialProps = { callback: fn1 };
    const { result, rerender } = renderHook(
      ({ props }) => useRestProperties(props),
      {
        initialProps: { props: initialProps },
      },
    );

    const firstResult = result.current;

    // Same function reference
    rerender({ props: { callback: fn1 } });
    expect(result.current).toBe(firstResult);

    // Different function reference
    rerender({ props: { callback: () => {} } });
    expect(result.current).not.toBe(firstResult);
  });

  it('should keep the previous reference when a new object with the same content is passed', () => {
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

  it('should return a new reference when a key is added', () => {
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

  it('should return a new reference when a key is removed', () => {
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

  it('should detect the change even when only one of several properties changes', () => {
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

  it('should accurately compare falsy values such as 0, false, and an empty string', () => {
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

  it('should return the previous reference when the same array reference is kept', () => {
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

  it('should handle a change from undefined to an object and from an object to undefined', () => {
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

  it('should handle a change from null to an object and from an object to null', () => {
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

  it('should work accurately even with a complex object structure', () => {
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

  it('should handle props changing from an empty object to an object with values', () => {
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

  it('should handle props changing from an object with values to an empty object', () => {
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

  it('should accurately compare a property that has a Symbol as its key', () => {
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

  it('should handle an object with many properties without performance degradation', () => {
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

  /**
   * Comparison gating test
   * - a repeated props reference must not be walked again
   * - the shallow comparison costs at most one pass per distinct reference
   */
  it('should not repeat the shallow comparison while the props identity is unchanged', () => {
    let propertyReads = 0;
    const first = {
      get a() {
        propertyReads++;
        return 1;
      },
    };
    const second = {
      get a() {
        propertyReads++;
        return 1;
      },
    };

    const { rerender } = renderHook(({ props }) => useRestProperties(props), {
      initialProps: { props: first },
    });

    rerender({ props: second });
    const readsAfterFirstComparison = propertyReads;
    expect(readsAfterFirstComparison).toBeGreaterThan(0);

    rerender({ props: second });
    rerender({ props: second });

    expect(propertyReads).toBe(readsAfterFirstComparison);
  });
});
