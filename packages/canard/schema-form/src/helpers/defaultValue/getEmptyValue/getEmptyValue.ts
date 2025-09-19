import type { ArrayValue, ObjectValue } from '@/schema-form/types';

/**
 * Returns default value from JSON Schema's default property or based on type
 * @param type - JSON Schema type
 * @returns Empty value
 */
export const getEmptyValue = (
  type?: string,
): ArrayValue | ObjectValue | undefined => {
  if (type === 'array') return [];
  if (type === 'object') return {};
  return undefined;
};
