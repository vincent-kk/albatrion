import type { ComponentType, MemoExoticComponent } from 'react';

/**
 * Determines whether a given value is a React component wrapped with React.memo().
 *
 * Identifies memoized components by inspecting the internal React symbol type
 * `$$typeof`, which is set to `Symbol.for('react.memo')` for components that
 * have been enhanced with React.memo() for performance optimization.
 *
 * @typeParam Props - The component props type (defaults to any)
 * @typeParam Component - The specific memoized component type
 * @param component - The value to inspect for memoized component characteristics
 * @returns Type-safe boolean indicating whether the value is a memoized component
 *
 * @example
 * Basic memoized component detection:
 * ```typescript
 * import React, { memo, Component } from 'react';
 * import { isMemoComponent } from '@winglet/react-utils';
 *
 * // Function component
 * const BasicComponent = () => <div>Hello World</div>;
 *
 * // Memoized function component
 * const MemoizedComponent = memo(BasicComponent);
 *
 * // Class component
 * class ClassComponent extends Component {
 *   render() { return <div>Hello World</div>; }
 * }
 *
 * // Memoized class component
 * const MemoizedClassComponent = memo(ClassComponent);
 *
 * console.log(isMemoComponent(BasicComponent)); // false
 * console.log(isMemoComponent(MemoizedComponent)); // true
 * console.log(isMemoComponent(ClassComponent)); // false
 * console.log(isMemoComponent(MemoizedClassComponent)); // true
 * ```
 *
 * @example
 * With custom comparison function:
 * ```typescript
 * interface Props {
 *   name: string;
 *   age: number;
 * }
 *
 * const PersonComponent = ({ name, age }: Props) => (
 *   <div>{name} is {age} years old</div>
 * );
 *
 * const MemoizedPerson = memo(PersonComponent, (prevProps, nextProps) => {
 *   return prevProps.name === nextProps.name && prevProps.age === nextProps.age;
 * });
 *
 * console.log(isMemoComponent(MemoizedPerson)); // true
 * ```
 *
 * @example
 * TypeScript type inference:
 * ```typescript
 * interface ComponentProps {
 *   title: string;
 * }
 *
 * if (isMemoComponent<ComponentProps>(someComponent)) {
 *   // TypeScript knows someComponent is MemoExoticComponent<ComponentType<ComponentProps>>
 *   const displayName = someComponent.displayName;
 *   const type = someComponent.type; // The wrapped component
 * }
 * ```
 *
 * @remarks
 * This function identifies memoized components by:
 * - Verifying the value is a non-null object
 * - Checking for the `$$typeof` property equal to `Symbol.for('react.memo')`
 *
 * Memoized components are objects with special properties:
 * - `type`: The original component that was wrapped
 * - `compare`: The comparison function (if provided)
 * - `$$typeof`: The React internal symbol identifier
 *
 * Note that this will return `true` only for components explicitly wrapped
 * with `React.memo()`, regardless of whether they were originally functional
 * or class components.
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
