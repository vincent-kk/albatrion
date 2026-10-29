import { isArray } from '@winglet/common-utils/filter';

import type { Optional } from '@aileron/declare';

import type { BlueprintSchemaType } from '../../../blueprint';

/**
 * Test raw membership in the current effective list without conversion.
 * @param value - Committed original input
 * @param effective - Current scalar or ordered list of accepted types; undefined for a virtual node, which never misfits
 * @param nullable - Static null permission for this node
 * @returns Whether the misfit lamp must be on
 */
export const isMisfit = (
  value: unknown,
  effective: Optional<BlueprintSchemaType>,
  nullable: boolean,
): boolean => {
  if (value === undefined || effective === undefined) return false;
  if (value === null) return !nullable;
  const kinds = typeof effective === 'string' ? [effective] : effective;
  for (let index = 0, length = kinds.length; index < length; index++) {
    if (!(index in kinds)) continue;
    switch (kinds[index]) {
      case 'string':
        if (typeof value === 'string') return false;
        break;
      case 'boolean':
        if (typeof value === 'boolean') return false;
        break;
      case 'integer':
        if (typeof value === 'number' && Number.isInteger(value)) return false;
        break;
      case 'number':
        if (typeof value === 'number' && Number.isFinite(value)) return false;
        break;
      case 'array':
        if (isArray(value)) return false;
        break;
      case 'object':
        if (value !== null && typeof value === 'object' && !isArray(value))
          return false;
        break;
    }
  }
  return true;
};
