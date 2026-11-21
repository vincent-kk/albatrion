import { renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { useOnUnmount, useRestProperties } from '../../index';

describe('periphery react-utils probes', () => {
  it('useOnUnmount handler is captured at mount, as SPECIFICATION documents', () => {
    const seen: number[] = [];
    const { rerender, unmount } = renderHook(
      ({ count }) => useOnUnmount(() => seen.push(count)),
      { initialProps: { count: 1 } },
    );
    rerender({ count: 2 });
    unmount();
    // docs/en/SPECIFICATION.md: "Captured at mount time (stale closure)."
    expect(seen).toEqual([1]);
  });

  it('useRestProperties does not return a previous object with different keys', () => {
    const { result, rerender } = renderHook(
      ({ props }) => useRestProperties(props),
      {
        initialProps: {
          props: { a: 1, c: undefined } as Record<string, unknown>,
        },
      },
    );
    const next = { a: 1, b: undefined } as Record<string, unknown>;
    rerender({ props: next });
    expect(Object.keys(result.current)).toEqual(['a', 'b']);
  });
});
