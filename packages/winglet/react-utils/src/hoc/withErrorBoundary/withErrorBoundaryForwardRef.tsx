import {
  type ForwardRefExoticComponent,
  type PropsWithoutRef,
  type ReactNode,
  type RefAttributes,
  forwardRef,
} from 'react';

import type { Dictionary } from '@aileron/declare';

import { ErrorBoundary } from './ErrorBoundary';

/**
 * ref를 전달하는 컴포넌트를 ErrorBoundary로 감싸는 HOC입니다.
 * @typeParam Props - 컴포넌트 프로퍼티 타입
 * @typeParam Ref - ref로 전달될 타입
 * @param Component - 감싸을 forwardRef 컴포넌트
 * @param fallback - 에러 발생 시 표시할 대체 UI (선택 사항)
 * @returns ref를 전달하면서 ErrorBoundary로 감싸인 컴포넌트
 * @example
 * const SafeComponent = withErrorBoundaryForwardRef(MyForwardRefComponent, <ErrorFallback />);
 */
export const withErrorBoundaryForwardRef = <Props extends Dictionary, Ref>(
  Component: ForwardRefExoticComponent<Props & RefAttributes<Ref>>,
  fallback?: ReactNode,
): ForwardRefExoticComponent<PropsWithoutRef<Props> & RefAttributes<Ref>> => {
  return forwardRef<Ref, Props>((props, ref) => (
    <ErrorBoundary fallback={fallback}>
      <Component {...(props as Props)} ref={ref} />
    </ErrorBoundary>
  ));
};
