import { isReactComponent } from '@winglet/react-utils/filter';

import type { FormTypeInputMap } from '@/schema-form/types';

import { INCLUDE_WILDCARD_REGEX } from './regex';
import type { NormalizedFormTypeInputDefinition } from './type';
import { formTypeTestFnFactory } from './utils/formTypeTestFnFactory';
import { pathExactMatchFnFactory } from './utils/pathExactMatchFnFactory';
import { withFormTypeInputErrorBoundary } from './utils/withFormTypeInputErrorBoundary';

/**
 * Normalizes form type input map.
 * @param formTypeInputMap - Form type input map
 * @returns Normalized form type input definitions
 */
export const normalizeFormTypeInputMap = (
  formTypeInputMap?: FormTypeInputMap,
): NormalizedFormTypeInputDefinition[] => {
  if (!formTypeInputMap) return [];
  const result: NormalizedFormTypeInputDefinition[] = [];
  const keys = Object.keys(formTypeInputMap);
  for (let i = 0, k = keys[0], l = keys.length; i < l; i++, k = keys[i]) {
    const Component = formTypeInputMap[k];
    if (!isReactComponent(Component)) continue;
    if (INCLUDE_WILDCARD_REGEX.test(k))
      result.push({
        test: formTypeTestFnFactory(k),
        Component: withFormTypeInputErrorBoundary(Component),
      });
    else
      result.push({
        test: pathExactMatchFnFactory(k),
        Component: withFormTypeInputErrorBoundary(Component),
      });
  }
  return result;
};
