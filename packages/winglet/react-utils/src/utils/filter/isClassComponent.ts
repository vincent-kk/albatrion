import type { ComponentClass } from 'react';

/**
 * 객체가 React 클래스 컴포넌트인지 검사합니다.
 * @typeParam Props - 컴포넌트 프로퍼티 타입
 * @typeParam State - 컴포넌트 상태 타입
 * @typeParam Component - 컴포넌트 타입
 * @param component - 검사할 대상
 * @returns 클래스 컴포넌트인지 여부
 */
export const isClassComponent = <
  Props extends object = any,
  State = any,
  Component extends ComponentClass<Props, State> = ComponentClass<Props, State>,
>(
  component: unknown,
): component is Component =>
  !!(
    typeof component === 'function' &&
    component.prototype &&
    component.prototype.isReactComponent
  );
