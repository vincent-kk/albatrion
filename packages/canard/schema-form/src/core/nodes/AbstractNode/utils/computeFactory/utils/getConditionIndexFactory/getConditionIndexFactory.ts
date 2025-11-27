import { isArray } from '@winglet/common-utils/filter';

import type { Fn } from '@aileron/declare';

import { JsonSchemaError } from '@/schema-form/errors';
import type {
  JsonSchemaType,
  JsonSchemaWithVirtual,
  PartialJsonSchema,
} from '@/schema-form/types';

import type { PathManager } from '../getPathManager';
import type { ConditionIndexName } from '../type';
import { extractConditionInfo } from './utils/extractConditionInfo';
import { getSimpleEquality } from './utils/getSimpleEquality';

type GetConditionIndex = Fn<[dependencies: unknown[]], number>;

/**
 * Creates a function to calculate the index of condition schema.
 * @param jsonSchema - JSON schema
 * @returns Condition index factory function
 */
export const getConditionIndexFactory =
  (type: JsonSchemaType, jsonSchema: JsonSchemaWithVirtual) =>
  /**
   * Returns a condition index calculation function for the given dependency paths and field name.
   * @param dependencyPaths - Dependency path array
   * @param fieldName - Field name to calculate index for (oneOf, anyOf, etc.)
   * @param conditionField - Field name where condition is specified (if, ifNot, ifAny, ifAll)
   * @returns Condition index calculation function or undefined
   */
  (
    pathManager: PathManager,
    fieldName: string,
    conditionField: ConditionIndexName,
  ): GetConditionIndex | undefined => {
    if (type !== 'object') return undefined;

    const conditionSchemas: PartialJsonSchema[] = jsonSchema[fieldName];
    if (!isArray(conditionSchemas)) return undefined;

    const { expressions, schemaIndices } = extractConditionInfo(
      conditionSchemas,
      conditionField,
      pathManager,
    );

    const length = expressions.length;
    if (length === 0) return undefined;

    const simpleEquality = getSimpleEquality(expressions, schemaIndices);

    if (simpleEquality) return simpleEquality;

    const lines = new Array<string>(length);
    for (let i = 0, exp = expressions[0]; i < length; i++, exp = expressions[i])
      lines[i] = `if(${exp}) return ${schemaIndices[i]};`;

    try {
      return new Function(
        'dependencies',
        `${lines.join('\n')}\nreturn -1;`,
      ) as GetConditionIndex;
    } catch (error) {
      throw new JsonSchemaError(
        'CONDITION_INDEX',
        `Failed to create dynamic function: ${fieldName} -> '${expressions.join(', ')}'`,
        { fieldName, expressions, lines, error },
      );
    }
  };
