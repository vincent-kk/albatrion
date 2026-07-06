import { isArray, isObject } from '@winglet/common-utils/filter';
import { hasOwnProperty } from '@winglet/common-utils/lib';
import { JSONPointer as $, escapeSegment } from '@winglet/json/pointer';

import type { Dictionary } from '@aileron/declare';

import type { SchemaEntry } from '../type';
import {
  DEFAULT_KEYWORD_MAP,
  type KeywordMap,
  type OrderedKeywordDescriptor,
} from './keywordDescriptors';

const byOrder = (a: OrderedKeywordDescriptor, b: OrderedKeywordDescriptor) =>
  a.order - b.order;

/**
 * Pushes the single subschema of a `schema`-kind keyword (`not`, `if`,
 * `additionalProperties`, …) onto `entries` when it is a valid object node.
 */
const pushSchemaChild = <Entry extends SchemaEntry>(
  entries: Entry[],
  node: unknown,
  keyword: string,
  path: string,
  dataPath: string,
  childDepth: number,
): void => {
  if (isObject(node))
    entries.push({
      schema: node,
      path: path + $.Separator + keyword,
      keyword,
      dataPath,
      depth: childDepth,
    } as unknown as Entry);
};

/**
 * Pushes each object element of a `schemaList`-kind keyword (`allOf`, `anyOf`,
 * `oneOf`); the array index becomes both a `path` segment and the `variant`.
 */
const pushSchemaListChildren = <Entry extends SchemaEntry>(
  entries: Entry[],
  node: unknown,
  keyword: string,
  path: string,
  dataPath: string,
  childDepth: number,
): void => {
  if (!isArray(node)) return;
  for (let i = 0, l = node.length; i < l; i++) {
    const child = node[i];
    if (!isObject(child)) continue;
    entries.push({
      schema: child,
      path: path + $.Separator + keyword + $.Separator + i,
      keyword,
      variant: i,
      dataPath,
      depth: childDepth,
    } as unknown as Entry);
  }
};

/**
 * Pushes each object value of a map-kind keyword. `schemaMap` (`$defs`,
 * `definitions`, …) and `objectMap` (`properties`) differ only in whether the
 * RFC-6901-escaped key also contributes a `dataPath` segment, selected by
 * `contributesDataPath`.
 */
const pushMapChildren = <Entry extends SchemaEntry>(
  entries: Entry[],
  node: unknown,
  keyword: string,
  path: string,
  dataPath: string,
  childDepth: number,
  contributesDataPath: boolean,
): void => {
  if (!isObject(node)) return;
  const map = node as Dictionary;
  const keys = Object.keys(map);
  for (let i = 0, l = keys.length; i < l; i++) {
    const key = keys[i];
    const child = map[key];
    if (!isObject(child)) continue;
    const escapedKey = escapeSegment(key);
    entries.push({
      schema: child,
      path: path + $.Separator + keyword + $.Separator + escapedKey,
      keyword,
      variant: key,
      dataPath: contributesDataPath
        ? dataPath + $.Separator + escapedKey
        : dataPath,
      depth: childDepth,
    } as unknown as Entry);
  }
};

/**
 * Pushes the children of an `items`-kind keyword (`items`, `prefixItems`):
 * tuple form (array — each element adds its index to both `path` and
 * `dataPath`) or single-subschema form (object).
 */
const pushItemsChildren = <Entry extends SchemaEntry>(
  entries: Entry[],
  node: unknown,
  keyword: string,
  path: string,
  dataPath: string,
  childDepth: number,
): void => {
  if (isArray(node)) {
    for (let i = 0, l = node.length; i < l; i++) {
      const child = node[i];
      if (!isObject(child)) continue;
      entries.push({
        schema: child,
        path: path + $.Separator + keyword + $.Separator + i,
        keyword,
        variant: i,
        dataPath: dataPath + $.Separator + i,
        depth: childDepth,
      } as unknown as Entry);
    }
  } else if (isObject(node)) {
    entries.push({
      schema: node,
      path: path + $.Separator + keyword,
      keyword,
      dataPath,
      depth: childDepth,
    } as unknown as Entry);
  }
};

/**
 * Returns the child nodes of a given node as an array of SchemaEntry, ordered
 * so they can be pushed onto the traversal stack in reverse for DFS.
 *
 * Discovery is driven by iterating the node's OWN keys against `keywordMap`
 * (defaults to {@link DEFAULT_KEYWORD_MAP}) rather than probing every keyword
 * against the node — most nodes are leaves that carry no applicator keyword, so
 * this avoids a fixed per-node cost. Matched keywords are re-ordered by their
 * descriptor position so the observable traversal sequence is unchanged. Every
 * child subschema is validated to be a non-null object before it is emitted, so
 * boolean/primitive/`null` subschemas and malformed containers never produce
 * garbage entries.
 *
 * @param entry The schema entry to extract child nodes from
 * @param keywordMap keyword → descriptor lookup (carries traversal order)
 * @returns Array of child schema entries
 */
export const getStackEntriesForNode = <Entry extends SchemaEntry>(
  entry: Entry,
  keywordMap: KeywordMap = DEFAULT_KEYWORD_MAP,
): Entry[] => {
  const { schema, path, dataPath, depth } = entry;
  const entries: Entry[] = [];
  // Non-object schemas (boolean/primitive/null root or mutation result) have no
  // children; this also makes the `for..in` below safe.
  if (schema === null || typeof schema !== 'object') return entries;
  const dict = schema as Dictionary;

  // Which applicator keywords are actually present? Iterate the node's keys
  // (usually just `type` + a validator or two) instead of probing every
  // descriptor. `for..in` avoids allocating a keys array; hasOwnProperty is
  // called ONLY on the rare applicator match, both to keep the previous
  // own-only semantics (for..in also yields inherited enumerable keys) and
  // because non-applicator keys skip the check entirely.
  let matched: OrderedKeywordDescriptor[] | null = null;
  for (const key in dict) {
    const descriptor = keywordMap.get(key);
    if (descriptor !== undefined && hasOwnProperty(dict, key))
      (matched ??= []).push(descriptor);
  }
  if (matched === null) return entries;
  if (matched.length > 1) matched.sort(byOrder);

  const childDepth = depth + 1;
  for (let m = 0, ml = matched.length; m < ml; m++) {
    const { keyword, kind } = matched[m];
    const node = dict[keyword];

    switch (kind) {
      case 'schema':
        pushSchemaChild(entries, node, keyword, path, dataPath, childDepth);
        break;
      case 'schemaList':
        pushSchemaListChildren(
          entries,
          node,
          keyword,
          path,
          dataPath,
          childDepth,
        );
        break;
      case 'schemaMap':
      case 'objectMap':
        pushMapChildren(
          entries,
          node,
          keyword,
          path,
          dataPath,
          childDepth,
          kind === 'objectMap',
        );
        break;
      case 'items':
        pushItemsChildren(entries, node, keyword, path, dataPath, childDepth);
        break;
    }
  }

  return entries;
};
