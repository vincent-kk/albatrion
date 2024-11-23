import {
  type FormTypeInputMap,
  type FormTypeTestFn,
  JSONPath,
} from '@lumy/schema-form/types';

import { isReactComponent, isTruthy } from '../filter';
import type { NormalizedFormTypeInputDefinition } from './type';

const FILTER_PATH_REGEX = new RegExp(`\\.${JSONPath.Filter}(\\.|$)`);
export const normalizeFormTypeInputMap = (
  formTypeInputMap?: FormTypeInputMap,
): NormalizedFormTypeInputDefinition[] => {
  if (!formTypeInputMap) return [];
  return Object.entries(formTypeInputMap)
    .map(([path, Component]) => {
      if (typeof path !== 'string' || !isReactComponent(Component)) return null;

      if (FILTER_PATH_REGEX.test(path)) {
        return {
          test: formTypeTestFnFactory(path),
          Component,
        };
      } else {
        return {
          test: pathExactMatchFnFactory(path),
          Component,
        };
      }
    })
    .filter(isTruthy);
};

const pathExactMatchFnFactory = (path: string): FormTypeTestFn => {
  return (hint) => hint.path === path;
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
