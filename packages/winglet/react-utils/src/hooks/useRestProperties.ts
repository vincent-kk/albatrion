import { useMemo, useRef } from 'react';

import type { Dictionary } from '@aileron/declare';

/**
 * 이전 프로퍼티와 현재 프로퍼티를 비교하여 변경이 없으면 이전 객체를 그대로 반환합니다.
 * 이는 불필요한 렌더링을 방지하는 데 유용합니다.
 * @typeParam T - 프로퍼티 객체 타입
 * @param props - 비교할 프로퍼티 객체
 * @returns 이전 프로퍼티와 동일하면 이전 객체, 그렇지 않으면 새 객체
 */
export const useRestProperties = <T extends Dictionary>(props: T): T => {
  const propsRef = useRef<T>(props);
  const keysRef = useRef<string[]>(props ? Object.keys(props) : []);
  return useMemo(() => {
    // If props is not changed, return the same props
    // Or, if props is nullish, skip the rest of the logic
    if (!props || props === propsRef.current) return props;

    // If props's keys are not same as the previous props's keys, set the props and keys
    const currentKeys = Object.keys(props);
    if (currentKeys.length !== keysRef.current.length) {
      propsRef.current = props;
      keysRef.current = currentKeys;
      return props;
    }

    // If props's keys are same as the previous props's keys, return the previous props
    // If this case is true, previous props is empty object also.
    if (!currentKeys.length) return propsRef.current;

    // If props's values are not same as the previous props's values, set the props and keys
    for (let i = 0; i < currentKeys.length; i++) {
      const key = currentKeys[i];
      if (props[key] !== propsRef.current[key]) {
        propsRef.current = props;
        keysRef.current = currentKeys;
        return props;
      }
    }
    // If props's values are same as the previous props's values, return the previous props
    return propsRef.current;
  }, [props]);
};
