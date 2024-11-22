import { isPlainObject } from 'es-toolkit';

import { isComponentType, isTruthy } from '@lumy/schema-form/helpers/filter';
import type {
  FormTypeInputDefinition,
  FormTypeTestFn,
  FormTypeTestObject,
} from '@lumy/schema-form/types';

import type { NormalizedFormTypeInputDefinition } from './type';

export const normalizeFormTypeInputDefinitions = (
  formTypeInputDefinitions: FormTypeInputDefinition[] = [],
): NormalizedFormTypeInputDefinition[] => {
  return formTypeInputDefinitions
    .map(({ Component, test }) => {
      if (isComponentType(Component)) {
        if (typeof test === 'function') {
          return {
            Component,
            test,
          };
        }
        if (isPlainObject(test)) {
          return {
            Component,
            test: formTypeTestFnFactory(test),
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
        if (!value.includes(hint[key])) {
          return false;
        }
      } else {
        if (value !== hint[key]) {
          return false;
        }
      }
    }
    return true;
  };
};
