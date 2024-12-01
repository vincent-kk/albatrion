import { useRef } from 'react';

import { isFunction } from '@lumy-pack/common';

/**
 * @description 상수를 반환합니다. 함수인 경우 실행하여 결과를 저장합니다.
 * @param input - 상수 또는 함수
 * @returns 상수 또는 함수의 결과
 */
export function useConstant<Return>(input: Fn<[], Return>): Return;
export function useConstant<T>(input: T): T;
export function useConstant<Return>(input: Fn<[], Return> | Return): Return {
  const ref = useRef<{ value: Return }>();
  if (!ref.current) {
    // 함수인 경우 실행하여 결과를 저장, 값인 경우 바로 저장
    ref.current = {
      value: isFunction(input) ? input() : input,
    };
  }
  return ref.current.value;
}
