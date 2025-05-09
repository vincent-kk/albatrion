import type { ComponentType, ReactNode } from 'react';

import type { Dictionary } from '@aileron/declare';

import { ErrorBoundary } from './ErrorBoundary';

/**
 * 컴포넌트를 ErrorBoundary로 감싸는 HOC(Higher Order Component)입니다.
 * @typeParam Props - 컴포넌트 프로퍼티 타입
 * @param Component - 감싸을 컴포넌트
 * @param fallback - 에러 발생 시 표시할 대체 UI (선택 사항)
 * @returns ErrorBoundary로 감싸인 컴포넌트
 * @example
 * const SafeComponent = withErrorBoundary(MyComponent, <ErrorFallback />);
 */
export const withErrorBoundary = <Props extends Dictionary>(
  Component: ComponentType<Props>,
  fallback?: ReactNode,
): ComponentType<Props> => {
  return (props: Props) => (
    <ErrorBoundary fallback={fallback}>
      <Component {...props} />
    </ErrorBoundary>
  );
};
