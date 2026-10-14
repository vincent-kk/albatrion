import {
  isArray,
  isFunction,
  isPlainObject,
} from '@winglet/common-utils/filter';
import { isReactComponent } from '@winglet/react-utils/filter';

import type {
  FieldInputDefinition,
  FieldInputTestFn,
  FieldInputTestObject,
} from '@/schema-form/types';

import type { NormalizedFieldInputDefinition } from './type';
import { withFieldInputErrorBoundary } from './utils/withFieldInputErrorBoundary';

/** Keep wrappers and one-time diagnostics at the definition's ownership point. */
const cache = new WeakMap<
  FieldInputDefinition,
  NormalizedFieldInputDefinition
>();
/** The matching surface deliberately excludes extensions and mismatch state. */
const testKeys = [
  'type',
  'schemaType',
  'path',
  'required',
  'nullable',
  'format',
  'inputType',
];

/** Normalize definitions in priority order, warning once for invalid object-test keys. */
export const normalizeFieldInputDefinitions = (
  definitions?: FieldInputDefinition[],
): NormalizedFieldInputDefinition[] => {
  const result: NormalizedFieldInputDefinition[] = [];
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
      const types: readonly unknown[] = isArray(test.type)
        ? test.type
        : [test.type];
      if (types.includes('integer')) invalid.push('type:integer');
      if (invalid.length && process.env.NODE_ENV !== 'production')
        console.warn('SCHEMA_FORM_WARNING.FORM_TYPE_TEST_INVALID', {
          definition,
          invalid,
        });
    }
    const normalized = {
      test: isFunction(test) ? test : fieldInputTestFnFactory(test),
      Component: withFieldInputErrorBoundary(Component),
    };
    cache.set(definition, normalized);
    result.push(normalized);
  }
  return result;
};

const fieldInputTestFnFactory = (
  test: FieldInputTestObject,
): FieldInputTestFn => {
  const keys = Object.keys(test).filter((key) =>
    testKeys.includes(key),
  ) as (keyof FieldInputTestObject)[];
  return (hint) =>
    keys.every((key) => {
      const reference: unknown = test[key],
        subject: unknown = hint[key];
      return isArray(reference)
        ? reference.includes(subject)
        : reference === subject;
    });
};
