import { isArrayIndex } from '@winglet/common-utils/filter';
import { isReactComponent } from '@winglet/react-utils/filter';
import { withErrorBoundary } from '@winglet/react-utils/hoc';

import { SchemaFormError } from '@/schema-form/errors';
import {
  INCLUDE_INDEX_REGEX,
  JSONPointer,
} from '@/schema-form/helpers/jsonPointer';
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
    if (INCLUDE_INDEX_REGEX.test(path))
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

const formTypeTestFnFactory = (path: string): FormTypeTestFn => {
  const segments = path.split(JSONPointer.Separator);

  return (hint) => {
    const hintSegments = hint.path.split(JSONPointer.Separator);
    if (segments.length !== hintSegments.length) return false;
    return segments.every((segment, i) =>
      segment === JSONPointer.Index
        ? isArrayIndex(hintSegments[i])
        : segment === hintSegments[i],
    );
  };
};
