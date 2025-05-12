import { type ComponentType, memo } from 'react';

import { PortalContextProvider } from './PortalContext';

/**
 * 컴포넌트를 Portal 컨텍스트 프로바이더로 감싸는 HOC입니다.
 * 이 HOC로 감싸인 컴포넌트 내에서는 Portal 컴포넌트를 사용하여 콘텐츠를 다른 DOM 위치에 렌더할 수 있습니다.
 * @typeParam T - 컴포넌트 프로퍼티 타입
 * @param Component - Portal 컨텍스트로 감싸을 컴포넌트
 * @returns 메모이제이션된 Portal 컨텍스트로 감싸인 컴포넌트
 * @example
 * const MyPortalComponent = Portal.with(MyComponent);
 */
export const withPortal = <T extends object>(Component: ComponentType<T>) => {
  return memo((props: T) => (
    <PortalContextProvider>
      <Component {...props} />
    </PortalContextProvider>
  ));
};
