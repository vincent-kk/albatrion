import type { FC } from 'react';

/**
 * Determines whether a given value is a React functional component.
 *
 * Identifies functional components by checking if the value is a function that
 * lacks the `isReactComponent` prototype property (which distinguishes it from
 * class components). This includes standard function components and arrow function
 * components, but excludes components created with forwardRef (which are objects).
 *
 * @typeParam Props - The component props type (defaults to any)
 * @typeParam Component - The specific functional component type
 * @param component - The value to inspect for functional component characteristics
 * @returns Type-safe boolean indicating whether the value is a functional component
 *
 * @example
 * Basic functional component detection:
 * ```typescript
 * import React, { Component, forwardRef } from 'react';
 * import { isFunctionComponent } from '@winglet/react-utils';
 *
 * // Standard function component
 * function MyFunctionComponent() {
 *   return <div>Hello World</div>;
 * }
 *
 * // Arrow function component
 * const MyArrowComponent = () => <div>Hello World</div>;
 *
 * // Class component
 * class MyClassComponent extends Component {
 *   render() { return <div>Hello World</div>; }
 * }
 *
 * console.log(isFunctionComponent(MyFunctionComponent)); // true
 * console.log(isFunctionComponent(MyArrowComponent)); // true
 * console.log(isFunctionComponent(MyClassComponent)); // false
 * ```
 *
 * @example
 * With forwardRef components:
 * ```typescript
 * const ForwardedComponent = forwardRef<HTMLDivElement, Props>((props, ref) => {
 *   return <div ref={ref}>Content</div>;
 * });
 *
 * console.log(isFunctionComponent(ForwardedComponent)); // false
 * ```
 *
 * @example
 * TypeScript type inference:
 * ```typescript
 * interface Props {
 *   message: string;
 * }
 *
 * const TypedComponent: FC<Props> = ({ message }) => <span>{message}</span>;
 *
 * if (isFunctionComponent<Props>(someComponent)) {
 *   // TypeScript knows someComponent is FC<Props>
 *   const element = someComponent({ message: 'Hello' });
 * }
 * ```
 *
 * @remarks
 * This function identifies functional components by:
 * - Verifying the value is a function
 * - Ensuring it lacks the `prototype.isReactComponent` property
 *
 * Note that this will return `true` for:
 * - Standard function declarations
 * - Arrow function expressions
 * - Any function without the React class component marker
 *
 * And `false` for:
 * - Class components (they have `prototype.isReactComponent`)
 * - Memoized components (they're objects, not functions)
 * - Components created with React.forwardRef (they're objects, not functions)
 * - Non-function values
 */
export const isFunctionComponent = <
  Props extends object = any,
  Component extends FC<Props> = FC<Props>,
>(
  component: unknown,
): component is Component =>
  typeof component === 'function' &&
  !(component.prototype && component.prototype.isReactComponent);
