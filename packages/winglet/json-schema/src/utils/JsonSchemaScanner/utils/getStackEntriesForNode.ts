import type { UnknownSchema } from '@/json-schema/types/jsonSchema';

import {
  COMPOSITION_KEYWORDS,
  CONDITIONAL_KEYWORDS,
  type StackEntry,
} from '../type';

/**
 * 주어진 노드의 하위 노드들을 StackEntry 배열로 반환합니다.
 * 순회 순서 보장을 위해 역순으로 push할 수 있도록 배열 순서를 맞춥니다.
 */
export const getStackEntriesForNode = (
  node: UnknownSchema,
  path: string,
  depth: number,
): StackEntry[] => {
  const entries: StackEntry[] = [];

  if ((node as any).$defs) {
    const $defs = (node as any).$defs;
    for (const k of Object.keys($defs).reverse()) {
      entries.push({
        node: $defs[k],
        path: `${path}/$defs/${k}`,
        depth: depth + 1,
      });
    }
  }

  if ((node as any).definitions) {
    const definitions = (node as any).definitions;
    for (const k of Object.keys(definitions).reverse()) {
      entries.push({
        node: definitions[k],
        path: `${path}/definitions/${k}`,
        depth: depth + 1,
      });
    }
  }
  // CONDITIONAL_KEYWORDS
  for (let i = CONDITIONAL_KEYWORDS.length - 1; i >= 0; i--) {
    const keyword = CONDITIONAL_KEYWORDS[i];
    const chunk = (node as any)[keyword];
    if (chunk && typeof chunk === 'object') {
      entries.push({
        node: chunk,
        path: `${path}/${keyword}`,
        depth: depth + 1,
      });
    }
  }

  for (let i = COMPOSITION_KEYWORDS.length - 1; i >= 0; i--) {
    const keyword = COMPOSITION_KEYWORDS[i];
    const chunk = (node as any)[keyword];
    if (Array.isArray(chunk)) {
      for (let j = chunk.length - 1; j >= 0; j--) {
        entries.push({
          node: chunk[j],
          path: `${path}/${keyword}/${j}`,
          depth: depth + 1,
        });
      }
    }
  }

  if (
    (node as any).additionalProperties &&
    typeof (node as any).additionalProperties === 'object'
  ) {
    entries.push({
      node: (node as any).additionalProperties,
      path: `${path}/additionalProperties`,
      depth: depth + 1,
    });
  }

  if ((node as any).items) {
    const items = (node as any).items;
    if (Array.isArray(items)) {
      for (let i = items.length - 1; i >= 0; i--) {
        entries.push({
          node: items[i],
          path: `${path}/items/${i}`,
          depth: depth + 1,
        });
      }
    } else {
      entries.push({
        node: items,
        path: `${path}/items`,
        depth: depth + 1,
      });
    }
  }

  if ((node as any).properties) {
    const properties = (node as any).properties;
    for (const k of Object.keys(properties).reverse()) {
      entries.push({
        node: properties[k],
        path: `${path}/properties/${k}`,
        depth: depth + 1,
      });
    }
  }
  return entries;
};
