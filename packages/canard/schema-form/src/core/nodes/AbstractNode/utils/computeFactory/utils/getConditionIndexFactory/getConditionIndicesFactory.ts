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

type GetConditionIndices = Fn<[dependencies: unknown[]], number[]>;

/**
 * Creates a factory function that generates condition index calculators for JSON schemas.
 * This function returns all indices of schemas whose conditions are satisfied.
 *
 * @param jsonSchema - The JSON schema object containing conditional schemas
 * @returns A curried function that creates condition index calculators
 *
 * @example
 * const factory = getConditionIndicesFactory(jsonSchema);
 * const getIndices = factory(pathManager, 'oneOf', 'if');
 * const indices = getIndices([dependency1, dependency2]); // Returns [0, 2] if conditions at indices 0 and 2 are met
 */
export const getConditionIndicesFactory =
  (jsonSchema: JsonSchemaWithVirtual) =>
  /**
   * Creates a condition index calculation function for the specified field and condition type.
   * The returned function evaluates all conditions and returns an array of indices
   * where conditions are satisfied.
   *
   * @param pathManager - Path manager for resolving dependency paths
   * @param fieldName - Schema field containing conditional schemas (e.g., 'oneOf', 'anyOf', 'allOf')
   * @param conditionField - Condition type to evaluate ('if', 'ifNot', 'ifAny', 'ifAll')
   * @returns A function that returns all matching schema indices, or undefined if no conditions exist
   *
   * @example
   * // For a schema with multiple oneOf conditions:
   * const getIndices = factory(pathManager, 'oneOf', 'if');
   * // If conditions at indices 0, 2, and 3 are satisfied:
   * getIndices(dependencies); // Returns [0, 2, 3]
   */
  (
    pathManager: PathManager,
    fieldName: string,
    conditionField: ConditionIndexName,
  ): GetConditionIndices | undefined => {
    if (jsonSchema.type !== 'object') return undefined;

    const conditionSchemas: PartialJsonSchema[] = jsonSchema[fieldName];
    if (!isArray(conditionSchemas)) return undefined;

    const { expressions, schemaIndices } = extractConditionInfo(
      conditionSchemas,
      conditionField,
      pathManager,
    );

    const length = expressions.length;
    if (length === 0) return undefined;

    const lines = new Array<string>(length);
    for (let i = 0, exp = expressions[0]; i < length; i++, exp = expressions[i])
      lines[i] = `if(${exp}) indices[indices.length] = ${schemaIndices[i]};`;

    try {
      return new Function(
        'dependencies',
        `const indices = [];\n${lines.join('\n')}\nreturn indices;`,
      ) as GetConditionIndices;
    } catch (error) {
      throw new JsonSchemaError(
        'CONDITION_INDICES',
        `Failed to create dynamic function: ${fieldName} -> '${expressions.join(', ')}'`,
        { fieldName, expressions, lines, error },
      );
    }
  };
