import type { ComponentType, ReactNode } from 'react';

import type { Dictionary } from '@aileron/declare';

import { ErrorBoundary } from './ErrorBoundary';

/**
 * Higher-Order Component (HOC) that wraps a component with ErrorBoundary.
 * Catches and handles errors that occur within the wrapped component.
 * @typeParam Props - The component props type
 * @param Component - The component to wrap
 * @param fallback - Optional fallback UI to display when an error occurs
 * @returns A component wrapped with ErrorBoundary
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
