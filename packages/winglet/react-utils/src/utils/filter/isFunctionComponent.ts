import type { FC } from 'react';

/**
 * Checks if an object is a React functional component.
 * Determines this by checking if it's a function without the isReactComponent prototype property.
 * @typeParam Props - The component props type
 * @typeParam Component - The component type
 * @param component - The object to check
 * @returns Whether the object is a functional component
 */
export const isFunctionComponent = <
  Props extends object = any,
  Component extends FC<Props> = FC<Props>,
>(
  component: unknown,
): component is Component =>
  typeof component === 'function' &&
  !(component.prototype && component.prototype.isReactComponent);
