import { isArray, isObject } from '@winglet/common-utils/filter';

import type { KeywordDescriptor, SchemaEntry } from '../../../../../type';
import { appendListChildren } from './appendKeywordChildren/appendListChildren';
import { appendMapChildren } from './appendKeywordChildren/appendMapChildren';

/**
 * Capture one applicator's object children while preserving keyword-specific paths and variants.
 * @param entries Stack receiving fresh entries; no existing frame is changed.
 * @param schema Parent schema captured before reading any applicator values.
 * @param descriptor Matched vocabulary item in visit order.
 * @param path Captured parent schema path.
 * @param dataPath Captured parent data path.
 * @param depth Captured child depth, shared by all siblings.
 * @returns Nothing; malformed containers and non-object children are skipped.
 */
export function appendKeywordChildren<Entry extends SchemaEntry>(
  entries: Entry[],
  schema: Entry['schema'],
  descriptor: KeywordDescriptor,
  path: string,
  dataPath: string,
  depth: number,
): void {
  const { keyword, kind } = descriptor;
  const node = schema[keyword];
  switch (kind) {
    case 'schemaMap':
    case 'objectMap':
      appendMapChildren(
        entries,
        node,
        keyword,
        path,
        dataPath,
        depth,
        kind === 'objectMap',
      );
      break;
    case 'schemaList':
      if (isArray(node))
        appendListChildren(
          entries,
          node,
          keyword,
          path,
          dataPath,
          depth,
          false,
        );
      break;
    case 'items':
    case 'schema':
      if (kind === 'items' && isArray(node))
        appendListChildren(entries, node, keyword, path, dataPath, depth, true);
      else if (isObject(node))
        entries.push({
          schema: node,
          path: path + '/' + keyword,
          keyword,
          dataPath,
          depth,
        } as Entry);
      break;
  }
}
