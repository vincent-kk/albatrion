import {
  isArray,
  isFunction,
  isPlainObject,
} from '@winglet/common-utils/filter';
import { hasOwnProperty } from '@winglet/common-utils/lib';
import { isReactComponent } from '@winglet/react-utils/filter';

import { FormWarningCode } from '@/schema-form/errors';
import type {
  FieldInputDefinition,
  FieldInputTestFn,
  FieldInputTestObject,
} from '@/schema-form/types';

import type { NormalizedFieldInputDefinition } from '../type';
import { withFieldInputErrorBoundary } from './withFieldInputErrorBoundary';

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
] as const satisfies readonly (keyof FieldInputTestObject)[];
/** Membership view of `testKeys` for checking arbitrary authored keys. */
const testKeySet: ReadonlySet<string> = new Set(testKeys);

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
      const invalid = (() => {
        const items = Object.keys(test);
        const result: Array<(typeof items)[number]> = [];
        iterate: for (
          let index = 0, count = items.length;
          index < count;
          index++
        ) {
          if (!(index in items)) continue;
          const item = items[index];
          const key = item;
          {
            if (!testKeySet.has(key)) result.push(item);
            continue iterate;
          }
        }
        return result;
      })();
      const types: readonly unknown[] = isArray(test.type)
        ? test.type
        : [test.type];
      if (types.includes('integer')) invalid.push('type:integer');
      if (invalid.length && process.env.NODE_ENV !== 'production')
        console.warn(FormWarningCode.FormTypeTestInvalid, {
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
  const keys = (() => {
    const items = testKeys;
    const result: Array<(typeof items)[number]> = [];
    iterate: for (let index = 0, count = items.length; index < count; index++) {
      if (!(index in items)) continue;
      const item = items[index];
      const key = item;
      {
        if (hasOwnProperty(test, key)) result.push(item);
        continue iterate;
      }
    }
    return result;
  })();
  return (hint) =>
    (() => {
      const items = keys;
      iterate: for (
        let index = 0, count = items.length;
        index < count;
        index++
      ) {
        if (!(index in items)) continue;
        const item = items[index];
        const key = item;
        {
          const reference: unknown = test[key],
            subject: unknown = hint[key];
          {
            if (
              !(isArray(reference)
                ? reference.includes(subject)
                : reference === subject)
            )
              return false;
            continue iterate;
          }
        }
      }
      return true;
    })();
};
