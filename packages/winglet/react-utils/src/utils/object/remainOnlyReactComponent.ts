import type { ComponentType } from 'react';

import type { Dictionary } from '@aileron/types';

import { isReactComponent } from '../filter';

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
