import type { ComponentType } from 'react';

import type { Dictionary } from '@aileron/declare';

import { isReactComponent } from '../filter';

/**
 * Extracts only React components from an input object and creates a new object.
 * Filters out non-component values using component type checking.
 * @typeParam Input - The input object type
 * @typeParam Output - The output object type
 * @param dictionary - An object containing React components and other values
 * @returns A new object containing only React components
 * @example
 * const components = remainOnlyReactComponent({
 *   Button: ButtonComponent,
 *   Icon: IconComponent,
 *   helper: helperFunction, // Not a component, will be excluded
 * });
 * // Result: { Button: ButtonComponent, Icon: IconComponent }
 */
export const remainOnlyReactComponent = <
  Input extends Record<string, unknown>,
  Output extends Record<string, ComponentType>,
>(
  dictionary: Input,
): Output => {
  const result: Dictionary<ComponentType> = {};
  for (const [key, value] of Object.entries(dictionary))
    if (isReactComponent(value)) result[key] = value;
  return result as Output;
};
