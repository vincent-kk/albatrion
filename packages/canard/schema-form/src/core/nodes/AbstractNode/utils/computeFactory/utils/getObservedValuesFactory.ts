import { isArray, isString } from '@winglet/common-utils/filter';

import type { Fn } from '@aileron/declare';

import type { JsonSchemaWithVirtual } from '@/schema-form/types';

import type { PathManager } from './getPathManager';
import { ALIAS, type ObservedFieldName } from './type';

type GetObservedValues = Fn<[dependencies: unknown[]], unknown[]>;

/**
 * Creates a function to calculate observed values for a specific field in a JSON schema.
 * @param schema - JSON schema
 * @returns Observed values factory function
 */
export const getObservedValuesFactory =
  (schema: JsonSchemaWithVirtual) =>
  /**
   * Returns an observed values calculation function for the given dependency paths and field name.
   * @param dependencyPaths - Dependency path array
   * @param fieldName - Field name to observe
   * @returns Function that returns observed values array from dependency array, or undefined
   */
  (
    pathManager: PathManager,
    fieldName: ObservedFieldName,
  ): GetObservedValues | undefined => {
    // Extract expression from `computed.[<fieldName>]` or `&[<fieldName>]` field
    const watch = schema?.computed?.[fieldName] ?? schema?.[ALIAS + fieldName];

    // Return undefined if no valid watch value exists
    if (!watch || !(isString(watch) || isArray(watch))) return;

    // Convert single watch value to array for processing
    const watchValues = isArray(watch) ? watch : [watch];
    const watchValueIndexes = [] as number[];

    // Add each watch path to dependencyPaths and store indices
    for (let i = 0, l = watchValues.length; i < l; i++) {
      const path = watchValues[i];
      pathManager.set(path);
      watchValueIndexes.push(pathManager.findIndex(path));
    }

    if (watchValueIndexes.length === 0) return;

    // Dynamically create observed values calculation function
    return new Function(
      'dependencies',
      `const indexes = [${watchValueIndexes.join(',')}];
       const result = new Array(indexes.length);
       for (let i = 0, l = indexes.length; i < l; i++)
         result[i] = dependencies[indexes[i]];
       return result;`,
    ) as GetObservedValues;
  };
