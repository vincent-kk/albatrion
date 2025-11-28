import { JsonSchemaError } from '@/schema-form/errors';

/**
 * Intersects two optional const values, ensuring they are identical or throwing an error.
 *
 * This function handles the intersection of const values in JSON Schema.
 * Since const values represent exact matches, two different const values
 * cannot be intersected and will result in an error.
 *
 * @param baseConst - The base const value (optional)
 * @param sourceConst - The source const value (optional)
 * @returns The const value if both are undefined or equal, undefined if only one is defined
 * @throws {JsonSchemaError} When both values are defined but different
 */
export function intersectConst<T>(
  baseConst?: T,
  sourceConst?: T,
): T | undefined {
  if (baseConst === undefined && sourceConst === undefined) return undefined;
  if (baseConst === undefined) return sourceConst;
  if (sourceConst === undefined) return baseConst;
  if (baseConst !== sourceConst)
    throw new JsonSchemaError(
      'CONFLICTING_CONST_VALUES',
      `Conflicting const values: ${baseConst} vs ${sourceConst}`,
    );
  return baseConst;
}
