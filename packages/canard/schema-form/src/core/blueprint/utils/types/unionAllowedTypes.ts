import type { SchemaTypeName } from '../../type';

/**
 * Union type restrictions in first-seen order, absorbing integer into number.
 * @param sets - Accepted sets in declaration order
 * @returns Ordered JSON type set preserving integer only without number
 */
export const unionAllowedTypes = (
  sets: readonly (readonly SchemaTypeName[])[],
): readonly SchemaTypeName[] => {
  const result: SchemaTypeName[] = [];
  for (const set of sets)
    for (const type of set) {
      if (type === 'integer' && result.includes('number')) continue;
      if (type === 'number' && result.includes('integer')) {
        result[result.indexOf('integer')] = 'number';
        continue;
      }
      if (!result.includes(type)) result.push(type);
    }
  return result;
};
