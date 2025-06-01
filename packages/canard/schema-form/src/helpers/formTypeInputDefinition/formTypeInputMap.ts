import { JSONPath } from '@winglet/json';
import { isReactComponent, withErrorBoundary } from '@winglet/react-utils';

import { SchemaFormError } from '@/schema-form/errors';
import type { FormTypeInputMap, FormTypeTestFn } from '@/schema-form/types';

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
  for (const [path, Component] of Object.entries(formTypeInputMap)) {
    if (!isReactComponent(Component)) continue;
    if (FILTER_PATH_REGEX.test(path))
      result.push({
        test: formTypeTestFnFactory(path),
        Component: withErrorBoundary(Component),
      });
    else
      result.push({
        test: pathExactMatchFnFactory(path),
        Component: withErrorBoundary(Component),
      });
  }
  return result;
};

const FILTER_PATH_REGEX = new RegExp(`\\.${JSONPath.Filter}(\\.|$)`);

const pathExactMatchFnFactory = (path: string): FormTypeTestFn => {
  try {
    const regex = new RegExp(path);
    return (hint) => {
      if (hint.path === path) return true;
      if (regex.test(hint.path)) return true;
      return false;
    };
  } catch (error) {
    throw new SchemaFormError(
      'FORM_TYPE_INPUT_MAP',
      `FormTypeInputMap contains an invalid key pattern.: ${path}`,
      { path, error },
    );
  }
};

const NUMBER_REGEX = /^[0-9]+$/;
const formTypeTestFnFactory = (path: string): FormTypeTestFn => {
  const segments = path.split(JSONPath.Child);
  return (hint) => {
    const hintSegments = hint.path.split(JSONPath.Child);
    if (segments.length !== hintSegments.length) return false;
    return segments.every((segment, i) => {
      if (segment === JSONPath.Filter) {
        return NUMBER_REGEX.test(hintSegments[i]);
      }
      return segment === hintSegments[i];
    });
  };
};
