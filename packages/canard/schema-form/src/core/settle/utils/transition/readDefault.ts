import { hasOwnProperty } from '@winglet/common-utils/lib';
import type { SchemaNodeRecord } from '../../../record';
import { getControlLayers } from '../controls/getControlLayers';

/** Default sources from most specific to least specific. */
const DEFAULT_LAYERS = ['node', 'children', 'fragment'] as const;

/**
 * Select a new occurrence's authored default by reserved-layer priority.
 * @param node - Occurrence with its final active effective schema
 * @param selectedDeclarationIds - Declarations selected in the final shape
 * @returns The authored value or undefined when no layer supplies one
 */
export const readDefault = <Self extends SchemaNodeRecord<Self>>(
  node: Self, selectedDeclarationIds: ReadonlyMap<Self, readonly number[]>,
): unknown => {
  const groups = getControlLayers(node, selectedDeclarationIds);
  for (const layer of DEFAULT_LAYERS)
    for (let index = groups.length - 1; index >= 0; index--) {
      const group = groups[index];
      if (group.layer === layer && hasOwnProperty(group.controls, 'default'))
        return Reflect.get(group.controls, 'default');
    }
  const schema = node.schema.schema;
  if (schema === null || typeof schema !== 'object') return undefined;
  return hasOwnProperty(schema, 'default') ? schema.default : undefined;
};
