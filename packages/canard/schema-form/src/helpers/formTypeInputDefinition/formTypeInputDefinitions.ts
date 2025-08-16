import {
  isArray,
  isFunction,
  isPlainObject,
} from '@winglet/common-utils/filter';
import { isReactComponent } from '@winglet/react-utils/filter';
import { withErrorBoundary } from '@winglet/react-utils/hoc';

import type {
  FormTypeInputDefinition,
  FormTypeTestFn,
  FormTypeTestObject,
} from '@/schema-form/types';

import type { NormalizedFormTypeInputDefinition } from './type';

/**
 * Normalizes form type input definitions.
 * @param formTypeInputDefinitions - Form type input definitions
 * @returns Normalized form type input definitions
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
    else if (isPlainObject(test)) {
      result.push({
        test: formTypeTestFnFactory(test),
        Component: withErrorBoundary(Component),
      });
    }
  }
  return result;
};

const formTypeTestFnFactory = (test: FormTypeTestObject): FormTypeTestFn => {
  return (hint) => {
    for (const [key, reference] of Object.entries(test)) {
      const subject = hint[key as keyof FormTypeTestObject];
      if (isArray(reference)) {
        if (!reference.includes(subject as any)) return false;
      } else {
        if (reference !== subject) return false;
      }
    }
    return true;
  };
};
