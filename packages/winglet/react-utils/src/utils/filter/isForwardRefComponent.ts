import type { ForwardRefExoticComponent } from 'react';

/** React's brand for a value produced by `forwardRef`. */
const FORWARD_REF_TYPE = Symbol.for('react.forward_ref');

/**
 * Checks whether a value is a component created by `React.forwardRef`.
 *
 * `forwardRef` returns an object rather than a function, so the function-shaped
 * checks miss it and callers that gate rendering on them drop it silently.
 *
 * @typeParam Props - Props the component accepts
 * @typeParam Component - Concrete component type to narrow to
 * @param component - Value to inspect
 * @returns Whether the value is a forwardRef component
 *
 * @example
 * ```typescript
 * const Input = forwardRef<HTMLInputElement>((props, ref) => <input ref={ref} />);
 * isForwardRefComponent(Input); // true
 * isForwardRefComponent(() => null); // false
 * ```
 */
export const isForwardRefComponent = <
  Props extends object = any,
  Component extends ForwardRefExoticComponent<Props> = ForwardRefExoticComponent<Props>,
>(
  component: unknown,
): component is Component =>
  typeof component === 'object' &&
  component !== null &&
  (component as { $$typeof?: unknown }).$$typeof === FORWARD_REF_TYPE;
