import type { FC } from 'react';

/**
 * 객체가 React 함수형 컴포넌트인지 검사합니다.
 * @typeParam Props - 컴포넌트 프로퍼티 타입
 * @typeParam Component - 컴포넌트 타입
 * @param component - 검사할 대상
 * @returns 함수형 컴포넌트인지 여부
 */
export const isFunctionComponent = <
  Props extends object = any,
  Component extends FC<Props> = FC<Props>,
>(
  component: unknown,
): component is Component =>
  typeof component === 'function' &&
  !(component.prototype && component.prototype.isReactComponent);
