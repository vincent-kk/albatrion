import { isArray, isObject } from '@winglet/common-utils/filter';
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

  // Which applicator keywords are actually present? Iterate the node's own keys
  // (usually just `type` + a validator or two) instead of every descriptor.
  let matched: OrderedKeywordDescriptor[] | null = null;
  for (const key in dict) {
    const descriptor = keywordMap.get(key);
    if (descriptor !== undefined) (matched ??= []).push(descriptor);
  }
  if (matched === null) return entries;
  if (matched.length > 1) matched.sort(byOrder);

  const childDepth = depth + 1;
  for (let m = 0, ml = matched.length; m < ml; m++) {
    const { keyword, kind } = matched[m];
    const node = dict[keyword];

    switch (kind) {
      case 'schema': {
        if (isObject(node))
          entries.push({
            schema: node,
            path: path + $.Separator + keyword,
            keyword,
            dataPath,
            depth: childDepth,
          } as unknown as Entry);
        break;
      }
      case 'schemaList': {
        if (!isArray(node)) break;
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
        break;
      }
      case 'schemaMap':
      case 'objectMap': {
        if (!isObject(node)) break;
        const contributesDataPath = kind === 'objectMap';
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
        break;
      }
      case 'items': {
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
        break;
      }
    }
  }

  return entries;
};
