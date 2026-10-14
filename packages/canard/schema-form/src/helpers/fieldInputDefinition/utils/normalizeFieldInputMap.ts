import { isReactComponent } from '@winglet/react-utils/filter';

import type { FieldInputMap } from '@/schema-form/types';

import { INCLUDE_WILDCARD_REGEX } from '../constants/regex';
import type { NormalizedFieldInputDefinition } from '../type';
import { fieldInputTestFnFactory } from './fieldInputTestFnFactory';
import { pathExactMatchFnFactory } from './pathExactMatchFnFactory';
import { withFieldInputErrorBoundary } from './withFieldInputErrorBoundary';

/**
 * Normalizes field input map.
 * @param fieldInputMap - Field input map
 * @returns Normalized field input definitions
 */
export const normalizeFieldInputMap = (
  fieldInputMap?: FieldInputMap,
): NormalizedFieldInputDefinition[] => {
  if (!fieldInputMap) return [];
  const result: NormalizedFieldInputDefinition[] = [];
  const keys = Object.keys(fieldInputMap);
  for (let i = 0, k = keys[0], l = keys.length; i < l; i++, k = keys[i]) {
    const Component = fieldInputMap[k];
    if (!isReactComponent(Component)) continue;
    if (INCLUDE_WILDCARD_REGEX.test(k))
      result.push({
        test: fieldInputTestFnFactory(k),
        Component: withFieldInputErrorBoundary(Component),
      });
    else
      result.push({
        test: pathExactMatchFnFactory(k),
        Component: withFieldInputErrorBoundary(Component),
      });
  }
  return result;
};
