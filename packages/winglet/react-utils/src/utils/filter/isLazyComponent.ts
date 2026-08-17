import type { ComponentType, LazyExoticComponent } from 'react';

/** React's brand for a value produced by `lazy`. */
const LAZY_TYPE = Symbol.for('react.lazy');

/**
 * Checks whether a value is a component created by `React.lazy`.
 *
 * `lazy` returns an object whose implementation resolves later, so the
 * function-shaped checks miss it even though React renders it as a component.
 *
 * @typeParam Props - Props the component accepts
 * @typeParam Component - Concrete component type to narrow to
 * @param component - Value to inspect
 * @returns Whether the value is a lazy component
 *
 * @example
 * ```typescript
 * const Page = lazy(() => import('./Page'));
 * isLazyComponent(Page); // true
 * isLazyComponent(() => null); // false
 * ```
 */
export const isLazyComponent = <
  Props extends object = any,
  Component extends LazyExoticComponent<ComponentType<Props>> = LazyExoticComponent<
    ComponentType<Props>
  >,
>(
  component: unknown,
): component is Component =>
  typeof component === 'object' &&
  component !== null &&
  (component as { $$typeof?: unknown }).$$typeof === LAZY_TYPE;
