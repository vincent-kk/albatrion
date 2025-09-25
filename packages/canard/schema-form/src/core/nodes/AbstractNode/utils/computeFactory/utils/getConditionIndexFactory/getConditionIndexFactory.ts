import { isArray } from '@winglet/common-utils/filter';

import type { Fn } from '@aileron/declare';

import { JsonSchemaError } from '@/schema-form/errors';
import type {
  JsonSchemaWithVirtual,
  PartialJsonSchema,
} from '@/schema-form/types';

import type { PathManager } from '../getPathManager';
import { type ConditionIndexName } from '../type';
import { extractConditionInfo } from './utils/extractConditionInfo';
import { getSimpleEquality } from './utils/getSimpleEquality';

type GetConditionIndex = Fn<[dependencies: unknown[]], number>;

/**
 * Creates a function to calculate the index of condition schema.
 * @param jsonSchema - JSON schema
 * @returns Condition index factory function
 */
export const getConditionIndexFactory =
  (jsonSchema: JsonSchemaWithVirtual) =>
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
    // Conditional Index is only available for object schemas(oneOf, anyOf, etc.)
    if (jsonSchema.type !== 'object') return undefined;

    const conditionSchemas: PartialJsonSchema[] = jsonSchema[fieldName];
    if (!isArray(conditionSchemas)) return undefined;

    const { expressions, schemaIndices } = extractConditionInfo(
      conditionSchemas,
      conditionField,
      pathManager,
    );

    if (expressions.length === 0) return undefined;

    const simpleEquality = getSimpleEquality(expressions, schemaIndices);

    if (simpleEquality) return simpleEquality;

    // General conditional expression handling: dynamic function generation through Function constructor
    const lines = new Array<string>(expressions.length);
    for (let i = 0, l = expressions.length; i < l; i++)
      lines[i] = `if(${expressions[i]}) return ${schemaIndices[i]};`;

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
