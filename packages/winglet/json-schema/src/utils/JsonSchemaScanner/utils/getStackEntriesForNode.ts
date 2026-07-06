import { isArray, isObject } from '@winglet/common-utils/filter';
import { hasOwnProperty } from '@winglet/common-utils/lib';
import { JSONPointer as $, escapeSegment } from '@winglet/json/pointer';

import type { Dictionary } from '@aileron/declare';

import type { SchemaEntry } from '../type';
import { DEFAULT_KEYWORDS, type KeywordDescriptor } from './keywordDescriptors';

/**
 * Returns the child nodes of a given node as an array of SchemaEntry, ordered
 * so they can be pushed onto the traversal stack in reverse for DFS.
 *
 * The set and order of keywords descended into is driven by `descriptors`
 * (defaults to {@link DEFAULT_KEYWORDS}); every child subschema is validated to
 * be a non-null object before it is emitted, so boolean/primitive/`null`
 * subschemas and malformed containers never produce garbage entries.
 *
 * @param entry The schema entry to extract child nodes from
 * @param descriptors The keyword traversal vocabulary (order is significant)
 * @returns Array of child schema entries
 */
export const getStackEntriesForNode = <Entry extends SchemaEntry>(
  entry: Entry,
  descriptors: readonly KeywordDescriptor[] = DEFAULT_KEYWORDS,
): Entry[] => {
  const { schema, path, dataPath, depth } = entry;
  const entries: Entry[] = [];
  const childDepth = depth + 1;

  for (let d = 0, dl = descriptors.length; d < dl; d++) {
    const keyword = descriptors[d].keyword;
    if (!hasOwnProperty(schema, keyword)) continue;
    const node = (schema as Dictionary)[keyword];

    switch (descriptors[d].kind) {
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
        const contributesDataPath = descriptors[d].kind === 'objectMap';
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
