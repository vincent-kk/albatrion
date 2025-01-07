import {
  type ForwardRefExoticComponent,
  type PropsWithoutRef,
  type ReactNode,
  type RefAttributes,
  forwardRef,
} from 'react';

import type { Dictionary } from '@aileron/types';

import { ErrorBoundary } from './ErrorBoundary';

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
