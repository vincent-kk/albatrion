import { isArray } from '@winglet/common-utils/filter';

import type { ReservedShallowType } from '@/schema-form/constants/reservedSchemaKeys';

import { isStringList } from './isStringList';

/**
 * Match a canonical shallow contract without evaluating or inspecting payloads.
 * @param value - Defined reserved value at the load boundary.
 * @param shape - Contract selected from the reserved vocabulary.
 * @returns Whether the envelope or scalar has the accepted shallow shape.
 */
export const matchesReservedShallowType = (
  value: unknown,
  shape: ReservedShallowType,
): boolean => {
  switch (shape) {
    case 'unknown':
      return true;
    case 'boolean':
      return typeof value === 'boolean';
    case 'boolean | string':
      return typeof value === 'boolean' || typeof value === 'string';
    case 'string':
      return typeof value === 'string';
    case 'string[]':
      return isStringList(value);
    case 'string | string[]':
      return typeof value === 'string' || isStringList(value);
    case 'array':
      return isArray(value);
    case 'object':
      return value !== null && typeof value === 'object' && !isArray(value);
    case 'function':
      return typeof value === 'function';
    case 'function | object | null':
      return (
        value === null ||
        typeof value === 'function' ||
        typeof value === 'object'
      );
  }
};
