import { type ComponentType, type ReactNode, createElement } from 'react';

import { isReactComponent, isReactElement } from '../filter';

type ReactComponent<P> = ReactNode | ComponentType<P>;

/**
 * Appropriately renders ReactNode, component types, or component instances.
 * Handles different input types and returns the appropriate rendered output.
 * @typeParam P - The component props type
 * @param Component - The ReactNode or component to render
 * @param props - Props to pass to the component
 * @returns The rendered ReactNode or null
 * @example
 * // Returns ReactElement as-is
 * renderComponent(<div>Content</div>)
 * 
 * // Instantiates component type and returns it
 * renderComponent(MyComponent, { prop1: 'value1' })
 * 
 * // Returns null for invalid values
 * renderComponent(undefined)
 */
export const renderComponent = <P extends object>(
  Component: ReactComponent<P>,
  props?: P,
): ReactNode => {
  if (!Component) return null;
  else if (isReactElement(Component)) return Component;
  else if (isReactComponent(Component)) return createElement(Component, props);
  else return null;
};
