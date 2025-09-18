import type { AbstractNode } from '@/schema-form/core/nodes/AbstractNode';
import { JSONPointer } from '@/schema-form/helpers/jsonPointer';

/**
 * Generates a JSON Schema path segment for a node based on its scope and context.
 *
 * This function handles the complex path generation required for different JSON Schema
 * constructs like oneOf/anyOf/allOf unions, object properties, array items, and custom scopes.
 *
 * @param name - The field name or identifier for the node
 * @param scope - The JSON Schema scope type ('oneOf', 'anyOf', 'allOf', 'properties', 'items', or custom)
 * @param parentType - The parent node's type, affects path structure for union types
 * @param variant - Optional variant index for union types and array items
 *
 * @returns The constructed path segment starting with JSONPointer separator
 *
 * @example
 * ```typescript
 * // Object property in oneOf
 * getScopedSegment('username', 'oneOf', 'object', 0)
 * // Returns: '/oneOf/0/properties/username'
 *
 * // Array item in anyOf
 * getScopedSegment('item', 'anyOf', 'array', 1)
 * // Returns: '/anyOf/1/items'
 *
 * // Simple property
 * getScopedSegment('email', 'properties')
 * // Returns: '/properties/email'
 *
 * // Array items with index
 * getScopedSegment('element', 'items', 'array', 2)
 * // Returns: '/items/2'
 *
 * // Empty scope fallback
 * getScopedSegment('field', '')
 * // Returns: '/field'
 *
 * // Custom scope with variant
 * getScopedSegment('custom', 'myScope', 'object', 1)
 * // Returns: '/myScope/1/custom'
 * ```
 */
export const getScopedSegment = (
  name: string,
  scope: string,
  parentType?: AbstractNode['type'],
  variant?: number,
) => {
  if (!scope) return name;
  const index = variant !== undefined ? $S + variant : '';

  if (scope === 'oneOf' || scope === 'anyOf' || scope === 'allOf') {
    switch (parentType) {
      case 'object':
        return scope + index + $S + 'properties' + $S + name;
      case 'array':
        return scope + index + $S + 'items';
      default:
        return scope + index + $S + name;
    }
  }

  if (scope === 'properties') return 'properties' + $S + name;
  if (scope === 'items') return 'items' + index;

  if (variant !== undefined) return scope + $S + variant + $S + name;
  return scope + $S + name;
};

const $S = JSONPointer.Separator;
