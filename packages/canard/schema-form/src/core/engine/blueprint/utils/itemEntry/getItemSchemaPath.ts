import { isArray } from '@winglet/common-utils/filter';

import { appendSegment } from '@/schema-form/helpers/jsonPointer';

import type { BlueprintNode } from '../../types/node';

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
  const candidates = template.prefixItemCandidates?.[index];
  const prefix = candidates
    ? candidates.indexOf(node) !== -1
    : template.prefixItems?.[index] === node;
  let fallback: string | undefined;
  for (const declaration of template.declarations) {
    const schema = declaration.schema;
    if (typeof schema !== 'object') continue;
    let child: unknown;
    let path: string | undefined;
    if (prefix) {
      if (isArray(schema.prefixItems) && index < schema.prefixItems.length) {
        child = schema.prefixItems[index];
        path = appendSegment(
          appendSegment(declaration.schemaPath, 'prefixItems'),
          index,
        );
      } else if (isArray(schema.items) && index < schema.items.length) {
        child = schema.items[index];
        path = appendSegment(
          appendSegment(declaration.schemaPath, 'items'),
          index,
        );
      }
    } else {
      if (
        schema.items !== null &&
        typeof schema.items === 'object' &&
        !isArray(schema.items)
      ) {
        child = schema.items;
        path = appendSegment(declaration.schemaPath, 'items');
      }
      if (
        isArray(schema.items) &&
        schema.prefixItems === undefined &&
        schema.additionalItems !== null &&
        typeof schema.additionalItems === 'object' &&
        !isArray(schema.additionalItems)
      ) {
        child = schema.additionalItems;
        path = appendSegment(declaration.schemaPath, 'additionalItems');
      }
    }
    if (!path) continue;
    fallback ??= path;
    if (node.declarations.some((candidate) => candidate.schema === child))
      return path;
  }
  return fallback ?? node.schemaPath;
};
