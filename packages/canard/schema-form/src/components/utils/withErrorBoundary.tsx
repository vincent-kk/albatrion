import type { ComponentType } from 'react';

import { ErrorBoundary } from './ErrorBoundary';

export const withErrorBoundary = <Props extends Dictionary>(
  Component: ComponentType<Props>,
): ComponentType<Props> => {
  return (props: Props) => (
    <ErrorBoundary>
      <Component {...props} />
    </ErrorBoundary>
  );
};
