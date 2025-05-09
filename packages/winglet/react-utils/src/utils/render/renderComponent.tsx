import { type ComponentType, type ReactNode, createElement } from 'react';

import { isReactComponent, isReactElement } from '../filter';

type ReactComponent<P> = ReactNode | ComponentType<P>;

/**
 * ReactNode, 컴포넌트 타입 또는 컴포넌트 인스턴스를 적절히 렌더합니다.
 * @typeParam P - 컴포넌트 프로퍼티 타입
 * @param Component - 렌더할 ReactNode 또는 컴포넌트
 * @param props - 컴포넌트에 전달할 프로퍼티
 * @returns 렌더된 ReactNode 또는 null
 * @example
 * // ReactElement를 그대로 반환
 * renderComponent(<div>Content</div>)
 * 
 * // 컴포넌트 타입을 인스턴스화하여 반환
 * renderComponent(MyComponent, { prop1: 'value1' })
 * 
 * // 유효하지 않은 값은 null 반환
 * renderComponent(undefined)
 */
export const renderComponent = <P extends object>(
  Component: ReactComponent<P>,
  props?: P,
): ReactNode => {
  if (!Component) return null;
  else if (isReactElement(Component)) return Component;
  else if (isReactComponent(Component)) return createElement(Component, props);
  else return null;
};
