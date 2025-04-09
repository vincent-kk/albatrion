import { isFunction, isPlainObject } from '@winglet/common-utils';
import { isReactComponent, withErrorBoundary } from '@winglet/react-utils';

import type {
  FormTypeInputDefinition,
  FormTypeTestFn,
  FormTypeTestObject,
} from '@/schema-form/types';

import type { NormalizedFormTypeInputDefinition } from './type';

/**
 * @description 폼 타입 입력 정의를 정규화합니다.
 * @param formTypeInputDefinitions - 폼 타입 입력 정의
 * @returns 정규화된 폼 타입 입력 정의
 */
export const normalizeFormTypeInputDefinitions = (
  formTypeInputDefinitions?: FormTypeInputDefinition[],
): NormalizedFormTypeInputDefinition[] => {
  if (!formTypeInputDefinitions) return [];
  const result: NormalizedFormTypeInputDefinition[] = [];
  for (const { Component, test } of formTypeInputDefinitions) {
    if (!isReactComponent(Component)) continue;
    if (isFunction(test))
      result.push({
        test,
        Component: withErrorBoundary(Component),
      });
    if (isPlainObject(test))
      result.push({
        test: formTypeTestFnFactory(test),
        Component: withErrorBoundary(Component),
      });
  }
  return result;
};

const formTypeTestFnFactory = (test: FormTypeTestObject): FormTypeTestFn => {
  return (hint) => {
    for (const [key, value] of Object.entries(test)) {
      if (!value) continue;
      if (Array.isArray(value)) {
        if (!value.includes(hint[key])) return false;
      } else {
        if (value !== hint[key]) return false;
      }
    }
    return true;
  };
};
