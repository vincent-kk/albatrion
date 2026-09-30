import { isArray } from '@winglet/common-utils/filter';

import type { BlueprintSchemaType } from '../../../blueprint';

/**
 * Test raw membership in the current effective list without conversion.
 * @param value - Committed original input
 * @param effective - Current scalar or ordered list of accepted types
 * @param nullable - Static null permission for this node
 * @returns Whether the mismatch lamp must be on
 */
export const isTypeMismatch = (
  value: unknown,
  effective: BlueprintSchemaType,
  nullable: boolean,
): boolean => {
  if (value === undefined || effective === 'virtual') return false;
  if (value === null) return !nullable;
  const kinds = typeof effective === 'string' ? [effective] : effective;
  return !kinds.some((kind) => {
    switch (kind) {
      case 'string': return typeof value === 'string';
      case 'boolean': return typeof value === 'boolean';
      case 'integer': return typeof value === 'number' && Number.isInteger(value);
      case 'number': return typeof value === 'number' && Number.isFinite(value);
      case 'array': return isArray(value);
      case 'object': return value !== null && typeof value === 'object' && !isArray(value);
      case 'null': return false;
    }
  });
};
