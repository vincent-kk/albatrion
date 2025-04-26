import { isArray } from '@winglet/common-utils';

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

  if ('$defs' in node) handleDefsNode(node, entries, path, depth);

  if ('definitions' in node) handleDefinitionsNode(node, entries, path, depth);

  if ('additionalProperties' in node)
    handleAdditionalProperties(node, entries, path, depth);

  handleChunkNode(node, entries, path, depth);

  handleConditionNode(node, entries, path, depth);

  if (node.type === 'array' && 'items' in node)
    handleArrayItems(node, entries, path, depth);

  if (node.type === 'object' && 'properties' in node)
    handleObjectProperties(node, entries, path, depth);

  return entries;
};

const handleDefsNode = (
  node: UnknownSchema,
  entries: StackEntry[],
  path: string,
  depth: number,
) => {
  const $defs = node.$defs;
  const keys = Object.keys($defs);
  for (let i = keys.length - 1; i >= 0; i--) {
    const key = keys[i];
    entries.push({
      node: $defs[key],
      path: `${path}/$defs/${key}`,
      depth: depth + 1,
    });
  }
};

const handleDefinitionsNode = (
  node: UnknownSchema,
  entries: StackEntry[],
  path: string,
  depth: number,
) => {
  const definitions = node.definitions;
  const keys = Object.keys(definitions);
  for (let i = keys.length - 1; i >= 0; i--) {
    const key = keys[i];
    entries.push({
      node: definitions[key],
      path: `${path}/definitions/${key}`,
      depth: depth + 1,
    });
  }
};

const handleChunkNode = (
  node: UnknownSchema,
  entries: StackEntry[],
  path: string,
  depth: number,
) => {
  for (let i = 0; i < CONDITIONAL_KEYWORDS.length; i++) {
    const keyword = CONDITIONAL_KEYWORDS[i];
    const chunkNode = node[keyword];
    if (!chunkNode || typeof chunkNode !== 'object') continue;
    entries.push({
      node: chunkNode,
      path: `${path}/${keyword}`,
      depth: depth + 1,
    });
  }
};

const handleConditionNode = (
  node: UnknownSchema,
  entries: StackEntry[],
  path: string,
  depth: number,
) => {
  for (let i = 0; i < COMPOSITION_KEYWORDS.length; i++) {
    const keyword = COMPOSITION_KEYWORDS[i];
    const conditionNode = node[keyword];
    if (!conditionNode || !isArray(conditionNode)) continue;
    for (let j = conditionNode.length - 1; j >= 0; j--) {
      entries.push({
        node: conditionNode[j],
        path: `${path}/${keyword}/${j}`,
        depth: depth + 1,
      });
    }
  }
};

const handleAdditionalProperties = (
  node: UnknownSchema,
  entries: StackEntry[],
  path: string,
  depth: number,
) => {
  entries.push({
    node: node.additionalProperties,
    path: `${path}/additionalProperties`,
    depth: depth + 1,
  });
};

const handleArrayItems = (
  node: UnknownSchema,
  entries: StackEntry[],
  path: string,
  depth: number,
) => {
  const items = node.items;
  if (isArray(items)) {
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
};

const handleObjectProperties = (
  node: UnknownSchema,
  entries: StackEntry[],
  path: string,
  depth: number,
) => {
  const properties = node.properties;
  const keys = Object.keys(properties);
  for (let i = keys.length - 1; i >= 0; i--) {
    const key = keys[i];
    entries.push({
      node: properties[key],
      path: `${path}/properties/${key}`,
      depth: depth + 1,
    });
  }
};
