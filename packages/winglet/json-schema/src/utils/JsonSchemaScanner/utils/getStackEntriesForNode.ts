import { isArray, isObject } from '@winglet/common-utils/filter';
import { JSONPointer, escapeSegment } from '@winglet/json/pointer';

import type { Dictionary } from '@aileron/declare';

import type { UnknownSchema } from '@/json-schema/types/jsonSchema';

import type { SchemaEntry } from '../type';
import { $DEFS, DEFINITIONS } from './isDefinitionSchema';

const CONDITIONAL_KEYWORDS = ['not', 'if', 'then', 'else'] as const;
const COMPOSITION_KEYWORDS = ['allOf', 'anyOf', 'oneOf'] as const;

const Separator = JSONPointer.Separator;

/**
 * Returns the child nodes of a given node as an array of SchemaEntry.
 * Orders them properly so they can be added to the stack in reverse order for stack-based traversal.
 * @param entry The schema entry to extract child nodes from
 * @returns Array of child schema entries
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
 * Processes child schemas of definitions node and adds them to stack entries.
 * @param schema Schema object
 * @param entries Array of stack entries to add to
 * @param path Current path
 * @param dataPath Current data path
 * @param depth Current depth
 * @param fieldName Field name (definitions or $defs)
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
  for (let i = 0, l = keys.length; i < l; i++) {
    const key = keys[i];
    entries.push({
      schema: definitions[key],
      path: path + Separator + fieldName + Separator + key,
      dataPath,
      depth: depth + 1,
    });
  }
};

/**
 * Processes child schemas of conditional nodes (not, if, then, else) and adds them to stack entries.
 * @param schema Schema object
 * @param entries Array of stack entries to add to
 * @param path Current path
 * @param dataPath Current data path
 * @param depth Current depth
 */
const handleConditionalNode = (
  schema: UnknownSchema,
  entries: SchemaEntry[],
  path: string,
  dataPath: string,
  depth: number,
) => {
  for (let i = 0, l = CONDITIONAL_KEYWORDS.length; i < l; i++) {
    const keyword = CONDITIONAL_KEYWORDS[i];
    const conditionalNode = schema[keyword];
    if (!conditionalNode || typeof conditionalNode !== 'object') continue;
    entries.push({
      schema: conditionalNode,
      path: path + Separator + keyword,
      dataPath,
      depth: depth + 1,
    });
  }
};

/**
 * Processes child schemas of composition nodes (allOf, anyOf, oneOf) and adds them to stack entries.
 * @param schema Schema object
 * @param entries Array of stack entries to add to
 * @param path Current path
 * @param dataPath Current data path
 * @param depth Current depth
 */
const handleCompositionNode = (
  schema: UnknownSchema,
  entries: SchemaEntry[],
  path: string,
  dataPath: string,
  depth: number,
) => {
  for (let i = 0, il = COMPOSITION_KEYWORDS.length; i < il; i++) {
    const keyword = COMPOSITION_KEYWORDS[i];
    const compositionNode = schema[keyword];
    if (!compositionNode || !isArray(compositionNode)) continue;
    for (let j = 0, jl = compositionNode.length; j < jl; j++) {
      entries.push({
        schema: compositionNode[j],
        path: path + Separator + keyword + Separator + j,
        dataPath,
        depth: depth + 1,
      });
    }
  }
};

/**
 * Processes the child schema of additionalProperties node and adds it to stack entries.
 * @param schema Schema object
 * @param entries Array of stack entries to add to
 * @param path Current path
 * @param dataPath Current data path
 * @param depth Current depth
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
    path: path + Separator + 'additionalProperties',
    dataPath,
    depth: depth + 1,
  });
};

/**
 * Processes the items node of array type schema and adds it to stack entries.
 * @param schema Schema object
 * @param entries Array of stack entries to add to
 * @param path Current path
 * @param dataPath Current data path
 * @param depth Current depth
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
    for (let i = 0, l = items.length; i < l; i++) {
      entries.push({
        schema: items[i],
        path: path + Separator + 'items' + Separator + i,
        dataPath: dataPath + Separator + i,
        depth: depth + 1,
      });
    }
  } else {
    entries.push({
      schema: items,
      path: path + Separator + 'items',
      dataPath,
      depth: depth + 1,
    });
  }
};

/**
 * Processes the properties node of object type schema and adds it to stack entries.
 * @param schema Schema object
 * @param entries Array of stack entries to add to
 * @param path Current path
 * @param dataPath Current data path
 * @param depth Current depth
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
  for (let i = 0, l = keys.length; i < l; i++) {
    const key = keys[i];
    const escapedKey = escapeSegment(key);
    entries.push({
      schema: properties[key],
      path: path + Separator + 'properties' + Separator + escapedKey,
      dataPath: dataPath + Separator + escapedKey,
      depth: depth + 1,
    });
  }
};
