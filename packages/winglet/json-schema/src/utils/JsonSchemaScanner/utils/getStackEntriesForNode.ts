import { isArray, isObject } from '@winglet/common-utils';

import type { Dictionary } from '@aileron/declare';

import type { UnknownSchema } from '@/json-schema/types/jsonSchema';

import type { SchemaEntry } from '../type';
import { $DEFS, DEFINITIONS } from './isDefinitionSchema';

const CONDITIONAL_KEYWORDS = ['not', 'if', 'then', 'else'] as const;
const COMPOSITION_KEYWORDS = ['allOf', 'anyOf', 'oneOf'] as const;

/**
 * 주어진 노드의 하위 노드들을 SchemaEntry 배열로 반환합니다.
 * 스택 기반 순회를 위해 역순으로 스택에 추가될 수 있도록 순서를 맞춥니다.
 * @param entry 하위 노드를 추출할 스키마 항목
 * @returns 하위 스키마 항목 배열
 */
export const getStackEntriesForNode = (entry: SchemaEntry): SchemaEntry[] => {
  const { schema, path, dataPath, depth } = entry;
  const entries: SchemaEntry[] = [];

  if ($DEFS in schema)
    handleDefinitionsNode(schema, entries, path, dataPath, depth, $DEFS);

  if (DEFINITIONS in schema)
    handleDefinitionsNode(schema, entries, path, dataPath, depth, DEFINITIONS);

  if ('additionalProperties' in schema && isObject(schema.additionalProperties))
    handleAdditionalProperties(schema, entries, path, dataPath, depth);

  handleConditionalNode(schema, entries, path, dataPath, depth);

  handleCompositionNode(schema, entries, path, dataPath, depth);

  if (schema.type === 'array' && 'items' in schema)
    handleArrayItems(schema, entries, path, dataPath, depth);

  if (schema.type === 'object' && 'properties' in schema)
    handleObjectProperties(schema, entries, path, dataPath, depth);

  return entries;
};

/**
 * definitions 노드의 하위 스키마들을 처리하여 스택 항목에 추가합니다.
 * @param schema 스키마 객체
 * @param entries 추가할 스택 항목 배열
 * @param path 현재 경로
 * @param depth 현재 깊이
 */
const handleDefinitionsNode = (
  schema: UnknownSchema,
  entries: SchemaEntry[],
  path: string,
  dataPath: string,
  depth: number,
  fieldName: string,
) => {
  const definitions = schema[fieldName];
  const keys = Object.keys(definitions);
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    entries.push({
      schema: definitions[key],
      path: `${path}/${fieldName}/${key}`,
      dataPath,
      depth: depth + 1,
    });
  }
};

/**
 * 조건부 노드(not, if, then, else)의 하위 스키마들을 처리하여 스택 항목에 추가합니다.
 * @param schema 스키마 객체
 * @param entries 추가할 스택 항목 배열
 * @param path 현재 경로
 * @param depth 현재 깊이
 */
const handleConditionalNode = (
  schema: UnknownSchema,
  entries: SchemaEntry[],
  path: string,
  dataPath: string,
  depth: number,
) => {
  for (let i = 0; i < CONDITIONAL_KEYWORDS.length; i++) {
    const keyword = CONDITIONAL_KEYWORDS[i];
    const conditionalNode = schema[keyword];
    if (!conditionalNode || typeof conditionalNode !== 'object') continue;
    entries.push({
      schema: conditionalNode,
      path: `${path}/${keyword}`,
      dataPath,
      depth: depth + 1,
    });
  }
};

/**
 * 결합 노드(allOf, anyOf, oneOf)의 하위 스키마들을 처리하여 스택 항목에 추가합니다.
 * @param schema 스키마 객체
 * @param entries 추가할 스택 항목 배열
 * @param path 현재 경로
 * @param depth 현재 깊이
 */
const handleCompositionNode = (
  schema: UnknownSchema,
  entries: SchemaEntry[],
  path: string,
  dataPath: string,
  depth: number,
) => {
  for (let i = 0; i < COMPOSITION_KEYWORDS.length; i++) {
    const keyword = COMPOSITION_KEYWORDS[i];
    const compositionNode = schema[keyword];
    if (!compositionNode || !isArray(compositionNode)) continue;
    for (let j = 0; j < compositionNode.length; j++) {
      entries.push({
        schema: compositionNode[j],
        path: `${path}/${keyword}/${j}`,
        dataPath,
        depth: depth + 1,
      });
    }
  }
};

/**
 * additionalProperties 노드의 하위 스키마를 처리하여 스택 항목에 추가합니다.
 * @param schema 스키마 객체
 * @param entries 추가할 스택 항목 배열
 * @param path 현재 경로
 * @param depth 현재 깊이
 */
const handleAdditionalProperties = (
  schema: UnknownSchema,
  entries: SchemaEntry[],
  path: string,
  dataPath: string,
  depth: number,
) => {
  entries.push({
    schema: schema.additionalProperties,
    path: `${path}/additionalProperties`,
    dataPath,
    depth: depth + 1,
  });
};

/**
 * 배열 타입 스키마의 items 노드를 처리하여 스택 항목에 추가합니다.
 * @param schema 스키마 객체
 * @param entries 추가할 스택 항목 배열
 * @param path 현재 경로
 * @param depth 현재 깊이
 */
const handleArrayItems = (
  schema: UnknownSchema,
  entries: SchemaEntry[],
  path: string,
  dataPath: string,
  depth: number,
) => {
  const items = schema.items;
  if (isArray(items)) {
    for (let i = 0; i < items.length; i++) {
      entries.push({
        schema: items[i],
        path: `${path}/items/${i}`,
        dataPath: `${dataPath}/${i}`,
        depth: depth + 1,
      });
    }
  } else {
    entries.push({
      schema: items,
      path: `${path}/items`,
      dataPath,
      depth: depth + 1,
    });
  }
};

/**
 * 객체 타입 스키마의 properties 노드를 처리하여 스택 항목에 추가합니다.
 * @param schema 스키마 객체
 * @param entries 추가할 스택 항목 배열
 * @param path 현재 경로
 * @param dataPath 현재 데이터 경로
 * @param depth 현재 깊이
 */
const handleObjectProperties = (
  schema: UnknownSchema,
  entries: SchemaEntry[],
  path: string,
  dataPath: string,
  depth: number,
) => {
  const properties = schema.properties as Dictionary;
  const keys = Object.keys(properties);
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    entries.push({
      schema: properties[key],
      path: `${path}/properties/${key}`,
      dataPath: `${dataPath}/${key}`,
      depth: depth + 1,
    });
  }
};
