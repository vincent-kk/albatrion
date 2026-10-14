import { isArray } from '@winglet/common-utils/filter';

import type { BlueprintNode } from '../../../../type';

/**
 * Recover the authored slot location when a referenced item template is shared.
 * @param template - Array declaration owning the requested position
 * @param index - Position whose prefix or tail schema supplied the item
 * @param node - Selected item template, possibly reused from another host
 * @returns Authored schema path for this array binding
 */
export const getItemSchemaPath = (
  template: BlueprintNode,
  index: number,
  node: BlueprintNode,
): string => {
  const prefix = template.prefixItems?.[index] === node;
  for (const declaration of template.declarations) {
    const schema = declaration.schema;
    if (typeof schema !== 'object') continue;
    if (prefix) {
      if (isArray(schema.prefixItems) && index < schema.prefixItems.length)
        return `${declaration.schemaPath}/prefixItems/${index}`;
      if (isArray(schema.items) && index < schema.items.length)
        return `${declaration.schemaPath}/items/${index}`;
    } else {
      if (
        schema.items !== null &&
        typeof schema.items === 'object' &&
        !isArray(schema.items)
      )
        return `${declaration.schemaPath}/items`;
      if (
        isArray(schema.items) &&
        schema.prefixItems === undefined &&
        schema.additionalItems !== null &&
        typeof schema.additionalItems === 'object' &&
        !isArray(schema.additionalItems)
      )
        return `${declaration.schemaPath}/additionalItems`;
    }
  }
  return node.schemaPath;
};
