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

  it('함수를 입력으로 받아도 메모이제이션해야 합니다', () => {
    const target = { value: 'test' };
    const input = () => target;
    const { result, rerender } = renderHook(() => useMemorize(input));

    const firstResult = result.current;
    expect(firstResult).toBe(target);

    // 같은 함수로 다시 렌더링해도 같은 참조를 반환해야 합니다
    rerender();
    expect(result.current).toBe(firstResult);
  });

  it('useMemorize는 의존성 배열을 받아 메모이제이션해야 합니다', () => {
    let dependency = 'dep1';

    const { result, rerender } = renderHook(
      ({ dep }) => useMemorize(() => ({ value: `computed-${dep}` }), [dep]),
      { initialProps: { dep: dependency } },
    );

    const firstResult = result.current;
    expect(firstResult.value).toBe('computed-dep1');

    // 의존성이 같으면 재계산하지 않고 같은 참조를 반환해야 합니다
    rerender({ dep: dependency });
    expect(result.current).toBe(firstResult);

    // 의존성이 변경되면 재계산해야 합니다
    dependency = 'dep2';
    rerender({ dep: dependency });
    expect(result.current).not.toBe(firstResult);
    expect(result.current.value).toBe('computed-dep2');

    const secondResult = result.current;

    // 의존성이 다시 같아지면 재계산하지 않아야 합니다
    rerender({ dep: dependency });
    expect(result.current).toBe(secondResult);
  });

  it('useMemorize는 여러 의존성을 처리할 수 있어야 합니다', () => {
    let dep1 = 'a';
    let dep2 = 1;

    const { result, rerender } = renderHook(
      ({ d1, d2 }) =>
        useMemorize(() => ({ combined: `${d1}-${d2}` }), [d1, d2]),
      { initialProps: { d1: dep1, d2: dep2 } },
    );

    const firstResult = result.current;
    expect(firstResult.combined).toBe('a-1');

    // 첫 번째 의존성만 변경
    dep1 = 'b';
    rerender({ d1: dep1, d2: dep2 });
    expect(result.current).not.toBe(firstResult);
    expect(result.current.combined).toBe('b-1');

    const secondResult = result.current;

    // 두 번째 의존성만 변경
    dep2 = 2;
    rerender({ d1: dep1, d2: dep2 });
    expect(result.current).not.toBe(secondResult);
    expect(result.current.combined).toBe('b-2');

    const thirdResult = result.current;

    // 의존성 변경 없음
    rerender({ d1: dep1, d2: dep2 });
    expect(result.current).toBe(thirdResult);
  });

  it('useMemorize는 빈 의존성 배열일 때 최초 한 번만 계산해야 합니다', () => {
    let counter = 0;
    const factory = () => {
      counter++;
      return { id: counter };
    };

    const { result, rerender } = renderHook(() => useMemorize(factory, []));

    const firstResult = result.current;
    expect(firstResult.id).toBe(1);
    expect(counter).toBe(1);

    // 리렌더링해도 재계산하지 않아야 합니다
    rerender();
    expect(result.current).toBe(firstResult);
    expect(counter).toBe(1); // 여전히 1이어야 함

    rerender();
    expect(result.current).toBe(firstResult);
    expect(counter).toBe(1); // 여전히 1이어야 함
  });
});
