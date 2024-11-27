import {
  type ComponentClass,
  type ComponentType,
  type FC,
  type MemoExoticComponent,
  type ReactElement,
  isValidElement,
} from 'react';

// React 엘리먼트 체크
export const isReactElement = (component: unknown): component is ReactElement =>
  isValidElement(component);

// 메모이제이션된 컴포넌트 체크
export const isMemoComponent = <Props>(
  component: unknown,
): component is MemoExoticComponent<ComponentType<Props>> =>
  typeof component === 'object' &&
  component !== null &&
  (component as any).$$typeof === Symbol.for('react.memo');

// 클래스 컴포넌트 체크
export const isClassComponent = <Props, State = any>(
  component: unknown,
): component is ComponentClass<Props, State> =>
  !!(
    typeof component === 'function' &&
    component.prototype &&
    component.prototype.isReactComponent
  );

// 함수형 컴포넌트 체크
export const isFunctionComponent = <Props>(
  component: unknown,
): component is FC<Props> =>
  typeof component === 'function' &&
  !(component.prototype && component.prototype.isReactComponent);

// 통합 타입 체크 함수
export const isReactComponent = <Props>(
  component: unknown,
): component is ComponentType<Props> =>
  isFunctionComponent<Props>(component) ||
  isMemoComponent<Props>(component) ||
  isClassComponent<Props>(component);
