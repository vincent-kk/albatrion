import type { ComponentClass } from 'react';

/**
 * Checks if an object is a React class component.
 * Determines this by checking for the presence of the isReactComponent property on the prototype.
 * @typeParam Props - The component props type
 * @typeParam State - The component state type
 * @typeParam Component - The component type
 * @param component - The object to check
 * @returns Whether the object is a class component
 */
export const isClassComponent = <
  Props extends object = any,
  State = any,
  Component extends ComponentClass<Props, State> = ComponentClass<Props, State>,
>(
  component: unknown,
): component is Component =>
  !!(
    typeof component === 'function' &&
    component.prototype &&
    component.prototype.isReactComponent
  );
