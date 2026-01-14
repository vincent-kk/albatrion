import { isReactComponent } from '@winglet/react-utils/filter';
import { withErrorBoundary } from '@winglet/react-utils/hoc';

import { SchemaFormError } from '@/schema-form/errors';
import {
  JSONPointer as $,
  stripFragment,
} from '@/schema-form/helpers/jsonPointer';
import type { FormTypeInputMap, FormTypeTestFn } from '@/schema-form/types';

import { INCLUDE_WILDCARD_REGEX } from './regex';
import type { NormalizedFormTypeInputDefinition } from './type';

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
        Component: withErrorBoundary(Component),
      });
    else
      result.push({
        test: pathExactMatchFnFactory(k),
        Component: withErrorBoundary(Component),
      });
  }
  return result;
};

const pathExactMatchFnFactory = (inputPath: string): FormTypeTestFn => {
  try {
    const path = stripFragment(inputPath);
    const regex = path ? new RegExp(path) : null;
    return (hint) => {
      if (hint.path === path) return true;
      if (regex?.test(hint.path)) return true;
      return false;
    };
  } catch (error) {
    throw new SchemaFormError(
      'FORM_TYPE_INPUT_MAP',
      `FormTypeInputMap contains an invalid key pattern.: ${inputPath}`,
      { path: inputPath, error },
    );
  }
};

const formTypeTestFnFactory = (path: string): FormTypeTestFn => {
  const segments = stripFragment(path).split($.Separator);
  return (hint) => {
    const hintSegments = hint.path.split($.Separator);
    if (segments.length !== hintSegments.length) return false;
    for (let i = 0, l = segments.length; i < l; i++) {
      const segment = segments[i];
      const hintSegment = hintSegments[i];
      if (segment === $.Wildcard) continue;
      else if (segment !== hintSegment) return false;
    }
    return true;
  };
};
