import { JsonSchemaError } from '@/schema-form/errors';

/**
 * Const 값을 처리합니다.
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
