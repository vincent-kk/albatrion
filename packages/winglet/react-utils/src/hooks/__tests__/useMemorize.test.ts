import { renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { useMemorize } from '../useMemorize';

describe('useMemorize', () => {
  it('should memoize the input value', () => {
    const input = { value: 'test' };
    const { result, rerender } = renderHook(({ value }) => useMemorize(value), {
      initialProps: { value: input },
    });

    const firstResult = result.current;
    expect(firstResult).toBe(input);

    // should return the same reference even when re-rendered with the same input value
    rerender({ value: input });
    expect(result.current).toBe(firstResult);
  });

  it('useMemoize keeps the value given on the first render and does not reflect later changes.', () => {
    const input1 = { value: 'test1' };
    const input2 = { value: 'test2' };
    const { result, rerender } = renderHook(({ value }) => useMemorize(value), {
      initialProps: { value: input1 },
    });

    const firstResult = result.current;
    expect(firstResult).toBe(input1);

    // should return a different reference when re-rendered with a different input value
    rerender({ value: input2 });
    expect(result.current).toBe(firstResult);
    expect(result.current).not.toBe(input2);
  });

  it('should memoize complex types such as objects', () => {
    const input = { nested: { value: 'test' } };
    const { result, rerender } = renderHook(({ value }) => useMemorize(value), {
      initialProps: { value: input },
    });

    const firstResult = result.current;
    expect(firstResult).toBe(input);

    // should return the same reference even when re-rendered with the same object
    rerender({ value: input });
    expect(result.current).toBe(firstResult);
  });

  it('should memoize even when a function is given as the input', () => {
    const target = { value: 'test' };
    const input = () => target;
    const { result, rerender } = renderHook(() => useMemorize(input));

    const firstResult = result.current;
    expect(firstResult).toBe(target);

    // should return the same reference even when re-rendered with the same function
    rerender();
    expect(result.current).toBe(firstResult);
  });

  it('useMemorize should accept a dependency array and memoize accordingly', () => {
    let dependency = 'dep1';

    const { result, rerender } = renderHook(
      ({ dep }) => useMemorize(() => ({ value: `computed-${dep}` }), [dep]),
      { initialProps: { dep: dependency } },
    );

    const firstResult = result.current;
    expect(firstResult.value).toBe('computed-dep1');

    // should not recompute and should return the same reference when the dependencies are unchanged
    rerender({ dep: dependency });
    expect(result.current).toBe(firstResult);

    // should recompute when the dependencies change
    dependency = 'dep2';
    rerender({ dep: dependency });
    expect(result.current).not.toBe(firstResult);
    expect(result.current.value).toBe('computed-dep2');

    const secondResult = result.current;

    // should not recompute when the dependencies become the same again
    rerender({ dep: dependency });
    expect(result.current).toBe(secondResult);
  });

  it('useMemorize should be able to handle multiple dependencies', () => {
    let dep1 = 'a';
    let dep2 = 1;

    const { result, rerender } = renderHook(
      ({ d1, d2 }) =>
        useMemorize(() => ({ combined: `${d1}-${d2}` }), [d1, d2]),
      { initialProps: { d1: dep1, d2: dep2 } },
    );

    const firstResult = result.current;
    expect(firstResult.combined).toBe('a-1');

    // change only the first dependency
    dep1 = 'b';
    rerender({ d1: dep1, d2: dep2 });
    expect(result.current).not.toBe(firstResult);
    expect(result.current.combined).toBe('b-1');

    const secondResult = result.current;

    // change only the second dependency
    dep2 = 2;
    rerender({ d1: dep1, d2: dep2 });
    expect(result.current).not.toBe(secondResult);
    expect(result.current.combined).toBe('b-2');

    const thirdResult = result.current;

    // no dependency change
    rerender({ d1: dep1, d2: dep2 });
    expect(result.current).toBe(thirdResult);
  });

  it('useMemorize should compute only once at first when the dependency array is empty', () => {
    let counter = 0;
    const factory = () => {
      counter++;
      return { id: counter };
    };

    const { result, rerender } = renderHook(() => useMemorize(factory, []));

    const firstResult = result.current;
    expect(firstResult.id).toBe(1);
    expect(counter).toBe(1);

    // should not recompute on re-render
    rerender();
    expect(result.current).toBe(firstResult);
    expect(counter).toBe(1); // should still be 1

    rerender();
    expect(result.current).toBe(firstResult);
    expect(counter).toBe(1); // should still be 1
  });
});
