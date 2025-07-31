import type { ComponentClass } from 'react';

/**
 * Determines whether a given value is a React class component.
 *
 * Performs runtime type checking by inspecting the component's prototype for the
 * `isReactComponent` property, which is automatically added to class components
 * that extend React.Component or React.PureComponent.
 *
 * @typeParam Props - The component props type (defaults to any)
 * @typeParam State - The component state type (defaults to any)
 * @typeParam Component - The specific component class type
 * @param component - The value to inspect for class component characteristics
 * @returns Type-safe boolean indicating whether the value is a class component
 *
 * @example
 * Basic class component detection:
 * ```typescript
 * import React, { Component } from 'react';
 * import { isClassComponent } from '@winglet/react-utils';
 *
 * class MyClassComponent extends Component {
 *   render() {
 *     return <div>Hello World</div>;
 *   }
 * }
 *
 * const MyFunctionComponent = () => <div>Hello World</div>;
 *
 * console.log(isClassComponent(MyClassComponent)); // true
 * console.log(isClassComponent(MyFunctionComponent)); // false
 * console.log(isClassComponent('not a component')); // false
 * ```
 *
 * @example
 * With TypeScript type inference:
 * ```typescript
 * interface Props {
 *   title: string;
 * }
 *
 * class TypedClassComponent extends Component<Props> {
 *   render() {
 *     return <h1>{this.props.title}</h1>;
 *   }
 * }
 *
 * if (isClassComponent<Props>(someComponent)) {
 *   // TypeScript now knows someComponent is ComponentClass<Props>
 *   const element = React.createElement(someComponent, { title: 'Hello' });
 * }
 * ```
 *
 * @remarks
 * This function specifically checks for:
 * - The value being a function (class constructors are functions)
 * - The presence of a prototype object
 * - The `isReactComponent` property on the prototype
 *
 * Note that this will return `false` for:
 * - Functional components (including forwardRef components)
 * - Memoized components (React.memo)
 * - Non-React functions or classes
 * - Primitive values or null/undefined
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
