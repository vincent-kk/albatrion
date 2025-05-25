import type { ComponentType, MemoExoticComponent } from 'react';

/**
 * Checks if an object is a React component memoized with React.memo().
 * Determines this by checking for the react.memo symbol type.
 * @typeParam Props - The component props type
 * @typeParam Component - The component type
 * @param component - The object to check
 * @returns Whether the object is a memoized component
 */
export const isMemoComponent = <
  Props extends object = any,
  Component extends MemoExoticComponent<
    ComponentType<Props>
  > = MemoExoticComponent<ComponentType<Props>>,
>(
  component: unknown,
): component is Component =>
  typeof component === 'object' &&
  component !== null &&
  (component as any).$$typeof === Symbol.for('react.memo');
