import type { ComponentType } from 'react';

import { ErrorBoundary } from '@winglet/react-utils/hoc';

import { useBoundaryReporter } from '@/schema-form/providers/FormErrorContext';
import type { FormTypeInputProps } from '@/schema-form/types';

import type { FormTypeInputBindingProps } from '../type';

/**
 * Isolate an input once at its resolver while limiting Refresh to the raw input.
 * @param Component - Valid raw input resolved from an inline, preferred, map or definition source.
 * @returns Stable field boundary accepting the binding's applied generation without forwarding it.
 */
export const withFormTypeInputErrorBoundary = (
  Component: ComponentType<FormTypeInputProps>,
): ComponentType<FormTypeInputBindingProps> => {
  /** Consume the applied generation inside the boundary; composition and containers may hold it. */
  const Input = ({ inputGeneration, ...props }: FormTypeInputBindingProps) => (
    <Component {...props} key={inputGeneration} />
  );
  /** Read the current field reporter while preserving the existing generation-consumer layer. */
  return function FormTypeInputBoundary(props: FormTypeInputBindingProps) {
    const onError = useBoundaryReporter(props.path);
    return <ErrorBoundary onError={onError}><Input {...props} /></ErrorBoundary>;
  };
};
