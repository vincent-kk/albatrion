import { useRef } from 'react';

import { isFunction } from '@winglet/common-utils';

import type { Fn } from '@aileron/declare';

/**
 * @description 상수를 반환합니다. 함수인 경우 실행하여 결과를 저장합니다.
 * @param input - 상수 또는 함수
 * @returns 상수 또는 함수의 결과
 */
export const useConstant: {
  <Return>(input: Fn<[], Return>): Return;
  <T>(input: T): T;
} = <Return>(input: Fn<[], Return> | Return): Return => {
  const ref = useRef<{ value: Return }>();
  if (!ref.current) {
    ref.current = {
      value: isFunction(input) ? input() : input,
    };
  }
  return ref.current.value;
};
