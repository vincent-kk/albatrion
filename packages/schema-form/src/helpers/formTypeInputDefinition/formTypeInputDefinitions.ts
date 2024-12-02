import { isFunction, isPlainObject, isTruthy } from '@lumy-pack/common';
import { isReactComponent } from '@lumy-pack/common-react';

import { withErrorBoundary } from '@lumy/schema-form/components/utils/withErrorBoundary';
import type {
  FormTypeInputDefinition,
  FormTypeTestFn,
  FormTypeTestObject,
} from '@lumy/schema-form/types';

import type { NormalizedFormTypeInputDefinition } from './type';

/**
 * @description 폼 타입 입력 정의를 정규화합니다.
 * @param formTypeInputDefinitions - 폼 타입 입력 정의
 * @returns 정규화된 폼 타입 입력 정의
 */
export const normalizeFormTypeInputDefinitions = (
  formTypeInputDefinitions: FormTypeInputDefinition[] = [],
): NormalizedFormTypeInputDefinition[] => {
  return formTypeInputDefinitions
    .map(({ Component, test }) => {
      if (isReactComponent(Component)) {
        if (isFunction(test)) {
          return {
            test,
            Component: withErrorBoundary(Component),
          };
        }
        if (isPlainObject(test)) {
          return {
            test: formTypeTestFnFactory(test),
            Component: withErrorBoundary(Component),
          };
        }
      }
      return null;
    })
    .filter(isTruthy);
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
