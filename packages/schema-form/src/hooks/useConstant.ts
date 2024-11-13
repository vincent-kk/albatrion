import { useRef } from 'react';

import { isFunction } from '@lumy/schema-form/helpers/filter';

// fn이 함수 타입일 때의 오버로드
export function useConstant<Return>(fn: Fn<[], Return>): Return;
// fn이 값 타입일 때의 오버로드
export function useConstant<T>(value: T): T;

// 실제 구현부
export function useConstant<Return>(
  fnOrValue: Fn<[], Return> | Return,
): Return {
  const ref = useRef<{ value: Return }>();
  if (!ref.current) {
    // 함수인 경우 실행하여 결과를 저장, 값인 경우 바로 저장
    ref.current = {
      value: isFunction(fnOrValue) ? fnOrValue() : fnOrValue,
    };
  }
  return ref.current.value;
}
