import {
  isArray,
  isFunction,
  isPlainObject,
} from '@winglet/common-utils/filter';
import { isReactComponent } from '@winglet/react-utils/filter';

import type {
  FormTypeInputDefinition,
  FormTypeTestFn,
  FormTypeTestObject,
} from '@/schema-form/types';

import type { NormalizedFormTypeInputDefinition } from './type';
import { withFormTypeInputErrorBoundary } from './utils/withFormTypeInputErrorBoundary';

/** Keep wrappers and one-time diagnostics at the definition's ownership point. */
const cache = new WeakMap<
  FormTypeInputDefinition,
  NormalizedFormTypeInputDefinition
>();
/** The matching surface deliberately excludes extensions and mismatch state. */
const testKeys = [
  'type',
  'schemaType',
  'path',
  'required',
  'nullable',
  'format',
  'formType',
];

/** Normalize definitions in priority order, warning once for invalid object-test keys. */
export const normalizeFormTypeInputDefinitions = (
  definitions?: FormTypeInputDefinition[],
): NormalizedFormTypeInputDefinition[] => {
  const result: NormalizedFormTypeInputDefinition[] = [];
  for (const definition of definitions ?? []) {
    if (cache.has(definition)) {
      result.push(cache.get(definition)!);
      continue;
    }
    const { Component, test } = definition;
    if (
      !isReactComponent(Component) ||
      (!isFunction(test) && !isPlainObject(test))
    )
      continue;
    if (!isFunction(test)) {
      const invalid = Object.keys(test).filter(
        (key) => !testKeys.includes(key),
      );
      if (
        (isArray(test.type) ? test.type : [test.type]).includes(
          'integer' as never,
        )
      )
        invalid.push('type:integer');
      if (invalid.length && process.env.NODE_ENV !== 'production')
        console.warn('SCHEMA_FORM_WARNING.FORM_TYPE_TEST_INVALID', {
          definition,
          invalid,
        });
    }
    const normalized = {
      test: isFunction(test) ? test : formTypeTestFnFactory(test),
      Component: withFormTypeInputErrorBoundary(Component),
    };
    cache.set(definition, normalized);
    result.push(normalized);
  }
  return result;
};

const formTypeTestFnFactory = (test: FormTypeTestObject): FormTypeTestFn => {
  const keys = Object.keys(test).filter((key) =>
    testKeys.includes(key),
  ) as (keyof FormTypeTestObject)[];
  return (hint) =>
    keys.every((key) => {
      const reference = test[key],
        subject = hint[key];
      return isArray(reference)
        ? reference.includes(subject as never)
        : reference === subject;
    });
};
