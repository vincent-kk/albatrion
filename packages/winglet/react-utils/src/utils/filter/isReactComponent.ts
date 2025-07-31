import type { ComponentType } from 'react';

import { isClassComponent } from './isClassComponent';
import { isFunctionComponent } from './isFunctionComponent';
import { isMemoComponent } from './isMemoComponent';

/**
 * Comprehensively determines whether a given value is any type of React component.
 *
 * Provides unified component detection by combining checks for all React component
 * types: functional components, class components, and memoized components.
 * This is useful when you need to identify any valid React component regardless
 * of its implementation pattern.
 *
 * @typeParam Props - The component props type (defaults to any)
 * @typeParam Component - The component type (union of all component types)
 * @param component - The value to inspect for any React component characteristics
 * @returns Type-safe boolean indicating whether the value is any type of React component
 *
 * @example
 * Detecting various component types:
 * ```typescript
 * import React, { Component, memo, forwardRef } from 'react';
 * import { isReactComponent } from '@winglet/react-utils';
 *
 * // Function component
 * const FunctionComp = () => <div>Function</div>;
 *
 * // Class component
 * class ClassComp extends Component {
 *   render() { return <div>Class</div>; }
 * }
 *
 * // Memoized component
 * const MemoComp = memo(() => <div>Memo</div>);
 *
 * // ForwardRef component
 * const ForwardComp = forwardRef<HTMLDivElement>((props, ref) =>
 *   <div ref={ref}>Forward</div>
 * );
 *
 * console.log(isReactComponent(FunctionComp)); // true
 * console.log(isReactComponent(ClassComp)); // true
 * console.log(isReactComponent(MemoComp)); // true
 * console.log(isReactComponent(ForwardComp)); // false (현재 구현에서는 forwardRef 미지원)
 * console.log(isReactComponent('not a component')); // false
 * console.log(isReactComponent({})); // false
 * ```
 *
 * @example
 * Component validation in higher-order functions:
 * ```typescript
 * function renderComponent<T extends object>(
 *   component: unknown,
 *   props: T
 * ): React.ReactElement | null {
 *   if (!isReactComponent<T>(component)) {
 *     console.warn('Invalid component provided');
 *     return null;
 *   }
 *
 *   // TypeScript knows component is ComponentType<T>
 *   return React.createElement(component, props);
 * }
 *
 * // Usage
 * const element = renderComponent(MyComponent, { title: 'Hello' });
 * ```
 *
 * @example
 * Component registry validation:
 * ```typescript
 * interface ComponentRegistry {
 *   [key: string]: ComponentType<any>;
 * }
 *
 * function registerComponents(components: Record<string, unknown>): ComponentRegistry {
 *   const registry: ComponentRegistry = {};
 *
 *   for (const [name, component] of Object.entries(components)) {
 *     if (isReactComponent(component)) {
 *       registry[name] = component;
 *     } else {
 *       console.warn(`Skipping invalid component: ${name}`);
 *     }
 *   }
 *
 *   return registry;
 * }
 * ```
 *
 * @remarks
 * This function combines three specific component type checks:
 * - `isFunctionComponent()`: For function-based components
 * - `isMemoComponent()`: For React.memo wrapped components
 * - `isClassComponent()`: For class-based components
 *
 * Note: This function currently does not detect forwardRef components
 * as they require a separate detection mechanism based on $$typeof.
 *
 * The order of checks is optimized for common usage patterns:
 * 1. Function components (most common in modern React)
 * 2. Memoized components (performance-optimized components)
 * 3. Class components (legacy but still supported)
 *
 * This provides a single entry point for component validation without
 * needing to know the specific implementation details of each component type.
 */
export const isReactComponent = <
  Props extends object = any,
  Component extends ComponentType<Props> = ComponentType<Props>,
>(
  component: unknown,
): component is Component =>
  isFunctionComponent<Props>(component) ||
  isMemoComponent<Props>(component) ||
  isClassComponent<Props>(component);
