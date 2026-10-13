import { isArray } from '@winglet/common-utils/filter';

import type { SchemaTypeName } from '../../../blueprint';

/** Test membership in one non-null JSON kind without coercing the input. */
export const isMember = (
  value: unknown,
  kind: Exclude<SchemaTypeName, 'null'>,
): boolean => {
  switch (kind) {
    case 'string':
      return typeof value === 'string';
    case 'number':
      return typeof value === 'number' && Number.isFinite(value);
    case 'integer':
      return typeof value === 'number' && Number.isInteger(value);
    case 'boolean':
      return typeof value === 'boolean';
    case 'object':
    case 'array':
      try {
        const array = isArray(value);
        return kind === 'array'
          ? array
          : value !== null && typeof value === 'object' && !array;
      } catch {
        return false;
      }
  }
};
