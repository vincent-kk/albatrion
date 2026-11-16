import { type ComponentType, memo } from 'react';

import { ErrorBoundary } from '@winglet/react-utils/hoc';
import { useMemorize } from '@winglet/react-utils/hook';

import { useBoundaryReporter } from '@/schema-form/providers/FormErrorContext';
import type { FieldInputProps } from '@/schema-form/types';

import { FieldInputSelection } from '../components/FieldInputSelection';
import type { FieldInputBindingProps } from '../type';

/** Resolver-owned adapters preserve raw component identity across input configuration sources. */
const adapters = new WeakMap<
  ComponentType<FieldInputProps>,
  ComponentType<FieldInputBindingProps>
>();

/**
 * Isolate an input once at its resolver while limiting Refresh to the raw input.
 * @param Component - Valid raw input resolved from an inline, preferred, map or definition source.
 * @returns Stable field boundary accepting the binding's applied generation without forwarding it.
 */
export const withFieldInputErrorBoundary = (
  Component: ComponentType<FieldInputProps>,
): ComponentType<FieldInputBindingProps> => {
  const cached = adapters.get(Component);
  if (cached) return cached;
  /**
   * React supplies field props and reporter context; the applied generation keys only the raw input.
   * @param input - Binding props whose generation is held during composition or mounted children.
   * @returns One persistent boundary around the input, without exposing the private generation.
   */
  const Boundary = memo(function FieldInputBoundary({
    inputGeneration,
    inputSelection,
    ...props
  }: FieldInputBindingProps) {
    const defaultValue = useMemorize(
      () => props.node.value,
      [props.node, inputGeneration],
    );
    const onError = useBoundaryReporter(props.path);
    return (
      <>
        <FieldInputSelection selection={inputSelection} />
        <ErrorBoundary onError={onError}>
          <Component
            {...props}
            defaultValue={defaultValue}
            key={inputGeneration}
          />
        </ErrorBoundary>
      </>
    );
  });
  adapters.set(Component, Boundary);
  return Boundary;
};
