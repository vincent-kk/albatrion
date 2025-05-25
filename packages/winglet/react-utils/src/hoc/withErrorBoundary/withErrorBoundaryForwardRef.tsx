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
 * Higher-Order Component (HOC) that wraps a forwardRef component with ErrorBoundary.
 * Preserves ref forwarding while providing error boundary protection.
 * @typeParam Props - The component props type
 * @typeParam Ref - The ref type being forwarded
 * @param Component - The forwardRef component to wrap
 * @param fallback - Optional fallback UI to display when an error occurs
 * @returns A forwardRef component wrapped with ErrorBoundary
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
