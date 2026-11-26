import { renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { useRestProperties } from '../useRestProperties';

describe('useRestProperties own keys', () => {
  it('should return the new object when an incoming key is only inherited by the previous object', () => {
    const previous = Object.assign(Object.create({ inherited: 1 }), {
      other: 1,
    }) as Record<string, unknown>;
    const { result, rerender } = renderHook(
      ({ props }) => useRestProperties(props),
      { initialProps: { props: previous } },
    );

    const next: Record<string, unknown> = { inherited: 1 };
    rerender({ props: next });

    expect(result.current).toBe(next);
  });

  it('should return the new object when an incoming key matches a member of Object.prototype', () => {
    const { result, rerender } = renderHook(
      ({ props }) => useRestProperties(props),
      { initialProps: { props: { a: 1 } as Record<string, unknown> } },
    );

    const next: Record<string, unknown> = { constructor: Object };
    rerender({ props: next });

    expect(result.current).toBe(next);
  });

  it('should return the new object when a getter reads undefined first and a value afterwards', () => {
    const { result, rerender } = renderHook(
      ({ props }) => useRestProperties(props),
      { initialProps: { props: { b: undefined } as Record<string, unknown> } },
    );

    let reads = 0;
    const next: Record<string, unknown> = {
      get a() {
        return reads++ === 0 ? undefined : 1;
      },
    };
    rerender({ props: next });

    expect(result.current).toBe(next);
  });

  it('should not count an own non-enumerable key of the previous object as a match', () => {
    const previous: Record<string, unknown> = { y: 2 };
    Object.defineProperty(previous, 'x', { value: 1, enumerable: false });
    const { result, rerender } = renderHook(
      ({ props }) => useRestProperties(props),
      { initialProps: { props: previous } },
    );

    const next: Record<string, unknown> = { x: 1 };
    rerender({ props: next });

    expect(result.current).toBe(next);
  });

  it('should keep the previous object when the same keys arrive in a different order', () => {
    const { result, rerender } = renderHook(
      ({ props }) => useRestProperties(props),
      { initialProps: { props: { a: 1, b: 2 } as Record<string, unknown> } },
    );
    const first = result.current;

    rerender({ props: { b: 2, a: 1 } });

    expect(result.current).toBe(first);
  });
});
