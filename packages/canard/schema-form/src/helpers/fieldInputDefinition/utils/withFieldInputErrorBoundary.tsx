import { type ComponentType, memo } from 'react';

import { ErrorBoundary } from '@winglet/react-utils/hoc';

import { useBoundaryReporter } from '@/schema-form/providers/FormErrorContext';
import type { FieldInputProps } from '@/schema-form/types';

import type { FieldInputBindingProps } from '../type';

/**
 * Isolate an input once at its resolver while limiting Refresh to the raw input.
 * @param Component - Valid raw input resolved from an inline, preferred, map or definition source.
 * @returns Stable field boundary accepting the binding's applied generation without forwarding it.
 */
export const withFieldInputErrorBoundary = (
  Component: ComponentType<FieldInputProps>,
): ComponentType<FieldInputBindingProps> => {
  /**
   * React supplies field props and reporter context; the applied generation keys only the raw input.
   * @param input - Binding props whose generation is held during composition or mounted children.
   * @returns One persistent boundary around the input, without exposing the private generation.
   */
  return memo(function FieldInputBoundary({
    inputGeneration,
    ...props
  }: FieldInputBindingProps) {
    const onError = useBoundaryReporter(props.path);
    return (
      <ErrorBoundary onError={onError}>
        <Component {...props} key={inputGeneration} />
      </ErrorBoundary>
    );
  });
};
