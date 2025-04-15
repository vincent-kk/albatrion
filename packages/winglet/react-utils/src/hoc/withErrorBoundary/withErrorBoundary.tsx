import type { ComponentType, ReactNode } from 'react';

import type { Dictionary } from '@aileron/declare';

import { ErrorBoundary } from './ErrorBoundary';

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
