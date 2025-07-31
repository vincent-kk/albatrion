/**
 * Determines whether a given value is a valid React element.
 *
 * This is a re-export of React's built-in `isValidElement` function, which checks
 * if a value is a valid React element (JSX element or result of React.createElement).
 * It performs runtime validation of the React element structure and internal properties.
 *
 * @param object - The value to check for React element characteristics
 * @returns Type-safe boolean indicating whether the value is a React element
 *
 * @example
 * Basic React element detection:
 * ```typescript
 * import React from 'react';
 * import { isReactElement } from '@winglet/react-utils';
 *
 * const jsxElement = <div>Hello World</div>;
 * const createdElement = React.createElement('span', null, 'Hello');
 * const component = () => <div>Component</div>;
 * const plainObject = { type: 'div', props: {} };
 *
 * console.log(isReactElement(jsxElement)); // true
 * console.log(isReactElement(createdElement)); // true
 * console.log(isReactElement(component)); // false (function, not element)
 * console.log(isReactElement(plainObject)); // false (missing React internals)
 * console.log(isReactElement('text')); // false
 * console.log(isReactElement(null)); // false
 * ```
 *
 * @example
 * Element validation in render functions:
 * ```typescript
 * function ConditionalRenderer({ children }: { children: unknown }) {
 *   if (isReactElement(children)) {
 *     // TypeScript knows children is React.ReactElement
 *     return <div className="wrapper">{children}</div>;
 *   }
 *
 *   return <div className="fallback">Invalid content</div>;
 * }
 *
 * // Usage
 * <ConditionalRenderer>
 *   <span>Valid element</span>
 * </ConditionalRenderer>
 * ```
 *
 * @example
 * Filtering arrays of mixed content:
 * ```typescript
 * const mixedContent = [
 *   <div key="1">Element 1</div>,
 *   'plain text',
 *   <span key="2">Element 2</span>,
 *   42,
 *   <p key="3">Element 3</p>
 * ];
 *
 * const onlyElements = mixedContent.filter(isReactElement);
 * // Result: [<div>Element 1</div>, <span>Element 2</span>, <p>Element 3</p>]
 * ```
 *
 * @remarks
 * This function checks for:
 * - The presence of React's internal `$typeof` property
 * - Proper React element structure
 * - Valid element type and props
 *
 * Note the distinction between React elements and React components:
 * - **React Element**: The result of JSX or React.createElement (this function returns true)
 * - **React Component**: A function or class that returns elements (this function returns false)
 *
 * Use this function when you need to validate that a value is an actual rendered
 * element rather than a component definition.
 *
 * @see {@link isReactComponent} for checking if a value is a component definition
 */
export { isValidElement as isReactElement } from 'react';
