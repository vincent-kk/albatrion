import type { ComponentType, MemoExoticComponent } from 'react';

/**
 * 객체가 React.memo()로 메모이제이션된 컴포넌트인지 검사합니다.
 * @typeParam Props - 컴포넌트 프로퍼티 타입
 * @typeParam Component - 컴포넌트 타입
 * @param component - 검사할 대상
 * @returns 메모이제이션된 컴포넌트인지 여부
 */
export const isMemoComponent = <
  Props extends object = any,
  Component extends MemoExoticComponent<
    ComponentType<Props>
  > = MemoExoticComponent<ComponentType<Props>>,
>(
  component: unknown,
): component is Component =>
  typeof component === 'object' &&
  component !== null &&
  (component as any).$$typeof === Symbol.for('react.memo');
