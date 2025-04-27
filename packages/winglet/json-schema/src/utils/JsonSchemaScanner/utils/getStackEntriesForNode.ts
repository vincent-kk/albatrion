import { isArray, isObject } from '@winglet/common-utils';

import type { UnknownSchema } from '@/json-schema/types/jsonSchema';

import type { SchemaEntry } from '../type';

/**
 * 주어진 노드의 하위 노드들을 SchemaEntry 배열로 반환합니다.
 * 스택 기반 순회를 위해 역순으로 스택에 추가될 수 있도록 순서를 맞춥니다.
 */
export const getStackEntriesForNode = (entry: SchemaEntry): SchemaEntry[] => {
  const { schema, path, depth } = entry;
  const entries: SchemaEntry[] = [];

  if ('$defs' in schema) handleDefsNode(schema, entries, path, depth);

  if ('definitions' in schema)
    handleDefinitionsNode(schema, entries, path, depth);

  if ('additionalProperties' in schema && isObject(schema.additionalProperties))
    handleAdditionalProperties(schema, entries, path, depth);

  handleConditionalNode(schema, entries, path, depth);

  handleCompositionNode(schema, entries, path, depth);

  if (schema.type === 'array' && 'items' in schema)
    handleArrayItems(schema, entries, path, depth);

  if (schema.type === 'object' && 'properties' in schema)
    handleObjectProperties(schema, entries, path, depth);

  return entries;
};

const handleDefsNode = (
  schema: UnknownSchema,
  entries: SchemaEntry[],
  path: string,
  depth: number,
) => {
  const $defs = schema.$defs;
  const keys = Object.keys($defs);
  for (let i = keys.length - 1; i >= 0; i--) {
    const key = keys[i];
    entries.push({
      schema: $defs[key],
      path: `${path}/$defs/${key}`,
      depth: depth + 1,
    });
  }
};

const handleDefinitionsNode = (
  schema: UnknownSchema,
  entries: SchemaEntry[],
  path: string,
  depth: number,
) => {
  const definitions = schema.definitions;
  const keys = Object.keys(definitions);
  for (let i = keys.length - 1; i >= 0; i--) {
    const key = keys[i];
    entries.push({
      schema: definitions[key],
      path: `${path}/definitions/${key}`,
      depth: depth + 1,
    });
  }
};

const CONDITIONAL_KEYWORDS = ['not', 'if', 'then', 'else'] as const;
const handleConditionalNode = (
  schema: UnknownSchema,
  entries: SchemaEntry[],
  path: string,
  depth: number,
) => {
  for (let i = 0; i < CONDITIONAL_KEYWORDS.length; i++) {
    const keyword = CONDITIONAL_KEYWORDS[i];
    const conditionalNode = schema[keyword];
    if (!conditionalNode || typeof conditionalNode !== 'object') continue;
    entries.push({
      schema: conditionalNode,
      path: `${path}/${keyword}`,
      depth: depth + 1,
    });
  }
};

const COMPOSITION_KEYWORDS = ['allOf', 'anyOf', 'oneOf'] as const;
const handleCompositionNode = (
  schema: UnknownSchema,
  entries: SchemaEntry[],
  path: string,
  depth: number,
) => {
  for (let i = 0; i < COMPOSITION_KEYWORDS.length; i++) {
    const keyword = COMPOSITION_KEYWORDS[i];
    const compositionNode = schema[keyword];
    if (!compositionNode || !isArray(compositionNode)) continue;
    for (let j = compositionNode.length - 1; j >= 0; j--) {
      entries.push({
        schema: compositionNode[j],
        path: `${path}/${keyword}/${j}`,
        depth: depth + 1,
      });
    }
  }
};

const handleAdditionalProperties = (
  schema: UnknownSchema,
  entries: SchemaEntry[],
  path: string,
  depth: number,
) => {
  entries.push({
    schema: schema.additionalProperties,
    path: `${path}/additionalProperties`,
    depth: depth + 1,
  });
};

const handleArrayItems = (
  schema: UnknownSchema,
  entries: SchemaEntry[],
  path: string,
  depth: number,
) => {
  const items = schema.items;
  if (isArray(items)) {
    for (let i = items.length - 1; i >= 0; i--) {
      entries.push({
        schema: items[i],
        path: `${path}/items/${i}`,
        depth: depth + 1,
      });
    }
  } else {
    entries.push({
      schema: items,
      path: `${path}/items`,
      depth: depth + 1,
    });
  }
};

const handleObjectProperties = (
  schema: UnknownSchema,
  entries: SchemaEntry[],
  path: string,
  depth: number,
) => {
  const properties = schema.properties;
  const keys = Object.keys(properties);
  for (let i = keys.length - 1; i >= 0; i--) {
    const key = keys[i];
    entries.push({
      schema: properties[key],
      path: `${path}/properties/${key}`,
      depth: depth + 1,
    });
  }
};
